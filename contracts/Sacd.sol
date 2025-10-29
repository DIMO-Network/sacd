// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {UUPSUpgradeable} from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import {AccessControlUpgradeable} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

import './interfaces/ISacd.sol';
import './interfaces/ITemplate.sol';

/**
 * @title Service Access Contract Definition (SACD)
 * @notice This contract manages permission records associated with specific ERC721 tokens
 * and payment records between users. It allows the owner of a token to grant and manage
 * permissions to other addresses (grantees), and these permissions are tied to a specific
 * ERC721 token. When a token is transferred, the permissions associated with it are invalidated.
 * The contract also tracks payment records between grantees and grantors, supporting both
 * asset-specific and fiat currency payments with expiration timestamps.
 */
contract Sacd is ISacd, Initializable, AccessControlUpgradeable, UUPSUpgradeable {
  struct SacdStorage {
    mapping(address asset => mapping(uint256 tokenId => uint256 version)) tokenIdToVersion;
    mapping(address asset => mapping(uint256 tokenId => mapping(uint256 version => mapping(address grantee => PermissionRecord)))) permissionRecords;
    mapping(address asset => mapping(address grantee => mapping(address grantor => mapping(uint256 paymentId => PaymentRecord)))) paymentRecords;
    // Track the next payment ID for each (asset, grantee, grantor) combination
    mapping(address asset => mapping(address grantee => mapping(address grantor => uint256))) nextPaymentId;
    address templateContract; // Address of the Template contract
    mapping(address grantor => mapping(address grantee => PermissionRecord)) accountPermissionRecords;
  }

  bytes32 constant ADMIN_ROLE = keccak256('ADMIN_ROLE');
  bytes32 constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');

  // keccak256(abi.encode(uint256(keccak256("Sacd.storage")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant SACD_STORAGE = 0x20aa246ca08ba235ee1e06ff6016f518804d64da710b8279d7124e598d8d5200;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the contract
   * @dev Sets default admin role to msg.sender
   * @param templateContractAddress The address of the Template contract
   */
  function initialize(address templateContractAddress) external initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ADMIN_ROLE, msg.sender);

    _getSacdStorage().templateContract = templateContractAddress;
  }

  /**
   * @notice Sets the template contract address
   * @dev Only admin can call this function
   * @param templateContractAddress The address of the Template contract
   */
  function setTemplateContract(address templateContractAddress) external onlyRole(ADMIN_ROLE) {
    _getSacdStorage().templateContract = templateContractAddress;
  }

  /**
   * @notice Sets a permission record to a grantee
   * @dev This is a function for backwards compatibility for permissions with templateId=0
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to receive the permission
   * @param permissions The uint256 that represents the byte array of permissions
   * @param expiration Timestamp when the permissions expire
   * @param source The URI source associated with the permissions
   */
  function setPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    string calldata source
  ) external {
    _setPermissions(asset, tokenId, grantee, permissions, expiration, 0, source);
  }

  /**
   * @notice Sets a permission record to a grantee with a template ID
   * @dev The caller must be the owner of the token or the asset contract.
   *      If a template is used, it validates that the template is active,
   *      matches the asset, and has compatible permissions.
   * @param asset The contract address of the ERC721 token
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to receive the permission
   * @param permissions The uint256 that represents the byte array of permissions
   * @param expiration Timestamp when the permissions expire
   * @param templateId The ID of the template used (0 if no template)
   * @param source The URI source associated with the permissions
   */
  function setPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    uint256 templateId,
    string calldata source
  ) external {
    _setPermissions(asset, tokenId, grantee, permissions, expiration, templateId, source);
  }

  /**
   * @notice Sets account-level permissions for a grantee without requiring an ERC721 token
   * @dev Creates a permission record directly between the caller (grantor) and the grantee.
   *      Unlike asset-specific permissions, these permissions are not tied to any token ID.
   *      If a template is used, it validates that the template is active and has compatible permissions.
   * @param grantee The address to receive the permission
   * @param permissions The uint256 that represents the byte array of permissions
   * @param expiration Timestamp when the permissions expire
   * @param templateId The ID of the template used (0 if no template)
   * @param source The URI source associated with the permissions
   */
  function setAccountPermissions(
    address grantee,
    uint256 permissions,
    uint256 expiration,
    uint256 templateId,
    string calldata source
  ) external {
    if (grantee == address(0)) {
      revert ZeroAddress();
    }

    // Validate template permissions if template is used
    _validateTemplateId(templateId, address(0), permissions);

    _getSacdStorage().accountPermissionRecords[msg.sender][grantee] = PermissionRecord(
      permissions,
      expiration,
      source,
      templateId
    );

    emit PermissionsSet(msg.sender, 0, permissions, grantee, expiration, templateId, source);
  }

  /**
   * @notice Sets a payment record from the caller to a grantor
   * @dev Creates a new payment record and increments the payment ID counter.
   *      Either asset or currency must be specified, but not both.
   *      Asset address(0) is used for fiat payments.
   * @param asset The asset contract address. Use address(0) for non-asset specific payments
   * @param grantor The address that receives the payment
   * @param amount The payment amount
   * @param expiration Timestamp when the payment record expires
   * @param currency The currency code (3 bytes) for the payment. Use 0x000000 for asset-specific payments
   * @param source The URI source associated with the payment, typically containing payment details
   * @custom:throws ZeroAddress If grantor address is zero
   * @custom:throws InvalidCurrency If both asset and currency are zero or if both are non-zero
   * @custom:emits PaymentSet When a payment record is successfully created
   */
  function setPayment(
    address asset,
    address grantor,
    uint256 amount,
    uint64 expiration,
    bytes3 currency,
    string calldata source
  ) external {
    if (grantor == address(0)) {
      revert ZeroAddress();
    }
    if (asset == address(0) && currency == 0x000000) {
      revert InvalidCurrency();
    }
    if (asset != address(0) && currency != 0x000000) {
      revert InvalidCurrency();
    }

    SacdStorage storage $ = _getSacdStorage();
    uint256 paymentId = $.nextPaymentId[asset][msg.sender][grantor]++;

    $.paymentRecords[asset][msg.sender][grantor][paymentId] = PaymentRecord({
      amount: amount,
      expiration: expiration,
      currency: currency,
      source: source
    });

    emit PaymentSet(asset, msg.sender, grantor, amount, expiration, source);
  }

  /**
   * @notice When a user transfers their token, the permissions must be reset
   * @dev This function should be called by the ERC721 contract when a transfer occurs.
   * It increments the version to invalidate old permissions.
   * @param asset The asset contract address
   * @param tokenId The transferred token ID
   */
  function onTransfer(address asset, uint256 tokenId) external {
    if (msg.sender != asset) {
      revert Unauthorized(msg.sender);
    }
    _getSacdStorage().tokenIdToVersion[asset][tokenId]++;
  }

  /**
   * @notice Checks if a user has an asset permission
   * @dev The permission is identified by its relative index in the byte array
   * @dev The owner of the token always has all permissions
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to be checked
   * @param permissionIndex The relative index of the permission
   * @return bool Returns true if the grantee has the specified permission and it has not expired, or if the grantee is the token owner
   */
  function hasPermission(
    address asset,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool) {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner == grantee) {
        return true;
      }
    } catch {
      return false;
    }

    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return (pr.permissions >> (2 * permissionIndex)) & 3 == 3;
    }

    return false;
  }

  /**
   * @notice Checks if a user has a set of asset permissions
   * @dev The owner of the token always has all permissions
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to be checked
   * @param permissions The uint256 that represents the byte array of permissions
   * @return bool Returns true if the grantee has all the specified permissions and they have not expired, or if the grantee is the token owner
   */
  function hasPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool) {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner == grantee) {
        return true;
      }
    } catch {
      return false;
    }

    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return (pr.permissions & permissions) == permissions;
    }

    return false;
  }

  /**
   * @notice Checks if a grantee has a specific account permission from a grantor
   * @dev The grantor always has all permissions
   *      The permission is identified by its relative index in the byte array.
   *      Returns false if the permission has expired or if the associated template is inactive.
   * @param grantor The address that granted the permission
   * @param grantee The address to be checked for the permission
   * @param permissionIndex The relative index of the permission to check
   * @return bool Returns true if the grantee has the specified permission and it has not expired
   */
  function hasAccountPermission(address grantor, address grantee, uint8 permissionIndex) external view returns (bool) {
    if (grantor == grantee) {
      return true;
    }

    SacdStorage storage $ = _getSacdStorage();

    PermissionRecord memory pr = $.accountPermissionRecords[grantor][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return (pr.permissions >> (2 * permissionIndex)) & 3 == 3;
    }

    return false;
  }

  /**
   * @notice Checks if a grantee has a set of account permissions from a grantor
   * @dev The grantor always has all permissions
   *      Returns false if the permissions have expired or if the associated template is inactive.
   *      Uses bitwise AND operation to verify that all requested permissions are present.
   * @param grantor The address that granted the permissions
   * @param grantee The address to be checked for the permissions
   * @param permissions The uint256 that represents the byte array of permissions to check
   * @return bool Returns true if the grantee has all the specified permissions and they have not expired
   */
  function hasAccountPermissions(address grantor, address grantee, uint256 permissions) external view returns (bool) {
    if (grantor == grantee) {
      return true;
    }

    SacdStorage storage $ = _getSacdStorage();

    PermissionRecord memory pr = $.accountPermissionRecords[grantor][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return (pr.permissions & permissions) == permissions;
    }

    return false;
  }

  /**
   * @notice Retrieves valid permissions for a grantee
   * @dev Returns the intersection of the grantee's permissions and the requested permissions.
   *      If the grantee is the token owner, all requested permissions are considered valid.
   *      If the token doesn't exist or the permissions have expired, no permissions are returned.
   * @param asset The contract address of the ERC721 token
   * @param tokenId The ID of the token for which permissions are being checked
   * @param grantee The address of the account whose permissions are being retrieved
   * @param permissions A bitmask representing the permissions to check against
   * @return uint256 A bitmask representing the valid permissions for the grantee
   */
  function getPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (uint256) {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner == grantee) {
        return permissions;
      }
    } catch {
      return 0;
    }

    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return pr.permissions & permissions;
    }

    return 0;
  }

  /**
   * @notice Retrieves valid account permissions for a grantee from a grantor
   * @dev Returns the intersection of the grantee's permissions and the requested permissions.
   *      If the grantor and grantee are the same address, all requested permissions are considered valid.
   *      If the permissions have expired or the associated template is inactive, no permissions are returned.
   * @param grantor The address that granted the permissions
   * @param grantee The address of the account whose permissions are being retrieved
   * @param permissions A bitmask representing the permissions to check against
   * @return uint256 A bitmask representing the valid permissions for the grantee
   */
  function getAccountPermissions(
    address grantor,
    address grantee,
    uint256 permissions
  ) external view returns (uint256) {
    if (grantor == grantee) {
      return permissions;
    }

    SacdStorage storage $ = _getSacdStorage();

    PermissionRecord memory pr = $.accountPermissionRecords[grantor][grantee];

    if (_isPermissionValid(pr.expiration, $.templateContract, pr.templateId)) {
      return pr.permissions & permissions;
    }

    return 0;
  }

  /**
   * @notice Returns the current token ID version of a specified asset
   * @param asset The asset contract address
   * @param tokenId The token ID
   */
  function tokenIdToVersion(address asset, uint256 tokenId) external view returns (uint256 version) {
    version = _getSacdStorage().tokenIdToVersion[asset][tokenId];
  }

  /**
   * @notice Return a permission record associated with the given parameters
   * @param asset The asset contract address
   * @param tokenId The token ID
   * @param version The token ID version
   * @param grantee The address to be checked
   */
  function permissionRecords(
    address asset,
    uint256 tokenId,
    uint256 version,
    address grantee
  ) external view returns (PermissionRecord memory permissionRecord) {
    permissionRecord = _getSacdStorage().permissionRecords[asset][tokenId][version][grantee];
  }

  /**
   * @notice Return the current permission record associated with the given parameters
   * @param asset The asset contract address
   * @param tokenId The token ID
   * @param grantee The address to be checked
   */
  function currentPermissionRecord(
    address asset,
    uint256 tokenId,
    address grantee
  ) external view returns (PermissionRecord memory permissionRecord) {
    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    permissionRecord = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];
  }

  /**
   * @notice Retrieves the account permission record between a grantor and grantee
   * @param grantor The address that granted the permissions
   * @param grantee The address that received the permissions
   * @return permissionRecord The permission record containing permissions, expiration, source, and templateId
   */
  function accountPermissionRecords(
    address grantor,
    address grantee
  ) external view returns (PermissionRecord memory permissionRecord) {
    permissionRecord = _getSacdStorage().accountPermissionRecords[grantor][grantee];
  }

  /**
   * @notice Retrieves a specific payment record based on the provided identifiers
   * @param asset The asset contract address. For non-asset specific payments, this will be address(0)
   * @param grantee The address that made the payment
   * @param grantor The address that received the payment
   * @param paymentId The unique identifier for the specific payment record
   * @return paymentRecord The payment record containing amount, expiration, currency, and source information
   */
  function paymentRecords(
    address asset,
    address grantee,
    address grantor,
    uint256 paymentId
  ) external view returns (PaymentRecord memory paymentRecord) {
    paymentRecord = _getSacdStorage().paymentRecords[asset][grantee][grantor][paymentId];
  }

  /**
   * @notice Retrieves the most recent payment record between a grantee and grantor
   * @dev Returns the latest payment record based on the nextPaymentId counter.
   *      If no payment records exist (nextPaymentId is 0), returns an empty record.
   * @param asset The asset contract address. For non-asset specific payments, this will be address(0)
   * @param grantee The address that made the payment
   * @param grantor The address that received the payment
   * @return paymentRecord The most recent payment record containing amount, expiration, currency, and source information
   */
  function currentPaymentRecord(
    address asset,
    address grantee,
    address grantor
  ) external view returns (PaymentRecord memory paymentRecord) {
    SacdStorage storage $ = _getSacdStorage();
    uint256 paymentId = $.nextPaymentId[asset][grantee][grantor];
    if (paymentId == 0) return paymentRecord;
    paymentRecord = _getSacdStorage().paymentRecords[asset][grantee][grantor][paymentId - 1];
  }

  /**
   * @notice Returns the next payment ID for a specific asset, grantee, and grantor combination
   * @param asset The asset contract address. For non-asset specific payments, this will be address(0)
   * @param grantee The address that makes payments
   * @param grantor The address that receives payments
   * @return paymentId The next available payment ID for the specified combination
   */
  function nextPaymentId(address asset, address grantee, address grantor) external view returns (uint256 paymentId) {
    paymentId = _getSacdStorage().nextPaymentId[asset][grantee][grantor];
  }

  /**
   * @notice Returns the address of the Template contract
   * @return template_ The template contract address
   */
  function templateContract() external view returns (address template_) {
    template_ = _getSacdStorage().templateContract;
  }

  /**
   * @notice Internal function to sets a permission record to a grantee with a template ID
   * @dev The caller must be the owner of the token or the asset contract.
   *      If a template is used, it validates that the template is active,
   *      matches the asset, and has compatible permissions.
   * @param asset The contract address of the ERC721 token
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to receive the permission
   * @param permissions The uint256 that represents the byte array of permissions
   * @param expiration Timestamp when the permissions expire
   * @param templateId The ID of the template used (0 if no template)
   * @param source The URI source associated with the permissions
   */
  function _setPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    uint256 templateId,
    string calldata source
  ) internal {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner != msg.sender && asset != msg.sender) {
        revert Unauthorized(msg.sender);
      }

      if (grantee == address(0)) {
        revert ZeroAddress();
      }

      // Validate template permissions if template is used
      _validateTemplateId(templateId, asset, permissions);

      SacdStorage storage $ = _getSacdStorage();

      uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
      $.permissionRecords[asset][tokenId][tokenIdVersion][grantee] = PermissionRecord(
        permissions,
        expiration,
        source,
        templateId
      );

      emit PermissionsSet(asset, tokenId, permissions, grantee, expiration, templateId, source);
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }
  }

  /**
   * @notice Validates that a template ID matches the expected asset and permissions
   * @dev If templateId is 0, validation is skipped. Otherwise, checks that:
   *      - The template contract is set
   *      - The template exists and is active
   *      - The template's asset matches the provided asset
   *      - The template's permissions match the provided permissions
   * @param templateId The ID of the template to validate (0 to skip validation)
   * @param asset The contract address of the ERC721 token that should match the template's asset
   * @param permissions The uint256 representing the byte array of permissions that should match the template's permissions
   */
  function _validateTemplateId(uint256 templateId, address asset, uint256 permissions) private view {
    if (templateId == 0) return;

    address template = _getSacdStorage().templateContract;

    if (template == address(0)) {
      revert TemplateContractNotSet();
    } else {
      try ITemplate(template).templates(templateId) returns (ITemplate.TemplateData memory templateData) {
        if (!templateData.isActive) {
          revert TemplateNotActive(templateId);
        }
        if (templateData.asset != asset) {
          revert TemplateAssetMismatch(templateId, templateData.asset, asset);
        }
        if (templateData.permissions != permissions) {
          revert TemplatePermissionsMismatch(templateId, templateData.permissions, permissions);
        }
      } catch {
        // If template contract call fails, assume template is invalid
        revert TemplateNotActive(templateId);
      }
    }
  }

  /**
   * @notice Checks if a permission is currently valid
   * @dev A permission is valid if it has not expired and its associated template (if any) is active.
   *      This is an internal helper function used by permission checking functions.
   * @param expiration The timestamp when the permission expires
   * @param template The address of the Template contract to validate against
   * @param templateId The ID of the template associated with the permission (0 if no template)
   * @return bool Returns true if the permission has not expired and the template is active, false otherwise
   */
  function _isPermissionValid(uint256 expiration, address template, uint256 templateId) private view returns (bool) {
    if (expiration <= block.timestamp) {
      return false;
    }

    // Early return for most common case (no template used)
    if (templateId == 0) return true;

    // Early return if no template contract set and template ID is defined
    if (template == address(0)) return false;

    try ITemplate(template).getTemplate(templateId) returns (ITemplate.TemplateData memory templateData) {
      return templateData.isActive;
    } catch {
      return false; // Template doesn't exist
    }
  }

  /**
   * @notice Internal function to authorize contract upgrade
   * @dev Caller must have the upgrader role
   * @param newImplementation New contract implementation address
   */
  function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

  /**
   * @dev Returns a pointer to the storage namespace
   */
  function _getSacdStorage() private pure returns (SacdStorage storage $) {
    assembly {
      $.slot := SACD_STORAGE
    }
  }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

import './interfaces/ISacd.sol';

/**
 * @title Service Access Contract Definition (SACD)
 * @notice This contract manages permission records associated with specific ERC721 tokens.
 * It allows the owner of a token to grant and manage permissions to other addresses (grantees),
 * and these permissions are tied to specific a ERC721 token. When a token is transferred,
 * the permissions associated with it are invalidated
 */
contract Sacd is ISacd, Initializable, AccessControlUpgradeable, UUPSUpgradeable {
  struct SacdStorage {
    mapping(address asset => mapping(uint256 tokenId => uint256 version)) tokenIdToVersion;
    mapping(address asset => mapping(uint256 tokenId => mapping(uint256 version => mapping(address grantee => PermissionRecord)))) permissionRecords;
  }

  bytes32 constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');

  // keccak256(abi.encode(uint256(keccak256("Sacd.storage")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant SACD_STORAGE = 0x20aa246ca08ba235ee1e06ff6016f518804d64da710b8279d7124e598d8d5200;

  event PermissionsSet(
    address indexed asset,
    uint256 indexed tokenId,
    uint256 permissions,
    address indexed grantee,
    uint256 expiration,
    string source
  );

  error ZeroAddress();
  error Unauthorized(address addr);
  error InvalidTokenId(address asset, uint256 tokenId);

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the contract
   * @dev Sets default admin role to msg.sender
   */
  function initialize() external initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  /**
   * @notice Sets a permission record to a grantee
   * @dev The caller must be the owner of the token or the asset contract
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param permissions The uint256 that represents the byte array of permissions
   * @param grantee The address to receive the permission
   * @param expiration Expiration of the permissions
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
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner != msg.sender && asset != msg.sender) {
        revert Unauthorized(msg.sender);
      }

      if (grantee == address(0)) {
        revert ZeroAddress();
      }

      SacdStorage storage $ = _getSacdStorage();

      uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
      $.permissionRecords[asset][tokenId][tokenIdVersion][grantee] = PermissionRecord(permissions, expiration, source);

      emit PermissionsSet(asset, tokenId, permissions, grantee, expiration, source);
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }
  }

  /**
   * @notice Checks if a user has a permission
   * @dev The permission is identified by its relative index in the byte array
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to be checked
   * @param permissionIndex The relative index of the permission
   * @return bool Returns true if the grantee has the specified permission and it has not expired
   */
  function hasPermission(
    address asset,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool) {
    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions >> (2 * permissionIndex)) & 3 == 3;
  }

  /**
   * @notice Checks if a user has a set of permissions
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to be checked
   * @param permissions The uint256 that represents the byte array of permissions
   * @return bool Returns true if the grantee has all the specified permissions and they have not expired
   */
  function hasPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool) {
    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions & permissions) == permissions;
  }

  /**
   * @notice Retrieves valid permissions for a grantee
   * @dev Returns the intersection of the grantee's permissions and the requested permissions
   * @param asset The contract address of the ERC721
   * @param tokenId Token ID associated with the permissions
   * @param grantee The address to be checked
   * @param permissions The uint256 that represents the byte array of permissions to be checked
   * @return uint256 Returns a uint256 that represents the valid permissions
   */
  function getPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (uint256) {
    SacdStorage storage $ = _getSacdStorage();

    uint256 tokenIdVersion = $.tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = $.permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (pr.expiration <= block.timestamp) {
      return 0;
    }
    return pr.permissions & permissions;
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

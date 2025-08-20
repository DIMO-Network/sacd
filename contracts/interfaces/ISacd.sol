// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title ISacd Interface
 * @dev Interface for the Service Access Contract Definition (SACD)
 * This interface defines the functions for setting, checking, and managing permissions
 * associated with specific ERC721 tokens
 */
interface ISacd {
  struct PermissionRecord {
    uint256 permissions;
    uint256 expiration;
    uint256 templateId; // 0 means no template was used
    string source;
  }

  struct PaymentRecord {
    uint256 amount;
    uint64 expiration;
    bytes3 currency;
    string source;
  }

  event PermissionsSet(
    address indexed asset,
    uint256 indexed tokenId,
    uint256 permissions,
    address indexed grantee,
    uint256 expiration,
    uint256 templateId,
    string source
  );
  event PaymentSet(
    address indexed asset,
    address indexed grantee,
    address indexed grantor,
    uint256 amount,
    uint256 expiration,
    string source
  );

  error ZeroAddress();
  error Unauthorized(address addr);
  error InvalidTokenId(address asset, uint256 tokenId);
  error TemplateNotActive(uint256 templateId);
  error TemplateContractNotSet();
  error InvalidCurrency();
  error TemplateAssetMismatch(uint256 templateId, address expectedAsset, address providedAsset);
  error TemplatePermissionsMismatch(uint256 templateId, uint256 expectedPermissions, uint256 providedPermissions);

  function setPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    string calldata source
  ) external;

  function setPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    uint256 templateId,
    string calldata source
  ) external;

  function setTemplateContract(address templateContractAddress) external;

  function hasPermission(
    address asset,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool);

  function hasPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool);

  function getPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (uint256);

  function onTransfer(address asset, uint256 tokenId) external;

  function tokenIdToVersion(address asset, uint256 tokenId) external view returns (uint256 version);

  function permissionRecords(
    address asset,
    uint256 tokenId,
    uint256 version,
    address grantee
  ) external view returns (PermissionRecord memory permissionRecord);

  function currentPermissionRecord(
    address asset,
    uint256 tokenId,
    address grantee
  ) external view returns (PermissionRecord memory permissionRecord);

  function paymentRecords(
    address asset,
    address grantee,
    address grantor,
    uint256 paymentId
  ) external view returns (PaymentRecord memory paymentRecord);

  function currentPaymentRecord(
    address asset,
    address grantee,
    address grantor
  ) external view returns (PaymentRecord memory paymentRecord);

  function nextPaymentId(address asset, address grantee, address grantor) external view returns (uint256 paymentId);
}

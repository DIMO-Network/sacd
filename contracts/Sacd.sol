// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

/**
 * @title Service Access Contract Definition (SACD)
 * @notice This contract manages permission records associated with specific assets (ERC721 tokens).
 * It allows the owner of a token to grant and manage permissions to other addresses (grantees),
 * and these permissions are tied to specific ERC721. When an token is transferred, the permissions
 * associated with it are reset.
 */
contract Sacd {
  struct PermissionRecord {
    uint256 permissions;
    uint256 expiration;
    string source;
  }

  mapping(address asset => mapping(uint256 tokenId => address sacd)) public sacds;
  mapping(address asset => mapping(uint256 tokenId => uint256 version)) public tokenIdToVersion;
  mapping(address asset => mapping(uint256 tokenId => mapping(uint256 version => mapping(address grantee => PermissionRecord))))
    public permissionRecords;

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

  constructor() {}

  /**
   * @notice Sets a permission record to a grantee
   * @dev The caller must be the owner of the token
   * @param asset The contract address
   * @param tokenId Token Id associated with the permissions
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
      // TODO Just for testing, it will be replaced soon
      if (tokenIdOwner != tx.origin) {
        revert Unauthorized(tx.origin);
      }

      if (grantee == address(0)) {
        revert ZeroAddress();
      }

      uint256 tokenIdVersion = tokenIdToVersion[asset][tokenId];
      permissionRecords[asset][tokenId][tokenIdVersion][grantee] = PermissionRecord(permissions, expiration, source);

      emit PermissionsSet(asset, tokenId, permissions, grantee, expiration, source);
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }
  }

  /**
   * @notice Checks if a user has a permission
   * @param asset The contract address
   * @param tokenId Token Id associated with the permissions
   * @param grantee The address to be checked
   * @param permissionIndex The relative index of the permission
   */
  function hasPermission(
    address asset,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool) {
    uint256 tokenIdVersion = tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions >> (2 * permissionIndex)) & 3 == 3;
  }

  /**
   * @notice Checks if a user has a set of permissions
   * @param asset The contract address
   * @param tokenId Token Id associated with the permissions
   * @param grantee The address to be checked
   * @param permissions The uint256 that represents the byte array of permissions
   */
  function hasPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool) {
    uint256 tokenIdVersion = tokenIdToVersion[asset][tokenId];
    PermissionRecord memory pr = permissionRecords[asset][tokenId][tokenIdVersion][grantee];

    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions & permissions) == permissions;
  }

  /**
   * @notice When a user transfers their token, the permissions must be reset
   * @dev Increases the version to reset the permissions
   * @param asset The asset contract address
   * @param tokenId The transferred token ID
   */
  function onTransfer(address asset, uint256 tokenId) external {
    if (msg.sender != asset) {
      revert Unauthorized(msg.sender);
    }
    tokenIdToVersion[asset][tokenId]++;
  }
}

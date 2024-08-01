// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';

error AlreadyInitialized();
error ZeroAddress();
error Unauthorized(address addr);
error InvalidTokenId(address asset, uint256 tokenId);

// TODO Documentation, explaing this contract represents a token Id and can have multiple grantees
contract Sacd {
  struct PermissionRecord {
    uint256 permissions;
    uint256 expiration;
    string source;
  }

  bool public initialized;
  address public asset;
  uint256 public tokenId;

  mapping(address grantee => PermissionRecord) public permissionRecords;

  event PermissionsSet(
    address indexed asset,
    uint256 indexed tokenId,
    uint256 permissions,
    address indexed grantee,
    uint256 expiration,
    string source
  );

  // TODO Documentation
  function initialize(address _asset, uint256 _tokenId) external {
    if (initialized) {
      revert AlreadyInitialized();
    }
    if (_asset == address(0)) {
      revert ZeroAddress();
    }
    if (_tokenId == 0) {
      revert InvalidTokenId(_asset, _tokenId);
    }

    initialized = true;
    asset = _asset;
    tokenId = _tokenId;
  }

  // TODO Documentation
  function setPermissions(
    uint256 _permissions,
    address _grantee,
    uint256 _expiration,
    string calldata _source
  ) external {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      // TODO Just for testing, it will be replaced soon
      if (tokenIdOwner != tx.origin) {
        revert Unauthorized(tx.origin);
      }
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }

    _setPermissions(_permissions, _grantee, _expiration, _source);
  }

  /**
   * @notice Checks if a user has a permission
   * @param grantee The address to be checked
   * @param permissionIndex The relative index of the permission
   */
  function hasPermission(address grantee, uint8 permissionIndex) external view returns (bool) {
    PermissionRecord memory pr = permissionRecords[grantee];
    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions >> permissionIndex) & 1 == 1;
  }

  /**
   * @notice Checks if a user has a set of permissions
   * @param grantee The address to be checked
   * @param permissions The uint256 that represents the byte array of permissions
   */
  function hasPermissions(address grantee, uint256 permissions) external view returns (bool) {
    PermissionRecord memory pr = permissionRecords[grantee];
    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions & permissions) == permissions;
  }

  // TODO Documentation
  function _setPermissions(
    uint256 _permissions,
    address _grantee,
    uint256 _expiration,
    string calldata _source
  ) private {
    permissionRecords[_grantee] = PermissionRecord(_permissions, _expiration, _source);

    emit PermissionsSet(asset, tokenId, _permissions, _grantee, _expiration, _source);
  }
}

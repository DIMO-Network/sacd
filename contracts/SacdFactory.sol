// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {ISacd} from './interfaces/ISacd.sol';
import {Sacd} from './Sacd.sol';

import 'hardhat/console.sol';

error Unauthorized(address addr);
error InvalidTokenId(address asset, uint256 tokenId);

// TODO Documentation
// TODO Make it upgradeable
// TODO Rename it to SACD if we really don't spawn contracts
contract SacdFactory {
  struct PermissionRecord {
    uint256 permissions;
    uint256 expiration;
    string source;
  }

  address public sacdTemplate;
  mapping(address asset => mapping(uint256 tokenId => address sacd)) public sacds;
  mapping(address asset => mapping(uint256 tokenId => mapping(address grantee => PermissionRecord)))
    public permissionRecords;

  event SacdCreated(address indexed sacd, address indexed asset, uint256 indexed tokenId);

  constructor(address _sacdTemplate) {
    sacdTemplate = _sacdTemplate;
  }

  // TODO rename this function?
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
  function set(
    address asset,
    uint256 tokenId,
    uint256 permissions,
    address grantee,
    uint256 expiration,
    string calldata source
  ) external returns (address sacd) {
    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      // TODO Just for testing, it will be replaced soon
      if (tokenIdOwner != tx.origin) {
        revert Unauthorized(tx.origin);
      }
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }

    permissionRecords[asset][tokenId][grantee] = PermissionRecord(permissions, expiration, source);

    sacd = sacds[asset][tokenId];

    if (sacd == address(0)) {
      sacd = Clones.clone(sacdTemplate);
      sacds[asset][tokenId] = sacd;
      // TODO maybe avoid setting perm in the init to emit SacdCreated first
      ISacd(sacd).initialize(asset, tokenId, permissions, grantee, expiration, source);
      emit SacdCreated(sacd, asset, tokenId);
    } else {
      ISacd(sacd).setPermissions(permissions, grantee, expiration, source);
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
    PermissionRecord memory pr = permissionRecords[asset][tokenId][grantee];
    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions >> permissionIndex) & 1 == 1;
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
    PermissionRecord memory pr = permissionRecords[asset][tokenId][grantee];
    if (pr.expiration <= block.timestamp) {
      return false;
    }
    return (pr.permissions & permissions) == permissions;
  }
}

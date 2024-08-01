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
  address public sacdTemplate;
  mapping(address asset => mapping(uint256 tokenId => address sacd)) public sacds;

  event SacdCreated(address indexed sacd, address indexed asset, uint256 indexed tokenId);

  constructor(address _sacdTemplate) {
    sacdTemplate = _sacdTemplate;
  }

  /**
   * @notice Creates a new SACD if not defined for the token ID
   * @dev The caller must be the owner of the token
   * @param asset The contract address
   * @param tokenId Token Id associated with the permissions
   */
  function createSacd(address asset, uint256 tokenId) external returns (address sacd) {
    sacd = sacds[asset][tokenId];
    if (sacd != address(0)) return sacd;

    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      // TODO Just for testing, it will be replaced soon
      if (tokenIdOwner != tx.origin) {
        revert Unauthorized(tx.origin);
      }
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }

    sacd = Clones.clone(sacdTemplate);
    sacds[asset][tokenId] = sacd;
    ISacd(sacd).initialize(asset, tokenId);

    emit SacdCreated(sacd, asset, tokenId);
  }

  /**
   * @notice Creates a new SACD if not defined for the token ID and sets a permission record to a grantee
   * @dev The caller must be the owner of the token
   * @param asset The contract address
   * @param tokenId Token Id associated with the permissions
   * @param permissions The uint256 that represents the byte array of permissions
   * @param grantee The address to receive the permission
   * @param expiration Expiration of the permissions
   * @param source The URI source associated with the permissions
   */
  function createSacd(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    string calldata source
  ) external returns (address sacd) {
    sacd = sacds[asset][tokenId];
    if (sacd != address(0)) return sacd;

    try IERC721(asset).ownerOf(tokenId) returns (address tokenIdOwner) {
      // TODO Just for testing, it will be replaced soon
      if (tokenIdOwner != tx.origin) {
        revert Unauthorized(tx.origin);
      }
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }

    sacd = Clones.clone(sacdTemplate);
    sacds[asset][tokenId] = sacd;
    ISacd(sacd).initialize(asset, tokenId);

    emit SacdCreated(sacd, asset, tokenId);

    // TODO maybe not all must be != 0
    if (permissions != 0 && grantee != address(0) && expiration != 0 && bytes(source).length > 0) {
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
    address sacd = sacds[asset][tokenId];
    if (sacd == address(0)) {
      return false;
    }
    return ISacd(sacd).hasPermission(grantee, permissionIndex);
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
    address sacd = sacds[asset][tokenId];
    if (sacd == address(0)) {
      return false;
    }
    return ISacd(sacd).hasPermissions(grantee, permissions);
  }
}

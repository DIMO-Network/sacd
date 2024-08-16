// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {IERC721Access} from './interfaces/IERC721Access.sol';
import {ERC721Access} from './ERC721Access.sol';

// TODO Documentation
// TODO Make it upgradeable
contract SacdManager {
  address public erc721AccessTemplate;
  mapping(address asset => mapping(uint256 tokenId => address sacd)) public sacds;

  event SacdCreated(address indexed sacd, address indexed asset, uint256 indexed tokenId);

  error Unauthorized(address addr);
  error InvalidTokenId(address asset, uint256 tokenId);

  constructor(address _erc721AccessTemplate) {
    erc721AccessTemplate = _erc721AccessTemplate;
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

      sacd = Clones.clone(erc721AccessTemplate);
      sacds[asset][tokenId] = sacd;
      IERC721Access(sacd).initialize(asset, tokenId, tokenIdOwner);

      emit SacdCreated(sacd, asset, tokenId);
    } catch {
      revert InvalidTokenId(asset, tokenId);
    }
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

      sacd = Clones.clone(erc721AccessTemplate);
      sacds[asset][tokenId] = sacd;
      IERC721Access(sacd).initialize(asset, tokenId, tokenIdOwner);

      emit SacdCreated(sacd, asset, tokenId);

      // TODO maybe not all must be != 0
      if (permissions != 0 && grantee != address(0) && expiration != 0 && bytes(source).length > 0) {
        IERC721Access(sacd).setPermissions(permissions, grantee, expiration, source);
      }
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
    address sacd = sacds[asset][tokenId];
    if (sacd == address(0)) {
      return false;
    }
    return IERC721Access(sacd).hasPermission(grantee, permissionIndex);
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
    return IERC721Access(sacd).hasPermissions(grantee, permissions);
  }

  // TODO Documentation
  function onTransfer(address asset, uint256 tokenId) external {
    if (msg.sender != asset) {
      revert Unauthorized(msg.sender);
    }

    sacds[asset][tokenId] = address(0);
  }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {ISacd} from './interfaces/ISacd.sol';
import {Sacd} from './Sacd.sol';

error Unauthorized(address addr);
error InvalidTokenId(address nftAddr, uint256 tokenId);

// TODO Documentation
// TODO Make it upgradeable
// TODO Rename it to SACD if we really don't spawn contracts
contract SacdFactory {
  struct PermissionRecord {
    uint256 permissions;
    uint256 expiry;
    string source;
  }

  mapping(address erc721Address => mapping(uint256 tokenId => mapping(address grantee => PermissionRecord)))
    public permissionRecords;

  event SacdCreated(address indexed nftAddress, uint256 indexed tokenId, uint256 permissions);

  constructor() {}

  // TODO Documentation
  function set(
    address nftAddr,
    uint256 tokenId,
    uint256 permissions,
    address grantee,
    uint256 expiration,
    string calldata source
  ) external {
    try IERC721(nftAddr).ownerOf(tokenId) returns (address tokenIdOwner) {
      // TODO Replace by _msgSender()
      if (tokenIdOwner != msg.sender) {
        revert Unauthorized(msg.sender);
      }
    } catch {
      revert InvalidTokenId(nftAddr, tokenId);
    }

    permissionRecords[nftAddr][tokenId][grantee] = PermissionRecord(permissions, expiration, source);

    emit SacdCreated(nftAddr, tokenId, permissions);
  }

  // TODO Documentation
  function hasPermission(
    address nftAddr,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool) {
    PermissionRecord memory pr = permissionRecords[nftAddr][tokenId][grantee];
    if (pr.expiry <= block.timestamp) {
      return false;
    }
    return (pr.permissions >> permissionIndex) & 1 == 1;
  }

  // TODO Documentation
  function hasPermissions(
    address nftAddr,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool) {
    PermissionRecord memory pr = permissionRecords[nftAddr][tokenId][grantee];
    if (pr.expiry <= block.timestamp) {
      return false;
    }
    return (pr.permissions & permissions) == permissions;
  }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {ISacd} from './interfaces/ISacd.sol';
import {Sacd} from './Sacd.sol';

error Unauthorized(address addr);
error InvalidTokenId(address nftAddr, uint256 tokenId);

// TODO Documentation
contract SacdFactory {
  address public sacdTemplate;

  event SacdCreated(
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 permissions,
    address indexed sacdAddress
  );

  constructor(address _sacdTemplate) {
    sacdTemplate = _sacdTemplate;
  }

  // TODO Documentation
  function createSacd(
    address nftAddr,
    uint256 tokenId,
    uint256 permissions,
    address grantee,
    uint256 expiration,
    string calldata source
  ) external returns (address clone) {
    try IERC721(nftAddr).ownerOf(tokenId) returns (address tokenIdOwner) {
      if (tokenIdOwner != msg.sender) {
        // TODO Replace by _msgSender()
        revert Unauthorized(msg.sender); // TODO Replace by _msgSender()
      }
    } catch {
      revert InvalidTokenId(nftAddr, tokenId);
    }

    clone = Clones.clone(sacdTemplate);
    ISacd(clone).initialize(nftAddr, tokenId, permissions, grantee, expiration, source);

    emit SacdCreated(nftAddr, tokenId, permissions, clone);
  }

  // TODO Documentation
  function hasPermission(
    uint256 tokenId,
    address grantee,
    address sacdAddr,
    uint8 permissionIndex
  ) external view returns (bool) {
    Sacd sacd = Sacd(sacdAddr);
    if (sacd.tokenId() != tokenId || sacd.grantee() != grantee || sacd.expiration() <= block.timestamp) {
      return false;
    }
    return (sacd.permissions() >> (2 * permissionIndex)) & 3 == 3;
  }

  // TODO Documentation
  function hasPermissions(
    uint256 tokenId,
    address grantee,
    address sacdAddr,
    uint256 permissions
  ) external view returns (bool) {
    Sacd sacd = Sacd(sacdAddr);
    if (sacd.tokenId() != tokenId || sacd.grantee() != grantee || sacd.expiration() <= block.timestamp) {
      return false;
    }
    return (sacd.permissions() & permissions) == permissions;
  }
}

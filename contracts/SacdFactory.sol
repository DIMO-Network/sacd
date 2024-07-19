// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {ISacd} from './interfaces/ISacd.sol';

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

    // TODO Check tokenId ownership
    clone = Clones.clone(sacdTemplate);
    ISacd(clone).initialize(nftAddr, tokenId, permissions, grantee, expiration, source);

    emit SacdCreated(nftAddr, tokenId, permissions, clone);
  }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';

import {ISacd} from './interfaces/ISacd.sol';

// TODO Documentation
contract SacdFactory {
  event SacdCreated(
    address indexed nftAddress,
    uint256 indexed tokenId,
    uint256 permissions,
    address indexed sacdAddress
  );

  address public sacdTemplate;

  constructor(address _sacdTemplate) {
    sacdTemplate = _sacdTemplate;
  }

  // TODO Documentation
  function createSacd(
    address nftAddr,
    uint256 tokenId,
    uint256 permissions,
    address grantee, // TODO replace grantee by _msgSender()
    uint256 expiration,
    string calldata source
  ) external returns (address clone) {
    // TODO Check tokenId ownership
    clone = Clones.clone(sacdTemplate);
    ISacd(clone).initialize(nftAddr, tokenId, permissions, grantee, expiration, source);

    emit SacdCreated(nftAddr, tokenId, permissions, clone);
  }
}

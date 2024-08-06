// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

/**
 * @title MockERC721
 * @dev Mocks a generic ERC721 to be used in tests
 */
contract MockERC721 is ERC721 {
  uint256 tokenCount;

  constructor() ERC721('Mock DIMO', 'MD') {}

  function mint(address account) external {
    _mint(account, ++tokenCount);
  }

  function burn(uint256 tokenId) external {
    _burn(tokenId);
  }
}

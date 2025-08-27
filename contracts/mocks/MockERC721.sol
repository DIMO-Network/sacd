// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import '../interfaces/ISacd.sol';

/**
 * @title MockERC721
 * @dev Mocks a generic ERC721 to be used in tests
 */
contract MockERC721 is ERC721 {
  constructor() ERC721('Mock DIMO', 'MD') {}

  function mint(address account) external {
    _mint(account, 1);
  }
}

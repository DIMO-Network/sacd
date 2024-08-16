// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.13;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import '../interfaces/ISacdManager.sol';

/**
 * @title MockERC721withSacd
 * @dev Mocks a generic ERC721 to be used in tests
 */
contract MockERC721withSacd is ERC721 {
  uint256 tokenCount;
  address sacdManager;

  constructor(address _sacdManager) ERC721('Mock DIMO', 'MD') {
    sacdManager = _sacdManager;
  }

  function mint(address account) external {
    _mint(account, ++tokenCount);
  }

  function burn(uint256 tokenId) external {
    _burn(tokenId);
  }

  function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
    ISacdManager(sacdManager).onTransfer(address(this), tokenId);
    return super._update(to, tokenId, auth);
  }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import '../interfaces/ISacd.sol';

/**
 * @title MockERC721withSacd
 * @dev Mocks a generic ERC721 to be used in tests
 */
contract MockERC721withSacd is ERC721 {
  struct SacdInput {
    address grantee;
    uint256 permissions;
    uint256 expiration;
    string source;
  }

  uint256 tokenCount;
  address sacd;

  constructor(address _sacd) ERC721('Mock DIMO', 'MD') {
    sacd = _sacd;
  }

  function mint(address account) external {
    _mint(account, ++tokenCount);
  }

  function mintWithSacd(address account, SacdInput calldata sacdInput) external {
    _mint(account, ++tokenCount);
    ISacd(sacd).setPermissions(
      address(this),
      tokenCount,
      sacdInput.grantee,
      sacdInput.permissions,
      sacdInput.expiration,
      sacdInput.source
    );
  }

  function burn(uint256 tokenId) external {
    _burn(tokenId);
  }

  function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
    ISacd(sacd).onTransfer(address(this), tokenId);
    return super._update(to, tokenId, auth);
  }
}

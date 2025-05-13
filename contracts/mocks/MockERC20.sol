// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title MockERC20
 * @dev Mocks a generic ERC20 to be used in tests
 */
contract MockERC20 is ERC20 {
  constructor() ERC20('Mock ERC20', 'M20') {}

  function mint(address account, uint256 value) external {
    _mint(account, value);
  }
}

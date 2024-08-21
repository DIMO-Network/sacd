// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Context} from '@openzeppelin/contracts/utils/Context.sol';

// TODO Docs adapted from OZ
/**
 * @dev Context variant with ERC2771 support.
 *
 * WARNING: Avoid using this pattern in contracts that rely in a specific calldata length as they'll
 * be affected by any forwarder whose `msg.data` is suffixed with the `from` address according to the ERC2771
 * specification adding the address size in bytes (20) to the calldata size. An example of an unexpected
 * behavior could be an unintended fallback (or another function) invocation while trying to invoke the `receive`
 * function only accessible if `msg.data.length == 0`.
 *
 * WARNING: The usage of `delegatecall` in this contract is dangerous and may result in context corruption.
 * Any forwarded request to this contract triggering a `delegatecall` to itself will result in an invalid {_msgSender}
 * recovery.
 */
abstract contract ERC2771Context is Context {
  mapping(address => bool) public trustedForwarders;

  // TODO Documentation
  function setTrustedForwarder(address addr, bool trusted) public virtual {
    trustedForwarders[addr] = trusted;
  }

  /**
   * @dev Indicates whether any particular address is the trusted forwarder.
   */
  function isTrustedForwarder(address forwarder) public view virtual returns (bool) {
    return trustedForwarders[forwarder];
  }

  /**
   * @dev Override for `msg.sender`. Defaults to the original `msg.sender` whenever
   * a call is not performed by the trusted forwarder or the calldata length is less than
   * 20 bytes (an address length).
   */
  function _msgSender() internal view virtual override returns (address) {
    uint256 calldataLength = msg.data.length;
    uint256 contextSuffixLength = _contextSuffixLength();
    if (isTrustedForwarder(msg.sender) && calldataLength >= contextSuffixLength) {
      return address(bytes20(msg.data[calldataLength - contextSuffixLength:]));
    } else {
      return super._msgSender();
    }
  }

  /**
   * @dev Override for `msg.data`. Defaults to the original `msg.data` whenever
   * a call is not performed by the trusted forwarder or the calldata length is less than
   * 20 bytes (an address length).
   */
  function _msgData() internal view virtual override returns (bytes calldata) {
    uint256 calldataLength = msg.data.length;
    uint256 contextSuffixLength = _contextSuffixLength();
    if (isTrustedForwarder(msg.sender) && calldataLength >= contextSuffixLength) {
      return msg.data[:calldataLength - contextSuffixLength];
    } else {
      return super._msgData();
    }
  }

  /**
   * @dev ERC-2771 specifies the context as being a single address (20 bytes).
   */
  function _contextSuffixLength() internal view virtual override returns (uint256) {
    return 20;
  }
}

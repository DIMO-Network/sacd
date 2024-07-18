// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// TODO Documentation
contract Sacd {
  error AlreadyInitialized();

  bool public initialized;
  address public nftAddr;
  uint256 public tokenId;
  uint256 public permissions;
  address public grantee;
  uint256 public expiration;
  string public source;

  // TODO Documentation
  function initialize(
    address _nftAddr,
    uint256 _tokenId,
    uint256 _permissions,
    address _grantee,
    uint256 _expiration,
    string calldata _source
  ) external {
    if (initialized) {
      revert AlreadyInitialized();
    }
    // TODO Make other checks

    initialized = true;
    nftAddr = _nftAddr;
    tokenId = _tokenId;
    permissions = _permissions;
    grantee = _grantee;
    expiration = _expiration;
    source = _source;
  }
}

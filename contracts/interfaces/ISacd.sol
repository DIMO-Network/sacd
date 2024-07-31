// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// TODO Documentation
interface ISacd {
  function initialize(
    address _asset,
    uint256 _tokenId,
    address _grantee,
    uint256 _permissions,
    uint256 _expiration,
    string calldata _source
  ) external;

  function setPermissions(
    uint256 _permissions,
    address _grantee,
    uint256 _expiration,
    string calldata _source
  ) external;
}

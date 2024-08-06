// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// TODO Documentation
interface ISacdFactory {
  function createSacd(address asset, uint256 tokenId) external returns (address sacd);

  function createSacd(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions,
    uint256 expiration,
    string calldata source
  ) external returns (address sacd);

  function hasPermission(
    address asset,
    uint256 tokenId,
    address grantee,
    uint8 permissionIndex
  ) external view returns (bool);

  function hasPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (bool);

  function onTransfer(address asset, uint256 tokenId) external;
}

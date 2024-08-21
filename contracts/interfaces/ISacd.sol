// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/**
 * @title ISacd Interface
 * @dev Interface for the Service Access Contract Definition (SACD)
 * This interface defines the functions for setting, checking, and managing permissions
 * associated with specific ERC721 tokens
 */
interface ISacd {
  function setSacd(
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

  function getPermissions(
    address asset,
    uint256 tokenId,
    address grantee,
    uint256 permissions
  ) external view returns (uint256);

  function onTransfer(address asset, uint256 tokenId) external;
}

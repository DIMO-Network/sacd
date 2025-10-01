// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

/**
 * @title ITemplate Interface
 * @dev Interface for the Template contract that manages predefined templates
 * for SACD creation with bit arrays and IPFS URLs
 */
interface ITemplate is IERC721 {
  struct TemplateData {
    address asset;
    uint256 permissions;
    string source;
    bool isActive;
  }

  event TemplateCreated(
    uint256 indexed templateId,
    address indexed creator,
    address indexed asset,
    uint256 permissions,
    string cid
  );
  event TemplateDeactivated(uint256 indexed templateId);

  error TemplateNotFound(uint256 templateId);
  error Unauthorized(address caller, uint256 templateId);
  error InvalidTemplateData();
  error TemplateAlreadyExists(uint256 templateId);

  function createTemplate(
    address owner,
    address asset,
    uint256 permissions,
    string calldata source
  ) external returns (uint256 templateId);

  function deactivateTemplate(uint256 templateId) external;

  function templates(uint256 templateId) external view returns (TemplateData memory templateData);

  function getTemplate(uint256 templateId) external view returns (TemplateData memory template);

  function isTemplateActive(uint256 templateId) external view returns (bool);
}

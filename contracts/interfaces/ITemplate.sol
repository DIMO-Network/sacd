// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

/**
 * @title ITemplate Interface
 * @dev Interface for the Template contract that manages predefined templates
 * for SACD creation with bit arrays and IPFS URLs
 */
interface ITemplate {
  struct Template {
    uint256 templateId;
    address creator;
    uint256 permissions;
    string ipfsUrl;
    bool isActive;
    uint256 createdAt;
  }

  struct SacdWithTemplate {
    address asset;
    uint256 tokenId;
    address grantee;
    uint256 templateId;
    uint256 expiration;
    string source;
  }

  event TemplateCreated(uint256 indexed templateId, address indexed creator, uint256 permissions, string ipfsUrl);

  event TemplateDeactivated(uint256 indexed templateId, address indexed creator);

  error TemplateNotFound(uint256 templateId);
  error UnauthorizedTemplateAccess(address caller, uint256 templateId);
  error InvalidTemplateData();
  error TemplateAlreadyExists(uint256 templateId);

  function createTemplate(uint256 permissions, string calldata ipfsUrl) external returns (uint256 templateId);

  function deactivateTemplate(uint256 templateId) external;

  function getTemplate(uint256 templateId) external view returns (Template memory);

  function getTemplatesByCreator(address creator) external view returns (uint256[] memory);

  function getTemplateCount() external view returns (uint256);

  function isTemplateActive(uint256 templateId) external view returns (bool);
}

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
    uint256 permissions;
    string templateURI;
    bool isActive;
  }

  event TemplateCreated(uint256 indexed templateId, address indexed creator, uint256 permissions, string ipfsUrl);
  event TemplateDeactivated(uint256 indexed templateId);

  error TemplateNotFound(uint256 templateId);
  error UnauthorizedTemplateAccess(address caller, uint256 templateId);
  error InvalidTemplateData();
  error TemplateAlreadyExists(uint256 templateId);

  function createTemplate(
    address owner,
    uint256 permissions,
    string calldata templateURI
  ) external returns (uint256 templateId);

  function deactivateTemplate(uint256 templateId) external;

  function getTemplate(uint256 templateId) external view returns (TemplateData memory);

  function isTemplateActive(uint256 templateId) external view returns (bool);
}

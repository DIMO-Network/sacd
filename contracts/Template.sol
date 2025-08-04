// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/ITemplate.sol';

/**
 * @title Template Contract
 * @notice This contract manages predefined templates for SACD creation.
 * Templates include predefined bit arrays (permissions) and IPFS URLs to templatable JSON documents.
 * Each template is associated with a creator's public key and can be used to create SACD permissions.
 */
contract Template is ITemplate, Initializable, AccessControlUpgradeable, UUPSUpgradeable {
  using Strings for uint256;

  struct TemplateStorage {
    mapping(uint256 => Template) templates;
    mapping(address => uint256[]) creatorTemplates;
    uint256 templateCounter;
  }

  bytes32 constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');
  bytes32 constant TEMPLATE_MANAGER_ROLE = keccak256('TEMPLATE_MANAGER_ROLE');

  // keccak256(abi.encode(uint256(keccak256("Template.storage")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant TEMPLATE_STORAGE = 0x20aa246ca08ba235ee1e06ff6016f518804d64da710b8279d7124e598d8d5201;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the contract
   * @dev Sets default admin role to msg.sender
   */
  function initialize() external initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(TEMPLATE_MANAGER_ROLE, msg.sender);
  }

  /**
   * @notice Creates a new template with predefined permissions and IPFS URL
   * @dev Only template managers can create templates
   * @param permissions The uint256 that represents the byte array of permissions
   * @param ipfsUrl The IPFS URL to the templatable JSON document
   * @return templateId The unique identifier for the created template
   */
  function createTemplate(
    uint256 permissions,
    string calldata ipfsUrl
  ) external onlyRole(TEMPLATE_MANAGER_ROLE) returns (uint256 templateId) {
    if (bytes(ipfsUrl).length == 0) {
      revert InvalidTemplateData();
    }

    TemplateStorage storage $ = _getTemplateStorage();

    templateId = ++$.templateCounter;

    Template memory newTemplate = Template({
      templateId: templateId,
      creator: msg.sender,
      permissions: permissions,
      ipfsUrl: ipfsUrl,
      isActive: true,
      createdAt: block.timestamp
    });

    $.templates[templateId] = newTemplate;
    $.creatorTemplates[msg.sender].push(templateId);

    emit TemplateCreated(templateId, msg.sender, permissions, ipfsUrl);
  }

  /**
   * @notice Deactivates a template
   * @dev Only the template creator can deactivate their templates
   * @param templateId The ID of the template to deactivate
   */
  function deactivateTemplate(uint256 templateId) external {
    TemplateStorage storage $ = _getTemplateStorage();
    Template storage template = $.templates[templateId];

    if (template.creator == address(0)) {
      revert TemplateNotFound(templateId);
    }

    if (template.creator != msg.sender) {
      revert UnauthorizedTemplateAccess(msg.sender, templateId);
    }

    template.isActive = false;

    emit TemplateDeactivated(templateId, msg.sender);
  }

  /**
   * @notice Retrieves a template by its ID
   * @param templateId The ID of the template to retrieve
   * @return The template data
   */
  function getTemplate(uint256 templateId) external view returns (Template memory) {
    TemplateStorage storage $ = _getTemplateStorage();
    Template memory template = $.templates[templateId];

    if (template.creator == address(0)) {
      revert TemplateNotFound(templateId);
    }

    return template;
  }

  /**
   * @notice Gets all template IDs created by a specific address
   * @param creator The address of the template creator
   * @return Array of template IDs
   */
  function getTemplatesByCreator(address creator) external view returns (uint256[] memory) {
    TemplateStorage storage $ = _getTemplateStorage();
    return $.creatorTemplates[creator];
  }

  /**
   * @notice Gets the total number of templates created
   * @return The total template count
   */
  function getTemplateCount() external view returns (uint256) {
    return _getTemplateStorage().templateCounter;
  }

  /**
   * @notice Checks if a template is active
   * @param templateId The ID of the template to check
   * @return True if the template exists and is active
   */
  function isTemplateActive(uint256 templateId) external view returns (bool) {
    TemplateStorage storage $ = _getTemplateStorage();
    Template memory template = $.templates[templateId];
    return template.creator != address(0) && template.isActive;
  }

  /**
   * @notice Internal function to authorize contract upgrade
   * @dev Caller must have the upgrader role
   * @param newImplementation New contract implementation address
   */
  function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

  /**
   * @dev Returns a pointer to the storage namespace
   */
  function _getTemplateStorage() private pure returns (TemplateStorage storage $) {
    assembly {
      $.slot := TEMPLATE_STORAGE
    }
  }
}

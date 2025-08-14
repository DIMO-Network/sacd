// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';

import './interfaces/ITemplate.sol';

/**
 * @title Template Contract
 * @notice This contract manages predefined templates for SACD creation.
 * Templates include predefined bit arrays (permissions) and IPFS URLs to templatable JSON documents.
 * Each template is associated with a creator's public key and can be used to create SACD permissions.
 */
contract Template is Initializable, AccessControlUpgradeable, UUPSUpgradeable, ERC721Upgradeable, ITemplate {
  struct TemplateStorage {
    uint256 templateCounter;
    mapping(uint256 => TemplateData) templates;
  }

  bytes32 constant UPGRADER_ROLE = keccak256('UPGRADER_ROLE');
  bytes32 constant TEMPLATE_MANAGER_ROLE = keccak256('TEMPLATE_MANAGER_ROLE');

  // keccak256(abi.encode(uint256(keccak256("Template.storage")) - 1)) & ~bytes32(uint256(0xff))
  bytes32 private constant TEMPLATE_STORAGE = 0x6e0b5146e4c8d8af829e0b4f4e89995b530da6fe47704a595a78d8a3f6303800;

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
    __ERC721_init('Template', 'TMPL');

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(TEMPLATE_MANAGER_ROLE, msg.sender);
  }

  /**
   * @notice Creates a new template with predefined permissions and template URI
   * @dev Only template managers can create templates
   * @param permissions The uint256 that represents the byte array of permissions
   * @param templateURI The URI to the templatable JSON document
   * @return templateId The unique identifier for the created template
   */
  function createTemplate(
    uint256 permissions,
    string calldata templateURI
  ) external onlyRole(TEMPLATE_MANAGER_ROLE) returns (uint256 templateId) {
    if (bytes(templateURI).length == 0) {
      revert InvalidTemplateData();
    }

    TemplateStorage storage $ = _getTemplateStorage();

    templateId = ++$.templateCounter;

    TemplateData memory newTemplate = TemplateData({
      templateId: templateId,
      owner: msg.sender,
      permissions: permissions,
      templateURI: templateURI,
      isActive: true,
      createdAt: block.timestamp
    });

    $.templates[templateId] = newTemplate;

    // Mint NFT to the creator
    _mint(msg.sender, templateId);

    emit TemplateCreated(templateId, msg.sender, permissions, templateURI);
  }

  /**
   * @notice Deactivates a template
   * @dev Only the template creator can deactivate their templates
   * @param templateId The ID of the template to deactivate
   */
  function deactivateTemplate(uint256 templateId) external {
    // Check if caller owns the template NFT
    if (ownerOf(templateId) != msg.sender) {
      revert UnauthorizedTemplateAccess(msg.sender, templateId);
    }

    TemplateStorage storage $ = _getTemplateStorage();
    TemplateData storage template = $.templates[templateId];

    if (template.owner == address(0)) {
      revert TemplateNotFound(templateId);
    }

    template.isActive = false;

    emit TemplateDeactivated(templateId, msg.sender);
  }

  /**
   * @notice Retrieves a template by its ID
   * @param templateId The ID of the template to retrieve
   * @return The template data
   */
  function getTemplate(uint256 templateId) external view returns (TemplateData memory) {
    TemplateStorage storage $ = _getTemplateStorage();
    TemplateData memory template = $.templates[templateId];

    if (template.owner == address(0)) {
      revert TemplateNotFound(templateId);
    }

    return template;
  }

  /**
   * @notice Checks if a template is active
   * @param templateId The ID of the template to check
   * @return True if the template exists and is active
   */
  function isTemplateActive(uint256 templateId) external view returns (bool) {
    TemplateStorage storage $ = _getTemplateStorage();
    TemplateData memory template = $.templates[templateId];

    // Check if template exists and is active
    if (template.owner == address(0)) {
      return false;
    }

    return template.isActive;
  }

  /**
   * @notice Returns the token URI for a given template ID
   * @dev Overrides ERC721 tokenURI function
   * @param tokenId The template ID
   * @return The token URI
   */
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    TemplateStorage storage $ = _getTemplateStorage();
    TemplateData memory template = $.templates[tokenId];

    if (template.owner == address(0)) {
      revert TemplateNotFound(tokenId);
    }

    // If template URI starts with ipfs://, prepend DIMO assets URL
    if (bytes(template.templateURI).length >= 7) {
      (string memory prefix, string memory suffix) = _splitAt(template.templateURI, 7);
      if (keccak256(abi.encodePacked(prefix)) == keccak256(abi.encodePacked('ipfs://'))) {
        return string.concat('https://assets.dimo.org/', suffix);
      }
    }

    // Otherwise return the template URI as-is
    return template.templateURI;
  }

  /**
   * @notice Returns the total supply of templates
   * @dev Overrides ERC721 totalSupply function
   * @return The total number of templates
   */
  function totalSupply() public view virtual returns (uint256) {
    return _getTemplateStorage().templateCounter;
  }

  /**
   * @notice Override supportsInterface to handle multiple inheritance
   * @param interfaceId The interface ID to check
   * @return True if the interface is supported
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(AccessControlUpgradeable, ERC721Upgradeable, IERC165) returns (bool) {
    return AccessControlUpgradeable.supportsInterface(interfaceId) || ERC721Upgradeable.supportsInterface(interfaceId);
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

  /**
   * @dev Helper function to split a string into two parts at a specified index
   * @param str The string to split
   * @param splitIndex The index at which to split the string
   * @return prefix The part of the string from index 0 to splitIndex-1
   * @return suffix The part of the string from splitIndex to the end
   */
  function _splitAt(string memory str, uint256 splitIndex) private pure returns (string memory, string memory) {
    bytes memory strBytes = bytes(str);
    bytes memory prefixBytes = new bytes(splitIndex);
    bytes memory suffixBytes = new bytes(strBytes.length - splitIndex);

    for (uint256 i = 0; i < splitIndex; i++) {
      prefixBytes[i] = strBytes[i];
    }
    for (uint256 i = splitIndex; i < strBytes.length; i++) {
      suffixBytes[i - splitIndex] = strBytes[i];
    }
    return (string(prefixBytes), string(suffixBytes));
  }
}

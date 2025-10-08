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
    string baseURI;
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
   * @param admin Address that will be granted admin, template manager, and upgrader roles
   * @param baseURI_ The base URI for template metadata that will be used for token URIs
   */
  function initialize(address admin, string calldata baseURI_) external initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();
    __ERC721_init('Template', 'TMPL');

    _getTemplateStorage().baseURI = baseURI_;

    _grantRole(DEFAULT_ADMIN_ROLE, admin);
    _grantRole(TEMPLATE_MANAGER_ROLE, admin);
    _grantRole(UPGRADER_ROLE, admin);
  }

  /**
   * @notice Creates a new template with predefined permissions and template URI
   * @dev Only template managers can create templates
   * @param asset The contract address of the ERC721
   * @param permissions The uint256 that represents the byte array of permissions
   * @param cid The URI to the templatable JSON document (must be IPFS CID)
   * @return templateId The unique identifier for the created template
   */
  function createTemplate(
    address owner,
    address asset,
    uint256 permissions,
    string calldata cid
  ) external onlyRole(TEMPLATE_MANAGER_ROLE) returns (uint256 templateId) {
    // Verify this is a valid IPFS CID
    _validateCID(cid);

    TemplateStorage storage $ = _getTemplateStorage();

    // Generate deterministic ID from the IPFS CID
    templateId = uint256(keccak256(bytes(cid)));

    if (_ownerOf(templateId) != address(0)) {
      revert TemplateAlreadyExists(templateId);
    }

    TemplateData memory newTemplate = TemplateData({
      asset: asset,
      permissions: permissions,
      source: cid,
      isActive: true
    });

    $.templates[templateId] = newTemplate;

    _safeMint(owner, templateId);

    emit TemplateCreated(templateId, owner, asset, permissions, cid);
    emit TemplateActivated(templateId);
  }

  /**
   * @notice Deactivates a template
   * @dev Only the template creator can deactivate their templates
   * @param templateId The ID of the template to deactivate
   */
  function deactivateTemplate(uint256 templateId) external {
    address templateOwner = _ownerOf(templateId);

    if (templateOwner == address(0)) {
      revert TemplateNotFound(templateId);
    }

    // Check if caller owns the template NFT
    if (templateOwner != msg.sender) {
      revert Unauthorized(msg.sender, templateId);
    }

    TemplateStorage storage $ = _getTemplateStorage();

    if (!$.templates[templateId].isActive) {
      revert TemplateAlreadyDeactivated(templateId);
    }

    _getTemplateStorage().templates[templateId].isActive = false;

    emit TemplateDeactivated(templateId);
  }

  /**
   * @notice Retrieves a template by its ID
   * @dev Use this function in the SACD contract to perform only one call
   * @param templateId The ID of the template to retrieve
   * @return template The template data
   */
  function getTemplate(uint256 templateId) external view returns (TemplateData memory template) {
    if (_ownerOf(templateId) == address(0)) {
      revert TemplateNotFound(templateId);
    }

    template = _getTemplateStorage().templates[templateId];
  }

  /**
   * @notice Checks if a template is active
   * @param templateId The ID of the template to check
   * @return isActive True if the template exists and is active
   */
  function isTemplateActive(uint256 templateId) external view returns (bool isActive) {
    // Check if template exists and is active
    if (_ownerOf(templateId) == address(0)) {
      return false;
    }

    isActive = _getTemplateStorage().templates[templateId].isActive;
  }

  /**
   * @notice Returns the base URI used for token metadata
   */
  function baseURI() external view returns (string memory) {
    return _getTemplateStorage().baseURI;
  }

  /**
   * @notice Returns the TemplateData associated with a template ID
   */
  function templates(uint256 templateId) external view returns (TemplateData memory templateData) {
    templateData = _getTemplateStorage().templates[templateId];
  }

  /**
   * @notice Returns the token URI for a given template ID
   * @dev Overrides ERC721 tokenURI function
   * @param tokenId The template ID
   * @return The token URI
   */
  function tokenURI(uint256 tokenId) public view override returns (string memory) {
    TemplateStorage storage $ = _getTemplateStorage();
    string memory source = $.templates[tokenId].source;

    if (bytes(source).length > 0) {
      return string.concat($.baseURI, source);
    }

    return source;
  }

  /**
   * @notice Override supportsInterface to handle multiple inheritance
   * @param interfaceId The interface ID to check
   * @return True if the interface is supported
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(AccessControlUpgradeable, ERC721Upgradeable, IERC165) returns (bool) {
    return AccessControlUpgradeable.supportsInterface(interfaceId) || ERC721Upgradeable.supportsInterface(interfaceId);
  }

  /**
   * @notice Override _baseURI
   */
  function _baseURI() internal view override returns (string memory) {
    return _getTemplateStorage().baseURI;
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
   * @notice Validates that a string is a valid IPFS CIDv0
   * @dev Performs basic validation by checking the length and prefix of the CID
   * @param cid The IPFS CID string to validate
   * @custom:throws InvalidTemplateData if the CID is not a valid CIDv0 format (46 characters starting with "Qm")
   */
  function _validateCID(string memory cid) private pure {
    bytes memory cidBytes = bytes(cid);

    if (cidBytes.length != 46 || cidBytes[0] != 'Q' || cidBytes[1] != 'm') {
      revert InvalidTemplateData();
    }
  }
}

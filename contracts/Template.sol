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
    bytes baseURI;
    mapping(uint256 => TemplateData) templates;
  }

  bytes constant IPFS_PREFIX = bytes('ipfs://');
  uint256 constant IPFS_PREFIX_LENGTH = 7;
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
   * @param baseURI_ The base URI for template metadata that will be used for token URIs
   */
  function initialize(string calldata baseURI_) external initializer {
    __AccessControl_init();
    __UUPSUpgradeable_init();
    __ERC721_init('Template', 'TMPL');

    _getTemplateStorage().baseURI = bytes(baseURI_);

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(TEMPLATE_MANAGER_ROLE, msg.sender);
  }

  /**
   * @notice Creates a new template with predefined permissions and template URI
   * @dev Only template managers can create templates
   * @param asset The contract address of the ERC721
   * @param permissions The uint256 that represents the byte array of permissions
   * @param source The URI to the templatable JSON document (must be IPFS URI)
   * @return templateId The unique identifier for the created template
   */
  function createTemplate(
    address owner,
    address asset,
    uint256 permissions,
    string calldata source
  ) external onlyRole(TEMPLATE_MANAGER_ROLE) returns (uint256 templateId) {
    // Verify this is a valid IPFS URI
    (bool isValid, string memory cid) = _extractCIDFromURI(source);
    if (!isValid) {
      revert InvalidTemplateData();
    }

    TemplateStorage storage $ = _getTemplateStorage();

    // Generate deterministic ID from the IPFS CID
    templateId = uint256(keccak256(bytes(cid)));

    TemplateData memory newTemplate = TemplateData({
      asset: asset,
      permissions: permissions,
      source: source,
      isActive: true
    });

    $.templates[templateId] = newTemplate;

    // Mint NFT to the owner
    _safeMint(owner, templateId);

    emit TemplateCreated(templateId, owner, asset, permissions, source);
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

    _getTemplateStorage().templates[templateId].isActive = false;

    emit TemplateDeactivated(templateId);
  }

  /**
   * @notice Retrieves a template by its ID
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
  function baseURI() external view returns (bytes memory) {
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
    if (_ownerOf(tokenId) == address(0)) {
      revert TemplateNotFound(tokenId);
    }

    TemplateStorage storage $ = _getTemplateStorage();
    string memory source = $.templates[tokenId].source;

    // If template URI starts with IPFS_PREFIX, prepend baseURI
    if (bytes(source).length >= IPFS_PREFIX_LENGTH) {
      (bytes memory prefix, bytes memory suffix) = _splitAt(source, IPFS_PREFIX_LENGTH);
      if (keccak256(prefix) == keccak256(IPFS_PREFIX)) {
        return string(bytes.concat($.baseURI, suffix));
      }
    }

    // Otherwise return the template URI as-is
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
    return string(_getTemplateStorage().baseURI);
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
   * @notice Extracts and validates the CID from an IPFS URI
   * @dev Checks if the URI is a valid IPFS URI with a basic CIDv0 format check
   * @param uri The URI string to validate and extract CID from
   * @return isValid Boolean indicating if the URI is a valid IPFS URI with proper CID
   * @return cid The extracted CID portion of the URI if valid, empty string otherwise
   */
  function _extractCIDFromURI(string memory uri) private pure returns (bool isValid, string memory cid) {
    (bytes memory prefix, bytes memory cidBytes) = _splitAt(uri, IPFS_PREFIX_LENGTH);
    if (keccak256(prefix) != keccak256(IPFS_PREFIX)) {
      return (false, '');
    }

    if (cidBytes.length != 46) {
      return (false, '');
    }
    if (cidBytes[0] != 'Q' || cidBytes[1] != 'm') {
      return (false, '');
    }

    return (true, string(cidBytes));
  }

  /**
   * @dev Helper function to split a string into two parts at a specified index
   * @param str The string to split
   * @param splitIndex The index at which to split the string
   * @return prefix The part of the string from index 0 to splitIndex-1
   * @return suffix The part of the string from splitIndex to the end
   */
  function _splitAt(string memory str, uint256 splitIndex) private pure returns (bytes memory, bytes memory) {
    bytes memory strBytes = bytes(str);

    // Check if splitIndex is valid
    if (splitIndex > strBytes.length) {
      splitIndex = strBytes.length;
    }

    bytes memory prefixBytes = new bytes(splitIndex);
    bytes memory suffixBytes = new bytes(strBytes.length - splitIndex);

    for (uint256 i = 0; i < splitIndex; i++) {
      prefixBytes[i] = strBytes[i];
    }
    for (uint256 i = splitIndex; i < strBytes.length; i++) {
      suffixBytes[i - splitIndex] = strBytes[i];
    }
    return (prefixBytes, suffixBytes);
  }
}

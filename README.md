# SACD (Service Access Contract Definition)

A system for managing permission records associated with specific ERC721 tokens, with template support for predefined permission patterns.

## Overview

The SACD system consists of two main contracts:

1. **Sacd.sol** - Core permission management contract
2. **Template.sol** - Template management for predefined permission patterns

## Template System

The Template contract allows users to create predefined permission templates that include:
- Predefined bit arrays (permissions)
- IPFS URLs to templatable JSON documents
- Template management by public keys

### Template Features

- **Template Creation**: Only template managers can create templates with predefined permissions and IPFS URLs
- **Template Management**: Template creators can deactivate their templates
- **SACD Integration**: Templates can be used to create SACD permissions with combined IPFS URLs
- **Template Status Checking**: SACD automatically checks if templates are still active and revokes permissions if templates are deactivated
- **Access Control**: Role-based access control for template management

### Template Status Integration

The SACD contract now includes template status checking:
- When permissions are created using a template, the template ID is stored
- `hasPermission()`, `hasPermissions()`, and `getPermissions()` functions check if the template is still active
- If a template is deactivated, all permissions created with that template are automatically revoked
- Permissions created without templates (templateId = 0) are not affected by template status

### Usage Examples

#### Creating a Template

```solidity
// Only template managers can create templates
await template.createTemplate(
  0x12345678, // predefined permissions
  "ipfs://QmTemplate123" // IPFS URL to JSON document
);
```

#### Using a Template for SACD Creation

**Using Templates for SACD Creation**
```solidity
// Get template data
const templateData = await template.getTemplate(templateId);
const permissions = templateData.permissions;
const finalSource = templateData.ipfsUrl + "&source=custom-source";

// Call SACD directly with template data
await sacd.setPermissions(
  asset,
  tokenId,
  grantee,
  permissions,
  expiration,
  finalSource,
  templateId // Pass template ID for status checking
);
```



#### Template Status Checking

```solidity
// Set template contract in SACD
await sacd.setTemplateContract(templateAddress);

// Permissions are automatically checked for template status
const hasPermissions = await sacd.hasPermissions(asset, tokenId, grantee, permissions);

// If template is deactivated, permissions are revoked
await template.deactivateTemplate(templateId);
// hasPermissions will now return false
```

### Template Structure

Each template contains:
- `templateId`: Unique identifier
- `creator`: Address of the template creator
- `permissions`: Predefined bit array of permissions
- `ipfsUrl`: IPFS URL to the templatable JSON document
- `isActive`: Whether the template is active
- `createdAt`: Timestamp of creation

## Deploy

### Deploy SACD Only
```
npx hardhat ignition deploy ./ignition/modules/Sacd.ts --network <network>
```

### Deploy SACD with Template
```
npx hardhat ignition deploy ./ignition/modules/Template.ts --network <network>
```

In case of reconciliation failed, you can wipe the `journal.jsonl`. Make sure to use the last `futureId` in the journal.

```
npx hardhat ignition wipe chain-<id> --network futureId
```

## Verification

```
npx hardhat ignition deployments
```

output
```
chain-31337
chain-80002
chain-137
```

```
npx hardhat ignition verify chain-<id>
```

## Testing

Run all tests:
```
npx hardhat test
```

Run specific test suites:
```
npx hardhat test --grep "Template Contract"
npx hardhat test --grep "Sacd"
```
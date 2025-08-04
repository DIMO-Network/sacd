# SACD (Service Access Contract Definition)

A system for managing permission records associated with specific ERC721 tokens, with template support for predefined permission patterns and automatic template status checking.

## Overview

The SACD system consists of two main contracts:

1. **Sacd.sol** - Core permission management contract with template status integration
2. **Template.sol** - Template management for predefined permission patterns

## Template System

The Template contract allows users to create predefined permission templates that include:
- Predefined bit arrays (permissions)
- IPFS URLs to templatable JSON documents
- Template management by public keys

### Template Features

- **Template Creation**: Only template managers can create templates with predefined permissions and IPFS URLs
- **Template Management**: Template creators can deactivate their templates
- **Template Status Integration**: SACD automatically checks if templates are still active and revokes permissions if templates are deactivated
- **Access Control**: Role-based access control for template management
- **Immutable Templates**: Once created, templates cannot be updated (immutable design)

### Template Status Integration

The SACD contract includes robust template status checking:
- When permissions are created using a template, the template ID is stored in the PermissionRecord
- `hasPermission()`, `hasPermissions()`, and `getPermissions()` functions automatically check if the template is still active
- If a template is deactivated, all permissions created with that template are automatically revoked
- Permissions created without templates (templateId = 0) are not affected by template status
- Template status checking is resilient to contract failures (defaults to active if template contract is not set)

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
// Set template contract in SACD (admin only)
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

## Contract Functions

### SACD Contract Functions

- `setPermissions(asset, tokenId, grantee, permissions, expiration, source, templateId)` - Set permissions with optional template tracking
- `hasPermission(asset, tokenId, grantee, permission)` - Check single permission with template status
- `hasPermissions(asset, tokenId, grantee, permissions)` - Check multiple permissions with template status
- `getPermissions(asset, tokenId, grantee)` - Get all permissions with template status
- `setTemplateContract(templateContractAddress)` - Set template contract address (admin only)

### Template Contract Functions

- `createTemplate(permissions, ipfsUrl)` - Create a new template (manager only)
- `deactivateTemplate(templateId)` - Deactivate a template (creator only)
- `getTemplate(templateId)` - Get template data
- `getTemplatesByCreator(creator)` - Get all templates by creator
- `getTemplateCount()` - Get total number of templates
- `isTemplateActive(templateId)` - Check if template is active

## Deploy

### Deploy SACD Only
```
npx hardhat ignition deploy ./ignition/modules/Sacd.ts --network <network>
```

### Deploy Template System
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

Run example script:
```
npx hardhat run examples/template-usage.ts
```

## Key Design Decisions

1. **Template Immutability**: Templates cannot be updated once created, ensuring data integrity
2. **Separation of Concerns**: Template contract focuses solely on template management, not SACD interaction
3. **Automatic Status Checking**: SACD automatically checks template status without requiring manual intervention
4. **Backward Compatibility**: Non-template permissions (templateId = 0) work exactly as before
5. **Resilient Design**: Template status checking defaults to active if template contract is not set or calls fail

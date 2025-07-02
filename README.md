# Service Access Contract Definition (SACD)

## SACD JSON Format

This document provides a basic overview of the SACD JSON format, which is used to define agreements for exchanging services and assets within the DIMO ecosystem. SACDs ensure that involved parties have a mutually agreed-upon understanding of the exchange and its scope, including any compensation. These agreements are designed to be human-readable and can represent various types of agreements, including permissions and payments.

### Available Examples

The following example files demonstrate different use cases for the SACD format:

- [`sacd.template.json`](data/sacd.template.json) - Generic template structure for SACD JSON files
- [`sacd.permission.example.json`](data/sacd.permission.example.json) - Example of permission-based agreement
- [`sacd.payment.erc20.example.json`](data/sacd.payment.erc20.example.json) - Payment agreement using ERC20 tokens
- [`sacd.payment.fiat.example.json`](data/sacd.payment.fiat.example.json) - Payment agreement using fiat currency
- [`sacd.attestation.example.json`](data/sacd.attestation.example.json) - Example of attestation agreement
- [`sacd.full.example.json`](data/sacd.full.example.json) - Comprehensive example with multiple agreement types

### Overview

The SACD JSON follows a consistent structure, as seen in the template:

```json
{
  "specversion": "1.0",
  "time": "0000-00-00T00:00:00Z",
  "type": "dimo.sacd",
  "data": {
    "grantor": {
      "address": "0x0000000000000000000000000000000000000000",
      "name": ""
    },
    "grantee": {
      "address": "0x0000000000000000000000000000000000000000",
      "name": ""
    },
    "effectiveAt": "0000-00-00T00:00:00Z",
    "expiresAt": "0000-00-00T00:00:00Z",
    "additionalDates": {},
    "agreements": [
      {
        "type": "<type>",
        "asset": "did:<assetType>:<chainId>:<contractAddress>:<tokenId>",
        "<type>": {},
        "purpose": "",
        "attachments": [
          {
            "name": "",
            "description": "",
            "contentType": "",
            "uri": ""
          }
        ],
        "extensions": {}
      }
    ]
  },
  "signature": ""
}
```

Key top-level fields include:

- `specversion`: Specifies the version of the SACD specification being used. Currently, it is "1.0".
- `time`: The time of when the SACD was created. Format [RFC3339](https://datatracker.ietf.org/doc/html/rfc3339)
- `type`: Identifies the document as a "dimo.sacd".
- `data`: Contains the core information about the agreement.

Within the `data` field, the following are typically found:

- `grantor`: The entity initiating the agreement by granting access to an asset or offering an asset for exchange ("initiating end of things"). In the DIMO ecosystem, this is typically a vehicle or data owner granting permissions, but the framework is flexible. This includes their wallet address, an optional human-readable name, and additional information.
- `grantee`: The grantee is the entity that receives access to an asset or receives an asset in an exchange ("receiving end of things"). Often, within the DIMO ecosystem, the grantee will be a service provider or another user. However, the SACD is designed to be generic, and the grantee could also be another type of entity depending on the nature of the agreement. Similar to the grantor, this includes their wallet address, an optional name, and additional information.
- `effectiveAt`: The date and time when the agreement becomes effective.
- `expiresAt`: The date and time when the agreement expires.
- `additionalDates`: A section to include any other relevant dates.
- `agreements`: An array that can contain one or more specific agreement clauses, such as those related to payments or permissions. Each element in this array specifies a type of agreement and its details.
  - `type`: The agreeement type (e.g. permission, payment)
  - `asset`: A DID identifying the asset, such as a specific a NFT or ERC-20 token (e.g., did:erc721:137:0x4440000000000000000000000000000000000000:123).
  - `agreements`: An array containing the specific details of the agreements. The specific format is defined in the use cases below.
  - `attachments`: An array of documents related to the agreement, each with a name, description, contentType, and uri.
  - `extensions`: A section for adding any custom or non-standard fields relevant to a specific use case.
- `signature`: The cryptographic signature of the entity submitting the SACD, typically created by signing the JSON data with the submitter's private key. This signature verifies the authenticity and integrity of the SACD document and proves the submitter's consent to the agreement terms.

### Use Case: Permissions

When the type within the agreement array is set to "permission", the structure defines the access rights granted to a grantee for a specific asset. Relevant fields within this agreement type (as seen in [`sacd.permission.example.json`](data/sacd.permission.example.json)) include:

- `type`: Specifies the agreement type as "permission" to indicate access rights are being granted
- `asset`: A DID identifying a specific NFT token
  - Example: `did:erc721:80002:0x45fbCD3ef7361d156e8b16F5538AE36DEdf61Da8:928`
- `permissions`: An array detailing the specific permissions being granted. Each permission typically includes:
  - `name`: The identifier for the permission (e.g., "commands", "location:approximate")
  - `description`: A human-readable explanation of what the permission allows
- `attachments`: An array of documents related to the permission agreement (e.g., for a legal agreement)
- `extensions`: Optional additional data specific to the permission agreement, such as technical implementation details or custom constraints

### Use Case: Payments

When the type within the agreement array is set to `payment`, the structure defines the terms of a financial transaction. The SACD format supports different types of payment assets:

#### ERC20 Token Payments

For blockchain token payments (as seen in [`sacd.payment.erc20.example.json`](data/sacd.payment.erc20.example.json)):

- `type`: Specifies the agreement type as "payment" to indicate a financial transaction
- `asset`: Uses the format `did:erc20:<chainId>:<contractAddress>` to identify the token
  - Example: `did:erc20:80002:0x21cFE003997fB7c2B3cfe5cf71e7833B7B2eCe10`
- `payment`: An object containing the payment details:
  - `amount`: The amount to be paid in the token's smallest unit (e.g., "125000000000000000000000" wei)
  - `recurrence`: The frequency of payment (e.g., "monthly", "one-time")
  - `terms`: Additional payment terms, which can include:
    - `initialPayment`: The initial payment amount
    - `paymentMethod`: The method of payment (e.g., "direct transfer")
- `purpose`: A clear statement of why this payment is being made
- `attachments`: Supporting documents for the payment agreement, such as invoices, receipts, or service agreements
- `extensions`: Optional blockchain-specific details like gas limits, transaction parameters, or smart contract interaction details

#### Fiat Currency Payments

For traditional fiat currency payments (as seen in [`sacd.payment.fiat.example.json`](data/sacd.payment.fiat.example.json)):

- `type`: Specifies the agreement type as "payment" to indicate a financial transaction
- `asset`: Uses the format `did:fiat:<currencyCode>` to identify the currency
  - Example: `did:fiat:USD`
- `payment`: An object containing the payment details:
  - `amount`: The amount to be paid in the currency's standard format (e.g., "1250.00")
  - `recurrence`: The frequency of payment (e.g., "monthly", "one-time")
  - `terms`: Additional payment terms, which can include:
    - `initialPayment`: The initial payment amount
    - `paymentMethod`: The method of payment (e.g., "bank transfer", "credit card")
- `purpose`: A clear statement of why this payment is being made
- `attachments`: Supporting documents for the payment agreement, such as invoices, receipts, or service agreements
- `extensions`: Often includes additional payment processing details:
  - `invoicing`: Information about invoicing procedures
  - `paymentDetails`: Banking or payment processing information

### Use Case: Attestations

When the type within the agreement array is set to "attestation", the structure defines claims or certifications made by the grantor about the grantee or an asset. Relevant fields within this agreement type (as seen in [`sacd.attestation.example.json`](data/sacd.attestation.example.json)) include:

- `agreements`: An array of attestation claims, each typically including:
  - `type`: The format of the attestation data, typically "cloudevent" which follows the CloudEvents specification
  - `eventType`: The specific type of attestation event (e.g., "dimo.attestation")
  - `source`: The entity making the attestation (e.g., "0xC008EF40B0b42AAD7e34879EB024385024f753ea")
  - `ids`: An array of unique identifiers for the attestations being referenced
  - `effectiveAt`: The time when the attestation becomes valid (ISO 8601 format)
  - `expiresAt`: The time when the attestation expires (ISO 8601 format)
- `attachments`: An array of documents related to the attestation (e.g., certificates, verification documents)

### Complex Use Cases

For more complex scenarios, multiple agreement types can be combined in a single SACD document, as demonstrated in [`sacd.full.example.json`](data/sacd.full.example.json). This allows for comprehensive agreements that cover multiple aspects of a relationship between parties, such as combining permissions with payment terms or attestations with specific access rights.

This documentation should provide a foundational understanding of the SACD JSON format and its usage for defining payment, permission and attestation agreements within the DIMO ecosystem. More complex agreements may include additional fields within the agreement section or utilize the extensions field for specific requirements.

### NFT DID Format

For detailed information about the DID format used in DIMO, see the [Decentralized Identifier (DID) Formats](https://github.com/DIMO-Network/cloudevent?tab=readme-ov-file#decentralized-identifier-did-formats).

## Deploy

```
npx hardhat ignition deploy ./ignition/modules/Sacd.ts --network <network>
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

### Go ABI

To regenerate the Go bindings for, e.g., [the devices API](https://github.com/DIMO-Network/devices-api/blob/main/internal/contracts/registry.go), you would run

```sh
abigen --abi abis/contracts/Sacd.sol/Sacd.json --out sacd.go --pkg sacd --type Sacd
```

and copy over that file.
# Service Access Contract Definition (SACD)

## SACD JSON Format

This document provides a basic overview of the SACD JSON format, which is used to define agreements for exchanging services and assets within the DIMO ecosystem. SACDs ensure that involved parties have a mutually agreed-upon understanding of the exchange and its scope, including any compensation. These agreements are designed to be human-readable and can represent various types of agreements, including permissions and payments.

The [`sacd.template.json`](data/sacd.template.json) provides a generic structure for SACD JSON files. Example SACD files for payments ([`sacd.payment.example.json`](data/sacd.payment.example.json)) and permissions ([`sacd.permission.example.json`](sacd.permission.example.json)) demonstrate how this template is used for specific use cases.

### Overview

The SACD JSON follows a consistent structure, as seen in the template:

```json
{
  "specversion": "1.0",
  "timestamp": "0000-00-00T00:00:00Z",
  "type": "dimo.sacd",
  "data": {
    "grantor": {
      "address": "0x0000000000000000000000000000000000000000",
      "name": "",
      "additionalInfo": {}
    },
    "grantee": {
      "address": "0x0000000000000000000000000000000000000000",
      "name": "",
      "additionalInfo": {}
    },
    "effectiveAt": "0000-00-00T00:00:00Z",
    "expiresAt": "0000-00-00T00:00:00Z",
    "additionalDates": {},
    "agreements": [
      {
        "type": "<type>",
        "asset": "did:::",
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
        "signatures": [
          {
            "signer": "0x1110000000000000000000000000000000000000",
            "signature": "0x...",
            "timestamp": "2025-03-07T12:30:00Z"
          }
        ]
      }
    ],
    "extensions": {}
  }
}
```

Key top-level fields include:

* `specversion`: Specifies the version of the SACD specification being used. Currently, it is "1.0".
* `timestamp`: The timestamp of when the SACD was created.
* `type`: Identifies the document as a "dimo.sacd".
* `data`: Contains the core information about the agreement.

Within the `data` field, the following are typically found:

* `grantor`: The entity initiating the agreement by granting access to an asset or offering an asset for exchange ("initiating end of things"). In the DIMO ecosystem, this is typically a vehicle or data owner granting permissions, but the framework is flexible. This includes their wallet address, an optional human-readable name, and additional information.
* `grantee`: The grantee is the entity that receives access to an asset or receives an asset in an exchange ("receiving end of things"). Often, within the DIMO ecosystem, the grantee will be a service provider or another user. However, the SACD is designed to be generic, and the grantee could also be another type of entity depending on the nature of the agreement. Similar to the grantor, this includes their wallet address, an optional name, and additional information.
* `effectiveAt`: The date and time when the agreement becomes effective.
* `expiresAt`: The date and time when the agreement expires.
* `additionalDates`: A section to include any other relevant dates.
* `agreements`: An array that can contain one or more specific agreement clauses, such as those related to payments or permissions. Each element in this array specifies a type of agreement and its details.
  * `type`: The agreeement type (e.g. permission, payment)
  * `asset`: A DID identifying the asset, such as a specific a NFT or ERC-20 token (e.g., did:nft:137:0x4440000000000000000000000000000000000000_123).
  * `permissions` or `payments`: An array containing the specific details of the agreements. The specific format is defined in the use cases below.
  * `attachments`: An array of documents related to the agreement, each with a name, description, contentType, and uri.
  * `signatures`: An array of signatures from the involved parties, including the signer's address, the signature itself, and a timestamp.
* `extensions`: A section for adding any custom or non-standard fields relevant to a specific use case.

### Use Case: Permissions

When the type within the agreement array is set to "permission", the structure defines the access rights granted to a grantee for a specific asset. Relevant fields within this agreement type (as seen in [`sacd.permission.example.json`](data/sacd.permission.example.json)) include:

* `permissions`: An array detailing the specific permissions being granted. Each permission typically includes a name (e.g., "commands", "location:approximate") and a human-readable description.
* `attachments`: An array of documents related to the permission agreement (e.g., for a legal agreement).

### Use Case: Payments

When the type within the agreement array is set to "payment", the structure defines the terms of a financial transaction. Relevant fields within this agreement type (as seen in [`sacd.payment.example.json`](sata/sacd.payment.example.json)) include:

* `payment`: An object containing the payment details:
    * `amount`: The amount to be paid (e.g., "125000000000000000000000").
    * `recurrence`: The frequency of payment (e.g., "monthly", "one-time").
    * `terms`: Additional payment terms, which can include:
        * `initialPayment`: The initial payment amount.
        * `paymentMethod`: The method of payment (e.g., "direct transfer").
* `purpose`: A description of what the payment is for (e.g., "Subscription service for vehicle data").
* `attachments`: An array of documents related to the payment agreement (e.g., for a service agreement or payment schedule).

This documentation should provide a foundational understanding of the SACD JSON format and its usage for defining payment and permission agreements within the DIMO ecosystem. More complex agreements may include additional fields within the agreement section or utilize the extensions field for specific requirements.

### NFT DID Format

The DID (Decentralized Identifier) follows the format:

```
did:<key>:<chainId>:<contractAddress>[_<tokenId>]
```

Examples:
```
did:nft:137:0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF_3
did:erc20:137:0xe261d618a959afffd53168cd07d12e37b26761db
```

Where:

- `did:<key>`: is the prefix that identifies the asset type (e.g. nft, erc20, fiat)
- `<chainId>` is the numeric ID of the blockchain (e.g., 137 for Polygon)
- `<contractAddress>` is the 0x address of the asset
- `<tokenId>` is the numeric ID of the specific token (required for NFTs, omitted otherwise)

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

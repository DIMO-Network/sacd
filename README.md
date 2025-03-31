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
        "type": "",
        "asset": "did:::",
        "": {},
        "purpose": "",
        "attachments": [],
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

* `grantor`: Details about the party granting access or providing the service. This includes their wallet address, an optional human-readable name, and additional information.
* `grantee`: Details about the party receiving access or the service. Similar to the grantor, this includes their wallet address, an optional name, and additional information.
* `effectiveAt`: The date and time when the agreement becomes effective.
* `expiresAt`: The date and time when the agreement expires.
* `additionalDates`: A section to include any other relevant dates.
* `agreement`: An array that can contain one or more specific agreement clauses, such as those related to payments or permissions. Each element in this array specifies a type of agreement and its details.
* `extensions`: A section for adding any custom or non-standard fields relevant to a specific use case.

### Use Case: Permissions

When the type within the agreement array is set to "permission", the structure defines the access rights granted to a grantee for a specific asset. Relevant fields within this agreement type (as seen in [`sacd.permission.example.json`](data/sacd.permission.example.json)) include:

* `asset`: A DID identifying the asset to which permissions are being granted, such as a specific NFT (e.g., did:nft:137:0x3330000000000000000000000000000000000000_31415).
* `permissions`: An array detailing the specific permissions being granted. Each permission typically includes a name (e.g., "commands", "location:View:Current") and a human-readable description.
* `attachments`: An array of documents related to the permission agreement, each with a name, description, contentType, and uri (e.g., for a legal agreement).
* `signatures`: An array of signatures from the involved parties, including the signer's address, the signature itself, and a timestamp.

### Use Case: Payments

When the type within the agreement array is set to "payment", the structure defines the terms of a financial transaction. Relevant fields within this agreement type (as seen in [`sacd.payment.example.json`](sata/sacd.payment.example.json)) include:

* `asset`: A DID identifying the payment asset, such as a specific ERC-20 token (e.g., did:erc20:137:0x4440000000000000000000000000000000000000).
* `payment`: An object containing the payment details:
    * `amount`: The amount to be paid (e.g., "125000000000000000000000").
    * `recurrence`: The frequency of payment (e.g., "monthly", "one-time").
    * `terms`: Additional payment terms, which can include:
        * `initialPayment`: The initial payment amount.
        * `paymentMethod`: The method of payment (e.g., "direct transfer").
* `purpose`: A description of what the payment is for (e.g., "Subscription service for vehicle data").
* `attachments`: An array of documents related to the payment agreement, each with a name, description, contentType, and uri (e.g., for a service agreement or payment schedule).
* `signatures`: An array of signatures from the involved parties, including the signer's address, the signature itself, and a timestamp.

This documentation should provide a foundational understanding of the SACD JSON format and its usage for defining payment and permission agreements within the DIMO ecosystem. More complex agreements may include additional fields within the agreement section or utilize the extensions field for specific requirements.

### NFT DID Format

The DID (Decentralized Identifier) follows the format:

```
did:<type>:<chainId>:<contractAddress>[_<tokenId>]
```

Examples:
```
did:nft:137:0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF_3
did:erc20:137:0xe261d618a959afffd53168cd07d12e37b26761db
```

Where:

- `did:<type>`: is the prefix that identifies the asset type (e.g. nft, erc20, fiat)
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

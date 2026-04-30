# Upgrading SACD Contracts

Runbook for upgrading the deployed `Sacd` and `Template` contracts on Polygon and Amoy. Both are UUPS proxies — upgrades replace the implementation contract while keeping the proxy address (and therefore all storage and integrations) untouched.

If you're deploying to a brand-new chain instead of upgrading an existing one, this is the wrong document — see the **Deploy** section in the [README](./README.md) and use Hardhat Ignition.

## What you're actually doing

Each upgrade is two transactions:

1. Deploy a new implementation contract.
2. Call `upgradeToAndCall(newImpl, "0x")` on the proxy. This is gated by `UPGRADER_ROLE` on the proxy.

Step 1 is permissionless — any funded EOA can do it. Step 2 must be sent from whoever holds `UPGRADER_ROLE`.

## Roles and addresses

| Network | Chain ID | Sacd proxy | Template proxy | `UPGRADER_ROLE` holder |
|---|---|---|---|---|
| Polygon | 137 | `0x3c152B5d96769661008Ff404224d6530FCAC766d` | `0x666309adbec298bb332c722f0303ce883f895750` | Deployer Safe `0xCED3c922200559128930180d3f0bfFd4d9f4F123` |
| Amoy | 80002 | `0x4E5F9320b1c7cB3DE5ebDD760aD67375B66cF8a3` | `0x666309adbec298bb332c722f0303ce883f895750` | Shared dev EOA `0xC008EF40B0b42AAD7e34879EB024385024f753ea` |

Other relevant addresses (commented in `scripts/upgrade.ts`):

- `0xD64b27cA7F7d4447dFa8cb8701497Fb6eE774F6a` — designated CREATE3 deployer (used for Template impls; salt-bound, do not change)
- `0x1741ec2915ab71fc03492715b5640133da69420b` — historical Polygon EOA manager; not the upgrader anymore (Safe is)

`scripts/data/addresses.json` is the source of truth for proxy and current implementation addresses. The `ignition/deployments/` directory only records the original deploy and is **not** updated by upgrades.

## Pre-flight checklist

Run these before doing anything irreversible.

### 1. Confirm what changed

```sh
git diff <last-deploy-commit>..HEAD -- contracts/
```

Look at the prior `upgrade sacd <Network>` commits (e.g. `940a209`, `993a0ad`) for what was last deployed. Anything that changes contract bytecode or interfaces is a candidate for upgrade.

### 2. Confirm storage layout is compatible

UUPS upgrades reuse the existing storage. Adding new storage variables is fine **only** if they're appended (or added inside the namespaced ERC-7201 storage struct, which both `Sacd` and `Template` use). Reordering, deleting, or changing the type of existing storage will corrupt state.

For `Sacd` the namespaced struct is `SacdStorage` in `contracts/Sacd.sol`. Diff it:

```sh
git diff <last-deploy-commit>..HEAD -- contracts/Sacd.sol | grep -A 20 'struct SacdStorage'
```

Pure function/event additions (like the `renounce*` commit) are always safe.

### 3. Confirm the UPGRADER_ROLE holder

The table above is current as of the last update to this doc. To re-verify on-chain:

```sh
UPGRADER_ROLE=$(cast keccak "UPGRADER_ROLE")

# Polygon — expect true for the Safe
cast call 0x3c152B5d96769661008Ff404224d6530FCAC766d \
  'hasRole(bytes32,address)(bool)' \
  $UPGRADER_ROLE 0xCED3c922200559128930180d3f0bfFd4d9f4F123 \
  --rpc-url $POLYGON_URL

# Amoy — expect true for the shared dev EOA
cast call 0x4E5F9320b1c7cB3DE5ebDD760aD67375B66cF8a3 \
  'hasRole(bytes32,address)(bool)' \
  $UPGRADER_ROLE 0xC008EF40B0b42AAD7e34879EB024385024f753ea \
  --rpc-url $AMOY_URL
```

If the answer changes, update the table and `scripts/data/addresses.json` (`safe` field for Polygon).

### 4. Confirm current implementation matches `addresses.json`

```sh
# EIP-1967 implementation slot
cast storage 0x3c152B5d96769661008Ff404224d6530FCAC766d \
  0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc \
  --rpc-url $POLYGON_URL
```

The lower 20 bytes should match `polygon.Sacd.implementation` in `scripts/data/addresses.json`. If it doesn't, someone upgraded out-of-band — sort that out before continuing.

### 5. Set up `.env`

```
POLYGON_URL=...
AMOY_URL=...
PRIVATE_KEY=<EOA with funds — used for impl deployment on real network and as the upgrader on Amoy>
POLYGONSCAN_API_KEY=<for verification>
```

The `PRIVATE_KEY` only needs `UPGRADER_ROLE` on Amoy. On Polygon it just needs gas — the upgrade tx is sent from the Safe, not this EOA.

## Simulate first

Always rehearse against a fork. The simulation impersonates the same address that will sign the real tx and exercises the full upgrade end-to-end.

### Polygon (Safe path)

Terminal 1 — start a fork:

```sh
npx hardhat node --fork $POLYGON_URL
```

Terminal 2 — run the upgrade script in safe mode against `localhost`:

```sh
CONTRACT=sacd MODE=safe FORK=polygon npx hardhat run scripts/upgrade.ts --network localhost
```

This deploys a fresh impl on the fork, impersonates the Safe at `0xCED3…F123`, and calls `upgradeToAndCall`. Then poke at the upgraded proxy to confirm the new behavior:

```sh
# In a hardhat console pointed at localhost, or an inline script:
const sacd = await ethers.getContractAt('Sacd', '0x3c152B5d96769661008Ff404224d6530FCAC766d')
await sacd.renounceAccountPermissions('0xSomeGrantor')   // should not revert
```

Whatever golden-path call exercises the new code goes here.

### Amoy (EOA path)

```sh
npx hardhat node --fork $AMOY_URL
# in another shell
FORK=amoy CONTRACT=sacd npx hardhat run scripts/upgrade.ts --network localhost
```

This impersonates the shared dev EOA `0xC008…3ea`, deploys impl, and upgrades the proxy in one go.

### Resetting after a simulation

The simulation step writes the simulated impl address into `scripts/data/addresses.json`. Discard those changes (`git checkout scripts/data/addresses.json`) before doing the real run, otherwise you'll be pointing at a non-existent address.

## Real upgrade — Amoy (EOA path)

```sh
CONTRACT=sacd npx hardhat run scripts/upgrade.ts --network amoy
```

This deploys impl from `PRIVATE_KEY`, calls `upgradeToAndCall`, and writes the new impl into `scripts/data/addresses.json`.

For Template:

```sh
CONTRACT=template-impl VERSION=1.0.x npx hardhat run scripts/upgrade.ts --network amoy
CONTRACT=template-proxy npx hardhat run scripts/upgrade.ts --network amoy
```

(Template uses CREATE3 for deterministic addresses, so the version bump is required to get a new salt.)

## Real upgrade — Polygon (Safe path)

```sh
CONTRACT=sacd MODE=safe npx hardhat run scripts/upgrade.ts --network polygon
```

This:

1. Deploys the new impl from `PRIVATE_KEY` (any funded EOA — the impl is not access-controlled).
2. Writes the new impl into `scripts/data/addresses.json`.
3. Prints the `upgradeToAndCall(newImpl, "0x")` calldata and a Safe Tx Builder JSON blob.

Then in the Safe UI:

1. Open the Safe at `0xCED3…F123` on Polygon.
2. Apps → **Tx Builder** → **Import** → paste the JSON.
3. Submit, collect the required signatures, execute.

After execution, re-verify the implementation slot (see pre-flight check 4) matches the new address.

For Template on Polygon, there isn't yet a `MODE=safe` branch for the Template flow. If `UPGRADER_ROLE` on the Template proxy is also held by the Safe, you'd need to:

1. `CONTRACT=template-impl VERSION=1.0.x npx hardhat run scripts/upgrade.ts --network polygon` (deploy impl via CREATE3 — the designated CREATE3 deployer EOA must be the signer for that step).
2. Manually build the `upgradeToAndCall(newImpl, "0x")` calldata for the Template proxy and submit through the Safe.

If you find yourself doing this often, extend `scripts/upgrade.ts` with a `template-proxy-safe` branch that mirrors the Sacd safe path.

## Post-upgrade

1. Verify on-chain: re-run pre-flight check 4 and confirm the impl slot points to the new address on every network you upgraded.
2. Verify on Polygonscan / Amoy Polygonscan:
   ```sh
   npx hardhat ignition verify chain-137
   npx hardhat ignition verify chain-80002
   ```
   (If `ignition verify` doesn't pick up the new impl because it was deployed outside Ignition, fall back to `npx hardhat verify --network polygon <newImpl>` with no constructor args.)
3. Smoke-test against the real proxy with a read or a cheap write that exercises the new code path.
4. Commit the `scripts/data/addresses.json` change. Match the existing style:
   ```
   upgrade sacd Polygon
   upgrade sacd Amoy
   ```
5. If any consumers (devices-api, etc.) need the new ABI or Go bindings, regenerate them: `npm run abigen` and copy from `bindings/`.

## Reference: what changes per upgrade

- `scripts/data/addresses.json` — `Sacd.implementation` (and/or `Template.implementation`) for the network you upgraded. This is the only file the script writes.
- `ignition/deployments/` — **not** touched by upgrades. Don't be alarmed that the addresses there are stale.
- `bindings/` and `abis/` — only if the public ABI changed and downstream consumers need it.

/**
 * Pokes at a Tenderly virtual testnet to validate a Sacd proxy upgrade.
 *
 * Exercises real behavior:
 *   - Identity & storage shape (chain, impl slot, bytecode, zero-key reads).
 *   - Pulls live (asset, tokenId, grantee) tuples from identity-api and
 *     parity-checks reads against a reference RPC. This is the only way to
 *     detect a corrupted storage layout — random records read post-upgrade
 *     should match the same record on the un-upgraded chain bit for bit.
 *   - Sends an actual renouncePermissions tx from the real grantee using
 *     Tenderly's no-signature eth_sendTransaction + tenderly_setBalance, and
 *     verifies the storage was cleared. This mutates the vnet, not mainnet.
 *
 * Usage:
 *   TENDERLY_RPC_URL=<vnet rpc> NETWORK=polygon \
 *   REFERENCE_RPC_URL=$POLYGON_URL \
 *   npx hardhat run scripts/validateOnTenderly.ts
 *
 * Env:
 *   TENDERLY_RPC_URL    (required)  RPC URL of the Tenderly virtual testnet.
 *   NETWORK             (optional)  polygon | amoy. Defaults to polygon.
 *   REFERENCE_RPC_URL   (optional)  Real-network RPC for cross-checking reads.
 *   IDENTITY_API_URL    (optional)  GraphQL endpoint. Defaults to
 *                                   https://identity-api.dimo.zone/query.
 *   VEHICLE_NFT_ADDR    (optional)  ERC-721 used as `asset` in SACD reads.
 *                                   Defaults to the production Polygon vehicle NFT.
 *   SAMPLE_SIZE         (optional)  How many real SACDs to spot-check. Default 3.
 *   SKIP_MUTATION       (optional)  Set to "1" to skip the end-to-end tx test.
 */

import 'dotenv/config'
import { ethers } from 'ethers'
import hre from 'hardhat'

import { getAddresses } from '../utils/helpers'

// ERC-1967 implementation slot: bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
const EIP1967_IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

const DEFAULT_ADMIN_ROLE = '0x' + '00'.repeat(32)
const ADMIN_ROLE = ethers.id('ADMIN_ROLE')
const UPGRADER_ROLE = ethers.id('UPGRADER_ROLE')

const EXPECTED_CHAIN_ID: Record<string, bigint> = {
  polygon: 137n,
  amoy: 80002n,
}

// Per UPGRADING.md: on Amoy, UPGRADER_ROLE is held by this shared dev EOA.
// On Polygon it's the Safe (read from addresses.json).
const AMOY_UPGRADER_EOA = '0xC008EF40B0b42AAD7e34879EB024385024f753ea'

// Polygon production vehicle NFT (from identity-api/settings.yaml).
const DEFAULT_VEHICLE_NFT: Record<string, string> = {
  polygon: '0xbA5738a18d83D41847dfFbDC6101d37C69c9B0cF',
}

const PROBE_FROM = '0x000000000000000000000000000000000000dEaD'

type Check = { label: string; ok: boolean; detail: string }
type SacdSample = {
  tokenId: number
  owner: string
  grantee: string
  permissions: string // hex bitmask, e.g. "0x3fffc"
  expiresAt: string
}

function fmt({ label, ok, detail }: Check) {
  return `${ok ? 'PASS' : 'FAIL'}  ${label}\n      ${detail}`
}

function safeRevertReason(e: any): string {
  return (e?.shortMessage || e?.info?.error?.message || e?.message || String(e)).slice(0, 240)
}

async function main() {
  const rpcUrl = process.env.TENDERLY_RPC_URL
  if (!rpcUrl) {
    throw new Error('TENDERLY_RPC_URL is not set. Paste the Tenderly virtual testnet RPC URL into your env.')
  }

  const network = (process.env.NETWORK || 'polygon').toLowerCase()
  const cfg = getAddresses()[network]
  if (!cfg) throw new Error(`Unknown NETWORK="${network}". Expected polygon or amoy.`)

  const proxyAddr: string = cfg.Sacd?.proxy
  const expectedImpl: string = cfg.Sacd?.implementation
  const safe: string = cfg.safe || ''
  const expectedTemplate: string = cfg.Template?.proxy || ''

  if (!proxyAddr) throw new Error(`Sacd proxy not set for "${network}" in addresses.json`)
  if (!expectedImpl) throw new Error(`Sacd implementation not set for "${network}" in addresses.json`)

  const expectedUpgrader = network === 'polygon' ? safe : AMOY_UPGRADER_EOA
  if (network === 'polygon' && !safe) {
    throw new Error('addresses.json has no "safe" field for polygon — cannot verify UPGRADER_ROLE holder.')
  }

  const vehicleNftAddr = (process.env.VEHICLE_NFT_ADDR || DEFAULT_VEHICLE_NFT[network] || '').toLowerCase()
  const identityApiUrl = process.env.IDENTITY_API_URL || 'https://identity-api.dimo.zone/query'
  const sampleSize = Number(process.env.SAMPLE_SIZE || 3)
  const skipMutation = process.env.SKIP_MUTATION === '1'
  // identity-api lists vehicles newest-first. Tenderly vnets are typically forked
  // a day or more behind tip, so the newest vehicles don't exist on the fork yet
  // and parity reads come back as "vnet reverted but ref succeeded" — a false
  // alarm. Skip vehicles minted within this window.
  const minAgeDays = Number(process.env.MIN_VEHICLE_AGE_DAYS || 7)

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const refRpcUrl = process.env.REFERENCE_RPC_URL
  const refProvider = refRpcUrl ? new ethers.JsonRpcProvider(refRpcUrl) : null

  console.log('===== Tenderly Validation: Sacd =====')
  console.log(`RPC:               ${rpcUrl}`)
  console.log(`Network:           ${network}`)
  console.log(`Proxy:             ${proxyAddr}`)
  console.log(`Expected new impl: ${expectedImpl}`)
  console.log(`Expected upgrader: ${expectedUpgrader}`)
  if (expectedTemplate) console.log(`Expected template: ${expectedTemplate}`)
  console.log(`Reference RPC:     ${refRpcUrl || '(none — set REFERENCE_RPC_URL for parity checks)'}`)
  console.log(`Vehicle NFT:       ${vehicleNftAddr || '(unset — real-data section will be skipped)'}`)
  console.log(`Identity API:      ${identityApiUrl}`)
  console.log(`Min vehicle age:   ${minAgeDays} days (avoids vehicles minted after the vnet fork)`)
  console.log('')

  const checks: Check[] = []

  // ------------------------------------------------------------------------
  // A. Identity: chain, proxy, impl, bytecode
  // ------------------------------------------------------------------------
  console.log('--- A. Identity ---')

  const chainId = (await provider.getNetwork()).chainId
  const expectedChain = EXPECTED_CHAIN_ID[network]
  checks.push({
    label: 'Chain ID matches network',
    ok: chainId === expectedChain,
    detail: `live=${chainId}, expected=${expectedChain}`,
  })

  const proxyCode = await provider.getCode(proxyAddr)
  checks.push({
    label: 'Proxy address has code',
    ok: proxyCode !== '0x',
    detail: proxyCode === '0x' ? 'no code at proxy' : `${(proxyCode.length - 2) / 2} bytes`,
  })

  const slotRaw = await provider.getStorage(proxyAddr, EIP1967_IMPLEMENTATION_SLOT)
  const liveImpl = ethers.getAddress('0x' + slotRaw.slice(-40))
  const implMatches = liveImpl.toLowerCase() === expectedImpl.toLowerCase()
  checks.push({
    label: 'EIP-1967 impl slot points to new implementation',
    ok: implMatches,
    detail: implMatches
      ? `slot=${liveImpl}`
      : `slot=${liveImpl}, expected=${expectedImpl} — Safe upgrade tx may not have executed on the vnet yet`,
  })

  const liveCode = await provider.getCode(liveImpl)
  if (liveCode === '0x') {
    checks.push({ label: 'Implementation address has code', ok: false, detail: 'no code at impl address' })
  } else {
    const artifact = await hre.artifacts.readArtifact('Sacd')
    // Two things make a deployed runtime byte-different from a freshly compiled
    // local artifact, even when the source is identical:
    //   1. The CBOR metadata blob at the tail (IPFS hash of metadata.json +
    //      solc version) varies with absolute source paths and compile times.
    //   2. Solidity immutables get patched with their runtime values at deploy.
    //      OZ's UUPSUpgradeable has `address immutable __self = address(this)`,
    //      so the impl's own address gets baked in at the immutable slot.
    // Strip metadata; mask out the immutable byte ranges (from solc's
    // immutableReferences in the build-info); compare the remainder.
    const liveStripped = stripMetadata(liveCode)
    const localStripped = stripMetadata(artifact.deployedBytecode)

    const immRefs = await loadImmutableRefs(hre, artifact)
    const liveMasked = maskImmutables(liveStripped, immRefs)
    const localMasked = maskImmutables(localStripped, immRefs)
    const immValues = readImmutableValues(liveStripped, immRefs)

    const codeMatches = liveMasked === localMasked
    const onlyMetadataDiffered = liveStripped === localStripped

    let detail: string
    if (liveCode === artifact.deployedBytecode) {
      detail = `exact match (${(liveCode.length - 2) / 2} bytes)`
    } else if (codeMatches) {
      const immStr = immValues.length === 0 ? '' : ` Patched immutables: ${immValues.join(', ')}.`
      const stripped = onlyMetadataDiffered
        ? 'only the trailing CBOR metadata blob differs'
        : 'differences are confined to metadata + immutable slots'
      detail = `match after stripping Solidity metadata + masking immutables — code identical (${stripped}; benign).${immStr}`
    } else {
      const div = firstDivergence(liveMasked, localMasked)
      detail =
        `code differs even after stripping metadata and masking immutables; first divergence at byte ${div} ` +
        `(live ${(liveStripped.length - 2) / 2} bytes vs local ${(localStripped.length - 2) / 2} bytes) — ` +
        `the deployed impl is NOT the source you have checked out`
    }
    checks.push({
      label: 'Implementation runtime bytecode matches local artifact',
      ok: codeMatches,
      detail,
    })

    // Sanity check: the patched __self immutable, if present, should equal the
    // impl address itself. If it doesn't, the deployed bytecode is something
    // weird (different impl deployed at this address, or layout assumption
    // wrong). This is a strong, focused check independent of the bulk compare.
    const selfMatch = immValues.find((v) => v.toLowerCase() === liveImpl.toLowerCase())
    if (immValues.length > 0) {
      checks.push({
        label: 'UUPS __self immutable equals impl address',
        ok: !!selfMatch,
        detail: selfMatch
          ? `found ${selfMatch} baked into runtime bytecode`
          : `expected ${liveImpl} among baked-in immutables but found only [${immValues.join(', ')}]`,
      })
    }
  }

  for (const c of checks) console.log(fmt(c))

  const sacdAbi = (await hre.artifacts.readArtifact('Sacd')).abi
  const sacd = new ethers.Contract(proxyAddr, sacdAbi, provider)
  const sacdRef = refProvider ? new ethers.Contract(proxyAddr, sacdAbi, refProvider) : null

  // ------------------------------------------------------------------------
  // B. Storage-shape reads (zero-key, no external calls).
  //    These probe storage shape with parity vs the un-upgraded chain.
  //    Functions that do `IERC721(asset).ownerOf(tokenId)` are NOT here —
  //    those need real inputs to be meaningful, covered in section C.
  // ------------------------------------------------------------------------
  console.log('\n--- B. Storage-shape reads (zero-key) ---')
  const oldChecks: Check[] = []
  const Z = ethers.ZeroAddress

  type ReadCase = { name: string; args: any[]; expectedTemplate?: string }
  const reads: ReadCase[] = [
    { name: 'templateContract', args: [], expectedTemplate },
    { name: 'hasRole', args: [DEFAULT_ADMIN_ROLE, expectedUpgrader] },
    { name: 'hasRole', args: [ADMIN_ROLE, expectedUpgrader] },
    { name: 'hasRole', args: [UPGRADER_ROLE, expectedUpgrader] },
    { name: 'tokenIdToVersion', args: [Z, 0n] },
    { name: 'nextPaymentId', args: [Z, Z, Z] },
    { name: 'currentPermissionRecord', args: [Z, 0n, Z] },
    { name: 'permissionRecords', args: [Z, 0n, 0n, Z] },
    { name: 'accountPermissionRecords', args: [Z, Z] },
    { name: 'paymentRecords', args: [Z, Z, Z, 0n] },
    { name: 'currentPaymentRecord', args: [Z, Z, Z] },
    { name: 'hasAccountPermission', args: [Z, Z, 0] },
    { name: 'hasAccountPermissions', args: [Z, Z, 0n] },
    { name: 'getAccountPermissions', args: [Z, Z, 0n] },
  ]

  for (const r of reads) {
    await parityRead(sacd, sacdRef, r.name, r.args, oldChecks, undefined, r.expectedTemplate)
  }

  for (const c of oldChecks) console.log(fmt(c))

  // ------------------------------------------------------------------------
  // C. Real-data reads (asset/tokenId/grantee from identity-api).
  //    Storage corruption surfaces here: random permission records read
  //    post-upgrade should match the same record on the un-upgraded chain.
  // ------------------------------------------------------------------------
  console.log('\n--- C. Real-data reads (live SACDs from identity-api) ---')
  const realChecks: Check[] = []
  let samples: SacdSample[] = []

  if (!vehicleNftAddr) {
    realChecks.push({
      label: 'Real-data fetch',
      ok: false,
      detail: 'VEHICLE_NFT_ADDR not set and no default for this network — skipping',
    })
  } else {
    try {
      samples = await fetchSacdSamples(identityApiUrl, sampleSize, minAgeDays * 24 * 60 * 60 * 1000)
    } catch (e: any) {
      realChecks.push({
        label: 'Real-data fetch from identity-api',
        ok: false,
        detail: `query failed: ${safeRevertReason(e)}`,
      })
    }
  }

  if (samples.length > 0) {
    realChecks.push({
      label: `Pulled ${samples.length} live SACDs from identity-api`,
      ok: true,
      detail: samples.map((s) => `vehicle ${s.tokenId} → grantee ${s.grantee} perms ${s.permissions}`).join('; '),
    })

    for (const s of samples) {
      const tag = `vehicle=${s.tokenId} grantee=${s.grantee}`
      const requestedMask = BigInt(s.permissions)

      await parityRead(
        sacd,
        sacdRef,
        'currentPermissionRecord',
        [vehicleNftAddr, BigInt(s.tokenId), s.grantee],
        realChecks,
        tag
      )
      await parityRead(
        sacd,
        sacdRef,
        'hasPermissions',
        [vehicleNftAddr, BigInt(s.tokenId), s.grantee, requestedMask],
        realChecks,
        tag
      )
      await parityRead(
        sacd,
        sacdRef,
        'getPermissions',
        [vehicleNftAddr, BigInt(s.tokenId), s.grantee, requestedMask],
        realChecks,
        tag
      )
    }

    // Old write path against real data: simulate (eth_call only) the owner
    // re-setting the same permissions on their own vehicle. Exercises the full
    // ERC-721 ownership check + storage write code path.
    const simSample = samples[0]
    const simArgs = [
      vehicleNftAddr,
      BigInt(simSample.tokenId),
      simSample.grantee,
      BigInt(simSample.permissions),
      BigInt(Math.floor(Date.now() / 1000) + 3600),
      0n,
      'tenderly-validate',
    ]
    await simulate(
      provider,
      sacd,
      proxyAddr,
      'setPermissions(address,uint256,address,uint256,uint256,uint256,string)',
      simArgs,
      simSample.owner,
      `pre-existing setPermissions simulates from real owner [vehicle=${simSample.tokenId}]`,
      realChecks
    )
  } else if (vehicleNftAddr) {
    realChecks.push({
      label: 'Real-data sample available',
      ok: false,
      detail: 'identity-api returned no vehicles with non-self SACDs — skipping real-data parity checks',
    })
  }

  for (const c of realChecks) console.log(fmt(c))

  // ------------------------------------------------------------------------
  // D. New functionality: actually call renouncePermissions from the real
  //    grantee on the vnet, then verify storage was cleared. Tenderly vnets
  //    accept eth_sendTransaction without a signature, so we can impersonate
  //    by funding via tenderly_setBalance and sending from any address.
  // ------------------------------------------------------------------------
  console.log('\n--- D. End-to-end renounce (mutates vnet only) ---')
  const newChecks: Check[] = []

  // Negative control: confirm the new selector did NOT exist on the
  // un-upgraded chain. Cheap, useful sanity even when we skip the mutation.
  if (refProvider) {
    const data = sacd.interface.encodeFunctionData('renouncePermissions', [Z, 0n])
    try {
      await refProvider.call({ to: proxyAddr, data, from: PROBE_FROM })
      newChecks.push({
        label: 'renouncePermissions absent on reference RPC (negative control)',
        ok: false,
        detail: 'selector resolves on the un-upgraded chain — was it really new in this upgrade?',
      })
    } catch (e: any) {
      newChecks.push({
        label: 'renouncePermissions absent on reference RPC (negative control)',
        ok: true,
        detail: `reference reverted as expected: ${safeRevertReason(e)}`,
      })
    }
  }

  if (skipMutation) {
    newChecks.push({
      label: 'End-to-end renounce',
      ok: true,
      detail: 'SKIP_MUTATION=1 — skipped on request',
    })
  } else if (samples.length === 0 || !vehicleNftAddr) {
    newChecks.push({
      label: 'End-to-end renounce',
      ok: false,
      detail: 'no real-data sample available — set VEHICLE_NFT_ADDR / make identity-api reachable',
    })
  } else {
    // Pick a sample where grantee != owner (otherwise the owner shortcut in
    // hasPermissions hides whether the storage actually changed). The
    // identity-api fetcher already filters this, but be defensive.
    const target = samples.find((s) => s.grantee.toLowerCase() !== s.owner.toLowerCase()) || samples[0]
    try {
      await runEndToEndRenounce(provider, sacd, proxyAddr, vehicleNftAddr, target, newChecks)
    } catch (e: any) {
      newChecks.push({
        label: 'End-to-end renounce',
        ok: false,
        detail: `aborted: ${safeRevertReason(e)}`,
      })
    }
  }

  for (const c of newChecks) console.log(fmt(c))

  // ------------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------------
  const all = [...checks, ...oldChecks, ...realChecks, ...newChecks]
  const failed = all.filter((c) => !c.ok)
  console.log(`\n===== Summary =====`)
  console.log(`${all.length - failed.length} / ${all.length} checks passed.`)
  if (failed.length > 0) {
    console.log(`Failures:`)
    for (const c of failed) console.log(`  - ${c.label}: ${c.detail}`)
    process.exitCode = 1
  }
}

async function parityRead(
  sacd: ethers.Contract,
  sacdRef: ethers.Contract | null,
  name: string,
  args: any[],
  checks: Check[],
  tag?: string,
  expectedTemplate?: string
) {
  const sig = tag ? `${name} [${tag}]` : `${name}(${args.map((a) => formatResult(a)).join(',')})`
  const vnet = await tryRead(sacd, name, args)

  // Special case: templateContract has a known expected value.
  if (name === 'templateContract' && expectedTemplate) {
    if (!vnet.ok) {
      checks.push({
        label: 'templateContract() returns expected proxy (storage preserved)',
        ok: false,
        detail: `reverted on vnet: ${vnet.error}`,
      })
      return
    }
    const ok = String(vnet.value).toLowerCase() === expectedTemplate.toLowerCase()
    checks.push({
      label: 'templateContract() returns expected proxy (storage preserved)',
      ok,
      detail: `live=${vnet.value}, expected=${expectedTemplate}`,
    })
    return
  }

  if (!sacdRef) {
    // No reference RPC: probe is informational. A revert here is not a failure
    // — the same call may revert on the un-upgraded chain too.
    checks.push({
      label: `read: ${sig}`,
      ok: true,
      detail: vnet.ok
        ? `vnet returned ${formatResult(vnet.value)} (no reference RPC; informational)`
        : `vnet reverted: ${vnet.error} (no reference RPC; could be expected — set REFERENCE_RPC_URL to confirm)`,
    })
    return
  }

  const ref = await tryRead(sacdRef, name, args)

  if (vnet.ok && ref.ok) {
    const same = deepEqual(vnet.value, ref.value)
    checks.push({
      label: `parity: ${sig}`,
      ok: same,
      detail: same
        ? `vnet == ref (${formatResult(vnet.value)})`
        : `vnet=${formatResult(vnet.value)}, ref=${formatResult(ref.value)} — STORAGE LAYOUT MAY BE BROKEN`,
    })
  } else if (!vnet.ok && !ref.ok) {
    checks.push({
      label: `parity: ${sig}`,
      ok: true,
      detail: `both reverted (consistent). vnet="${vnet.error}", ref="${ref.error}"`,
    })
  } else if (vnet.ok && !ref.ok) {
    checks.push({
      label: `parity: ${sig}`,
      ok: false,
      detail: `vnet succeeded (${formatResult(vnet.value)}) but ref reverted (${ref.error}) — UPGRADE CHANGED BEHAVIOR`,
    })
  } else if (!vnet.ok && ref.ok) {
    checks.push({
      label: `parity: ${sig}`,
      ok: false,
      detail: `vnet reverted (${vnet.error}) but ref succeeded (${formatResult(ref.value)}) — UPGRADE BROKE THIS READ`,
    })
  }
}

async function simulate(
  provider: ethers.JsonRpcProvider,
  contract: ethers.Contract,
  to: string,
  fn: string,
  args: any[],
  from: string,
  label: string,
  checks: Check[]
) {
  const data = contract.interface.encodeFunctionData(fn, args)
  try {
    await provider.call({ to, data, from })
    checks.push({ label, ok: true, detail: `eth_call from ${from} succeeded` })
  } catch (e: any) {
    checks.push({ label, ok: false, detail: `eth_call from ${from} reverted: ${safeRevertReason(e)}` })
  }
}

async function runEndToEndRenounce(
  provider: ethers.JsonRpcProvider,
  sacd: ethers.Contract,
  proxyAddr: string,
  asset: string,
  s: SacdSample,
  checks: Check[]
) {
  const tag = `vehicle=${s.tokenId} grantee=${s.grantee}`
  const requestedMask = BigInt(s.permissions)

  // 1. Pre-state: grantee currently has a permission record.
  const preRecord: any = await sacd.currentPermissionRecord(asset, BigInt(s.tokenId), s.grantee)
  const prePerms = BigInt(preRecord.permissions ?? preRecord[0])
  const preExpiration = BigInt(preRecord.expiration ?? preRecord[1])
  checks.push({
    label: `pre-state: grantee has a permission record [${tag}]`,
    ok: prePerms !== 0n,
    detail: `permissions=0x${prePerms.toString(16)} expiration=${preExpiration}`,
  })

  const preHas: boolean = await sacd.hasPermissions(asset, BigInt(s.tokenId), s.grantee, requestedMask)
  checks.push({
    label: `pre-state: hasPermissions returns true [${tag}]`,
    ok: preHas,
    detail: `hasPermissions(0x${requestedMask.toString(16)}) = ${preHas}`,
  })

  // 2. Fund the grantee on the vnet.
  await provider.send('tenderly_setBalance', [s.grantee, '0x' + (10n * 10n ** 18n).toString(16)])

  // 3. Send the renounce tx from the real grantee.
  const data = sacd.interface.encodeFunctionData('renouncePermissions', [asset, BigInt(s.tokenId)])
  const txHash: string = await provider.send('eth_sendTransaction', [{ from: s.grantee, to: proxyAddr, data }])
  const receipt = await provider.waitForTransaction(txHash)
  checks.push({
    label: `renouncePermissions tx succeeded [${tag}]`,
    ok: receipt?.status === 1,
    detail: `tx=${txHash} status=${receipt?.status} gasUsed=${receipt?.gasUsed}`,
  })

  // 4. Receipt must include PermissionsRenounced(asset, tokenId, grantee).
  const evt = sacd.interface.getEvent('PermissionsRenounced')
  const log = receipt?.logs.find((l) => l.topics[0] === evt!.topicHash)
  if (!log) {
    checks.push({
      label: `PermissionsRenounced event emitted [${tag}]`,
      ok: false,
      detail: 'event topic not found in tx receipt logs',
    })
  } else {
    const decoded = sacd.interface.parseLog({ topics: [...log.topics], data: log.data })
    const evAsset = String(decoded?.args[0]).toLowerCase()
    const evToken = BigInt(decoded?.args[1])
    const evGrantee = String(decoded?.args[2]).toLowerCase()
    const ok = evAsset === asset.toLowerCase() && evToken === BigInt(s.tokenId) && evGrantee === s.grantee.toLowerCase()
    checks.push({
      label: `PermissionsRenounced event matches inputs [${tag}]`,
      ok,
      detail: `asset=${evAsset} tokenId=${evToken} grantee=${evGrantee}`,
    })
  }

  // 5. Post-state: storage is cleared.
  const postRecord: any = await sacd.currentPermissionRecord(asset, BigInt(s.tokenId), s.grantee)
  const postPerms = BigInt(postRecord.permissions ?? postRecord[0])
  const postExpiration = BigInt(postRecord.expiration ?? postRecord[1])
  checks.push({
    label: `post-state: permission record cleared [${tag}]`,
    ok: postPerms === 0n && postExpiration === 0n,
    detail: `permissions=${postPerms} expiration=${postExpiration}`,
  })

  const postHas: boolean = await sacd.hasPermissions(asset, BigInt(s.tokenId), s.grantee, requestedMask)
  checks.push({
    label: `post-state: hasPermissions returns false [${tag}]`,
    ok: !postHas,
    detail: `hasPermissions = ${postHas}`,
  })
}

async function fetchSacdSamples(url: string, sampleSize: number, minAgeMs: number): Promise<SacdSample[]> {
  // Pages newest-first through identity-api looking for `sampleSize` SACDs that
  // satisfy: grantee != owner (owner shortcut would mask post-renounce state),
  // vehicle minted before now-minAgeMs (so it exists on the forked vnet), and
  // not already expired (so hasPermissions is true pre-renounce).
  const cutoffMintedAt = Date.now() - minAgeMs
  const nowSec = Date.now() / 1000
  const PAGE_SIZE = 100
  const MAX_PAGES = 8

  const out: SacdSample[] = []
  let after: string | null = null

  for (let page = 0; page < MAX_PAGES; page++) {
    const afterClause = after ? `, after: "${after}"` : ''
    const query = `{
      vehicles(first: ${PAGE_SIZE}${afterClause}) {
        nodes {
          tokenId
          owner
          mintedAt
          sacds(first: 5) {
            nodes { grantee permissions expiresAt }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    if (!res.ok) throw new Error(`identity-api returned HTTP ${res.status}`)
    const json: any = await res.json()
    if (json.errors) throw new Error(`identity-api: ${JSON.stringify(json.errors)}`)
    const conn = json.data?.vehicles
    const vehicles: any[] = conn?.nodes || []

    for (const v of vehicles) {
      if (new Date(v.mintedAt).getTime() > cutoffMintedAt) continue
      for (const sacd of v.sacds?.nodes || []) {
        if (sacd.grantee.toLowerCase() === v.owner.toLowerCase()) continue
        if (new Date(sacd.expiresAt).getTime() / 1000 <= nowSec) continue
        out.push({
          tokenId: v.tokenId,
          owner: v.owner,
          grantee: sacd.grantee,
          permissions: sacd.permissions,
          expiresAt: sacd.expiresAt,
        })
        if (out.length >= sampleSize) return out
      }
    }

    if (!conn?.pageInfo?.hasNextPage) break
    after = conn.pageInfo.endCursor
  }
  return out
}

type ReadOutcome = { ok: true; value: any } | { ok: false; error: string }

async function tryRead(contract: ethers.Contract, name: string, args: any[]): Promise<ReadOutcome> {
  try {
    const value = await (contract as any)[name](...args)
    return { ok: true, value }
  } catch (e: any) {
    return { ok: false, error: safeRevertReason(e) }
  }
}

// Strips the Solidity metadata blob from runtime bytecode. The last 2 bytes of
// runtime bytecode encode the length of the appended CBOR metadata, which
// varies with absolute source paths and compile timestamps even for byte-
// identical source. Polygonscan ignores it during verification; so should we.
function stripMetadata(bytecode: string): string {
  const hex = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode
  if (hex.length < 4) return '0x' + hex
  const lengthHex = hex.slice(-4) // last 2 bytes (4 hex chars) = metadata length
  const metadataLen = parseInt(lengthHex, 16)
  const totalToStripChars = (metadataLen + 2) * 2
  if (Number.isNaN(metadataLen) || totalToStripChars >= hex.length) return '0x' + hex
  return '0x' + hex.slice(0, hex.length - totalToStripChars)
}

type ImmRange = { start: number; length: number }

// Pulls solc's immutableReferences out of the build-info for the given artifact.
// The shape is { astId: [{start, length}, ...] }; we flatten to a list of
// byte ranges in the runtime bytecode that hold immutable values.
async function loadImmutableRefs(hreInst: typeof hre, artifact: any): Promise<ImmRange[]> {
  const fqName = `${artifact.sourceName}:${artifact.contractName}`
  const buildInfo = await hreInst.artifacts.getBuildInfo(fqName)
  const out = buildInfo?.output?.contracts?.[artifact.sourceName]?.[artifact.contractName] as any
  const refs = out?.evm?.deployedBytecode?.immutableReferences as Record<string, ImmRange[]> | undefined
  if (!refs) return []
  return Object.values(refs).flat()
}

// Replaces the bytes at each immutable range with zeros so two bytecodes that
// only differ in their patched immutable values compare equal.
function maskImmutables(hexCode: string, ranges: ImmRange[]): string {
  if (ranges.length === 0) return hexCode
  const hex = hexCode.startsWith('0x') ? hexCode.slice(2) : hexCode
  const buf = Buffer.from(hex, 'hex')
  for (const { start, length } of ranges) {
    if (start + length > buf.length) continue
    buf.fill(0, start, start + length)
  }
  return '0x' + buf.toString('hex')
}

// Reads the live values that solc patched into each immutable slot. For an
// `address` immutable solc reserves a 32-byte slot with the address right-
// aligned; we extract the low 20 bytes as a checksummed address.
function readImmutableValues(hexCode: string, ranges: ImmRange[]): string[] {
  const hex = hexCode.startsWith('0x') ? hexCode.slice(2) : hexCode
  const out: string[] = []
  for (const { start, length } of ranges) {
    if (length !== 32) continue
    const slot = hex.slice(start * 2, (start + length) * 2)
    if (slot.length !== 64) continue
    if (!/^0{24}/.test(slot)) continue // not address-shaped
    try {
      out.push(ethers.getAddress('0x' + slot.slice(24)))
    } catch {
      // not a valid address; skip
    }
  }
  return out
}

function firstDivergence(a: string, b: string): number | string {
  const ah = a.startsWith('0x') ? a.slice(2) : a
  const bh = b.startsWith('0x') ? b.slice(2) : b
  const min = Math.min(ah.length, bh.length)
  for (let i = 0; i < min; i += 2) {
    if (ah.slice(i, i + 2) !== bh.slice(i, i + 2)) return i / 2
  }
  return ah.length === bh.length ? 'identical (only length differs?)' : `byte ${min / 2} (length mismatch)`
}

function formatResult(v: any): string {
  if (v === null || v === undefined) return String(v)
  if (typeof v === 'bigint') return v.toString()
  if (Array.isArray(v) || (typeof v === 'object' && 'length' in v)) {
    return (
      '[' +
      Array.from(v as any)
        .map(formatResult)
        .join(', ') +
      ']'
    )
  }
  if (typeof v === 'object') {
    return JSON.stringify(v, (_k, val) => (typeof val === 'bigint' ? val.toString() : val))
  }
  return String(v)
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a === 'bigint' || typeof b === 'bigint') return BigInt(a as any) === BigInt(b as any)
  if (Array.isArray(a) || (a && typeof a === 'object' && 'length' in a)) {
    const aa = Array.from(a as any)
    const bb = Array.from(b as any)
    if (aa.length !== bb.length) return false
    return aa.every((x, i) => deepEqual(x, bb[i]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    if (ka.length !== kb.length) return false
    return ka.every((k) => deepEqual(a[k], b[k]))
  }
  return String(a) === String(b)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

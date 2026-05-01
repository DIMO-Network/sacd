/**
 * Pokes at a Tenderly virtual testnet to validate a Sacd proxy upgrade.
 *
 * Usage:
 *   TENDERLY_RPC_URL=<vnet rpc> NETWORK=polygon npx hardhat run scripts/validateOnTenderly.ts
 *
 * Env:
 *   TENDERLY_RPC_URL    (required)  RPC URL of the Tenderly virtual testnet (post-upgrade).
 *   NETWORK             (optional)  polygon | amoy. Defaults to polygon.
 *   REFERENCE_RPC_URL   (optional)  Real-network RPC to cross-check view calls against.
 *                                   Same NETWORK; e.g. POLYGON_URL. When provided, several
 *                                   view calls are executed on both RPCs and results compared
 *                                   — the strongest "storage layout wasn't corrupted" check.
 *
 * Reads the expected proxy + new implementation from scripts/data/addresses.json
 * and assumes the queued Safe upgrade tx has already executed on the vnet.
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

const PROBE_FROM = '0x000000000000000000000000000000000000dEaD'

type Check = { label: string; ok: boolean; detail: string }

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
  console.log(`Reference RPC:     ${refRpcUrl || '(none — set REFERENCE_RPC_URL for cross-check)'}`)
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
    // Solidity appends a CBOR metadata blob (IPFS hash + solc version) to runtime
    // bytecode. Its content varies with source-file paths and compile timestamp,
    // so two compiles of identical source from different machines disagree there.
    // Polygonscan verification strips it; we do the same before comparing.
    const liveStripped = stripMetadata(liveCode)
    const localStripped = stripMetadata(artifact.deployedBytecode)
    const exact = liveCode === artifact.deployedBytecode
    const codeMatches = liveStripped === localStripped
    let detail: string
    if (exact) {
      detail = `exact match (${(liveCode.length - 2) / 2} bytes)`
    } else if (codeMatches) {
      detail = `match after stripping Solidity metadata blob — code identical, only metadata differs (benign; expected when compiled on different machines)`
    } else {
      const div = firstDivergence(liveStripped, localStripped)
      detail =
        `code differs even after stripping metadata; first divergence at byte ${div} ` +
        `(live ${(liveStripped.length - 2) / 2} bytes vs local ${(localStripped.length - 2) / 2} bytes) — ` +
        `the deployed impl is NOT the source you have checked out`
    }
    checks.push({
      label: 'Implementation runtime bytecode matches local artifact',
      ok: codeMatches,
      detail,
    })
  }

  for (const c of checks) console.log(fmt(c))

  const sacdAbi = (await hre.artifacts.readArtifact('Sacd')).abi
  const sacd = new ethers.Contract(proxyAddr, sacdAbi, provider)
  const sacdRef = refProvider ? new ethers.Contract(proxyAddr, sacdAbi, refProvider) : null

  // ------------------------------------------------------------------------
  // B. Pre-existing functionality: reads (and parity vs reference RPC)
  // ------------------------------------------------------------------------
  console.log('\n--- B. Pre-existing reads ---')
  const oldChecks: Check[] = []

  // Probe inputs for stable mapping reads. Zero-key reads always work and
  // — critically — must return identical values on the vnet and the reference
  // RPC if storage layout is preserved.
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
    { name: 'hasPermission', args: [Z, 0n, Z, 0] },
    { name: 'hasPermissions', args: [Z, 0n, Z, 0n] },
    { name: 'hasAccountPermission', args: [Z, Z, 0] },
    { name: 'hasAccountPermissions', args: [Z, Z, 0n] },
    { name: 'getPermissions', args: [Z, 0n, Z, 0n] },
    { name: 'getAccountPermissions', args: [Z, Z, 0n] },
  ]

  for (const r of reads) {
    const sig = `${r.name}(${r.args.map((a) => formatResult(a)).join(',')})`
    const vnet = await tryRead(sacd, r.name, r.args)

    // Special expected-value check for templateContract.
    if (r.name === 'templateContract' && r.expectedTemplate) {
      if (!vnet.ok) {
        oldChecks.push({
          label: 'templateContract() returns expected proxy (storage preserved)',
          ok: false,
          detail: `reverted on vnet: ${vnet.error}`,
        })
        continue
      }
      const ok = String(vnet.value).toLowerCase() === r.expectedTemplate.toLowerCase()
      oldChecks.push({
        label: 'templateContract() returns expected proxy (storage preserved)',
        ok,
        detail: `live=${vnet.value}, expected=${r.expectedTemplate}`,
      })
      continue
    }

    if (!sacdRef) {
      // No reference RPC: probe is informational. A revert here is not a failure
      // — the same call may revert on the un-upgraded chain too. Set
      // REFERENCE_RPC_URL to turn this into a real parity check.
      oldChecks.push({
        label: `read: ${sig}`,
        ok: true,
        detail: vnet.ok
          ? `vnet returned ${formatResult(vnet.value)} (no reference RPC; informational)`
          : `vnet reverted: ${vnet.error} (no reference RPC; could be expected contract behavior — set REFERENCE_RPC_URL to confirm)`,
      })
      continue
    }

    const ref = await tryRead(sacdRef, r.name, r.args)

    // Parity comparison covers all four (vnet, ref) outcome combinations.
    if (vnet.ok && ref.ok) {
      const same = deepEqual(vnet.value, ref.value)
      oldChecks.push({
        label: `parity: ${sig}`,
        ok: same,
        detail: same
          ? `vnet == ref (${formatResult(vnet.value)})`
          : `vnet=${formatResult(vnet.value)}, ref=${formatResult(ref.value)} — STORAGE LAYOUT MAY BE BROKEN`,
      })
    } else if (!vnet.ok && !ref.ok) {
      // Both reverted — same contract behavior on both sides. This is fine; the
      // input just happens to hit a code path that reverts (e.g. ownerOf on a
      // non-ERC721 asset address) on both the upgraded and un-upgraded chain.
      oldChecks.push({
        label: `parity: ${sig}`,
        ok: true,
        detail: `both reverted (consistent behavior). vnet="${vnet.error}", ref="${ref.error}"`,
      })
    } else if (vnet.ok && !ref.ok) {
      oldChecks.push({
        label: `parity: ${sig}`,
        ok: false,
        detail: `vnet succeeded (${formatResult(vnet.value)}) but ref reverted (${ref.error}) — UPGRADE CHANGED BEHAVIOR`,
      })
    } else if (!vnet.ok && ref.ok) {
      oldChecks.push({
        label: `parity: ${sig}`,
        ok: false,
        detail: `vnet reverted (${vnet.error}) but ref succeeded (${formatResult(ref.value)}) — UPGRADE BROKE THIS READ`,
      })
    }
  }

  // ------------------------------------------------------------------------
  // C. Pre-existing functionality: write simulations via eth_call
  //    These confirm the legacy write paths still encode/execute against the
  //    new impl. eth_call is read-only — nothing persists.
  // ------------------------------------------------------------------------
  console.log('\n--- C. Pre-existing writes (simulated) ---')

  // setAccountPermissions: no on-chain ownership requirement when templateId=0.
  // Should succeed from any caller against any non-zero grantee.
  await simulate(
    provider,
    sacd,
    proxyAddr,
    'setAccountPermissions',
    [PROBE_FROM, 1n, BigInt(Math.floor(Date.now() / 1000) + 3600), 0n, 'tenderly-validate'],
    PROBE_FROM,
    'pre-existing write callable',
    oldChecks
  )

  // setPayment with currency-only (asset=0, currency=USD). Passes the
  // InvalidCurrency guard because exactly one of asset/currency is set.
  const usd = '0x555344' // "USD"
  await simulate(
    provider,
    sacd,
    proxyAddr,
    'setPayment',
    [Z, PROBE_FROM, 1n, BigInt(Math.floor(Date.now() / 1000) + 3600), usd, 'tenderly-validate'],
    PROBE_FROM,
    'pre-existing write callable',
    oldChecks
  )

  for (const c of oldChecks) console.log(fmt(c))

  // ------------------------------------------------------------------------
  // D. New functionality: selectors added by this upgrade
  //    On the OLD impl these would revert with empty data (unknown selector).
  //    A successful eth_call here proves the proxy is delegating into the
  //    new impl's added functions.
  // ------------------------------------------------------------------------
  console.log('\n--- D. New functionality (added by this upgrade) ---')
  const newChecks: Check[] = []

  await simulate(
    provider,
    sacd,
    proxyAddr,
    'renounceAccountPermissions',
    [PROBE_FROM],
    PROBE_FROM,
    'new selector reachable on proxy',
    newChecks
  )

  await simulate(
    provider,
    sacd,
    proxyAddr,
    'renouncePermissions',
    [Z, 0n],
    PROBE_FROM,
    'new selector reachable on proxy',
    newChecks
  )

  // For extra confidence, confirm the new selectors are NOT on the reference
  // (un-upgraded) impl, if a reference RPC was supplied — i.e. the upgrade
  // really did add behavior, not just shuffle code around.
  if (refProvider) {
    const renounceAccountSelector = sacd.interface.encodeFunctionData('renounceAccountPermissions', [PROBE_FROM])
    const renouncePermsSelector = sacd.interface.encodeFunctionData('renouncePermissions', [Z, 0n])
    for (const [fn, data] of [
      ['renounceAccountPermissions', renounceAccountSelector],
      ['renouncePermissions', renouncePermsSelector],
    ] as const) {
      try {
        await refProvider.call({ to: proxyAddr, data, from: PROBE_FROM })
        newChecks.push({
          label: `${fn} also succeeds on reference RPC`,
          ok: false,
          detail: 'new selector resolves on the un-upgraded chain too — was this really new in this upgrade?',
        })
      } catch (e: any) {
        newChecks.push({
          label: `${fn} not yet on reference RPC (sanity)`,
          ok: true,
          detail: `reference reverted as expected: ${safeRevertReason(e)}`,
        })
      }
    }
  }

  for (const c of newChecks) console.log(fmt(c))

  // ------------------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------------------
  const all = [...checks, ...oldChecks, ...newChecks]
  const failed = all.filter((c) => !c.ok)
  console.log(`\n===== Summary =====`)
  console.log(`${all.length - failed.length} / ${all.length} checks passed.`)
  if (failed.length > 0) {
    console.log(`Failures:`)
    for (const c of failed) console.log(`  - ${c.label}: ${c.detail}`)
    process.exitCode = 1
  }
}

async function simulate(
  provider: ethers.JsonRpcProvider,
  contract: ethers.Contract,
  to: string,
  fn: string,
  args: any[],
  from: string,
  labelPrefix: string,
  checks: Check[]
) {
  const data = contract.interface.encodeFunctionData(fn, args)
  try {
    await provider.call({ to, data, from })
    checks.push({
      label: `${labelPrefix}: ${fn}`,
      ok: true,
      detail: 'eth_call simulation succeeded',
    })
  } catch (e: any) {
    checks.push({
      label: `${labelPrefix}: ${fn}`,
      ok: false,
      detail: `eth_call reverted: ${safeRevertReason(e)}`,
    })
  }
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
    return '[' + Array.from(v as any).map(formatResult).join(', ') + ']'
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

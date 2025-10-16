import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { getAddresses, writeAddresses } from '../utils/helpers'
import { deployWithCreate3, getCreate3Deployer } from './deployWithCreate3'

async function getGasPrice(bump: bigint = 20n): Promise<bigint> {
  if (bump < 1n) {
    throw new Error('gas price bump must be >= 1')
  }

  const price = (await ethers.provider.getFeeData()).gasPrice as bigint
  return (price * bump) / 100n + price
}

/**
 * Upgrades the Sacd contract (uses regular deployment)
 */
async function upgradeSacd(signer: HardhatEthersSigner, networkName: string) {
  const gasPrice = await getGasPrice(20n)
  const instances = getAddresses()

  const sacdProxy = instances[networkName].Sacd.proxy

  if (!sacdProxy) {
    throw new Error(`Sacd proxy address not found for network: ${networkName}`)
  }

  console.log(`\n===== Upgrading Sacd Contract =====`)
  console.log(`Proxy: ${sacdProxy}`)
  console.log(`Current Implementation: ${instances[networkName].Sacd.implementation}\n`)

  const factory = await ethers.getContractFactory('Sacd', signer)

  const impl = await factory.deploy({ gasPrice: gasPrice })
  await impl.waitForDeployment()
  const addressImpl = await impl.getAddress()

  console.log(`New implementation deployed at: ${addressImpl}`)

  const proxy = await ethers.getContractAt('Sacd', sacdProxy, signer)
  const upgradeTx = await proxy.upgradeToAndCall(addressImpl, '0x')
  console.log(`Upgrade transaction sent: ${upgradeTx.hash}`)

  const upgradeReceipt = await upgradeTx.wait()
  console.log(`Upgrade confirmed in block: ${upgradeReceipt?.blockNumber}`)

  console.log(`\nSacd contract upgraded successfully!`)
  console.log(`Proxy: ${sacdProxy}`)
  console.log(`New Implementation: ${addressImpl}\n`)

  instances[networkName].Sacd.implementation = addressImpl
  writeAddresses(instances, networkName)
}

/**
 * Step 1: Deploy new Template implementation using CREATE3 and save to addresses.json
 * @param create3Deployer The signer authorized to deploy with CREATE3 (must match addresses.json)
 * @param networkName The network name for storing addresses
 * @param newVersion The version string for the new implementation (e.g., '1.0.2')
 */
async function deployTemplateImplementation(
  create3Deployer: HardhatEthersSigner,
  networkName: string,
  newVersion: string
) {
  const instances = getAddresses()
  const designatedDeployer = getCreate3Deployer()

  console.log(`\n===== Step 1: Deploying Template Implementation =====`)
  console.log(`Network: ${networkName}`)
  console.log(`New Version: ${newVersion}`)
  console.log(`CREATE3 Deployer: ${create3Deployer.address}`)
  console.log(`Designated CREATE3 Deployer: ${designatedDeployer}\n`)

  // Verify deployer
  if (create3Deployer.address.toLowerCase() !== designatedDeployer.toLowerCase()) {
    throw new Error(`CREATE3 deployer must be ${designatedDeployer}, got ${create3Deployer.address}`)
  }

  // Deploy new implementation using CREATE3
  const newImplementationAddress = await deployWithCreate3(
    create3Deployer,
    'Template',
    `TemplateImplementation_${newVersion}`
  )

  console.log(`\n✅ Template implementation deployed successfully!`)
  console.log(`New Implementation: ${newImplementationAddress}`)
  console.log(`Saving to addresses.json...`)

  // Update the addresses file with new implementation
  instances[networkName].Template.implementation = newImplementationAddress
  writeAddresses(instances, networkName)

  console.log(`\n✅ Implementation address saved to addresses.json`)
  console.log(`\nNext step: Upgrade the proxy by running:`)
  console.log(`  CONTRACT=template-proxy npx hardhat run scripts/upgrade.ts --network ${networkName}`)
  console.log(`\nOr if testing locally:`)
  console.log(`  CONTRACT=template-proxy npx hardhat run scripts/upgrade.ts --network localhost\n`)
}

/**
 * Step 2: Upgrade Template proxy to use the new implementation from addresses.json
 * @param upgrader The signer authorized to upgrade the proxy (must have UPGRADER_ROLE)
 * @param networkName The network name for reading addresses
 */
async function upgradeTemplateProxy(upgrader: HardhatEthersSigner, networkName: string) {
  const instances = getAddresses()
  const templateProxy = instances[networkName].Template.proxy
  const newImplementationAddress = instances[networkName].Template.implementation

  if (!templateProxy) {
    throw new Error(`Template proxy address not found for network: ${networkName}`)
  }

  if (!newImplementationAddress) {
    throw new Error(
      `Template implementation address not found for network: ${networkName}. ` +
        `Please run deployment step first: CONTRACT=template-impl VERSION=x.x.x npx hardhat run scripts/upgrade.ts`
    )
  }

  console.log(`\n===== Step 2: Upgrading Template Proxy =====`)
  console.log(`Network: ${networkName}`)
  console.log(`Proxy: ${templateProxy}`)
  console.log(`New Implementation: ${newImplementationAddress}`)
  console.log(`Upgrader: ${upgrader.address}\n`)

  // Get the proxy contract instance
  const templateProxyContract = await ethers.getContractAt('Template', templateProxy, upgrader)

  // Upgrade the proxy to point to the new implementation
  console.log(`Calling upgradeToAndCall on proxy...`)
  const upgradeTx = await templateProxyContract.upgradeToAndCall(newImplementationAddress, '0x', {
    gasLimit: 500000,
  })
  console.log(`Upgrade transaction sent: ${upgradeTx.hash}`)

  const upgradeReceipt = await upgradeTx.wait()
  console.log(`Upgrade confirmed in block: ${upgradeReceipt?.blockNumber}`)
  console.log(`Gas used: ${upgradeReceipt?.gasUsed}`)

  console.log(`\n✅ Template proxy upgraded successfully!`)
  console.log(`Proxy: ${templateProxy}`)
  console.log(`Now pointing to: ${newImplementationAddress}\n`)
}

async function main() {
  let [deployer, user1] = await ethers.getSigners()
  let { name } = await ethers.provider.getNetwork()

  // Signers for different roles
  let create3Deployer = deployer
  let upgrader = deployer

  if (name === 'localhost') {
    name = 'polygon'
    // 0xCED3c922200559128930180d3f0bfFd4d9f4F123 Prod account
    // 0x1741ec2915ab71fc03492715b5640133da69420b Prod deployer/manager
    // 0xC008EF40B0b42AAD7e34879EB024385024f753ea Shared dev account (has UPGRADER_ROLE)
    // 0xD64b27cA7F7d4447dFa8cb8701497Fb6eE774F6a Deployer create3 (designated CREATE3 deployer)

    const designatedDeployer = getCreate3Deployer()
    create3Deployer = await ethers.getImpersonatedSigner(designatedDeployer)
    upgrader = await ethers.getImpersonatedSigner(
      name == 'polygon' ? '0x1741ec2915ab71fc03492715b5640133da69420b' : '0xC008EF40B0b42AAD7e34879EB024385024f753ea'
    )

    // Fund both accounts
    await user1.sendTransaction({
      to: create3Deployer.address,
      value: ethers.parseEther('10'),
    })
    await user1.sendTransaction({
      to: upgrader.address,
      value: ethers.parseEther('10'),
    })
  }

  console.log(`\n========================================`)
  console.log(`Network: ${name}`)
  console.log(`CREATE3 Deployer: ${create3Deployer.address}`)
  console.log(`Upgrader: ${upgrader.address}`)
  console.log(`========================================`)

  try {
    // Get contract and version from environment variables
    const contract = process.env.CONTRACT?.toLowerCase()
    const version = process.env.VERSION || '1.0.2'

    if (contract === 'sacd') {
      await upgradeSacd(upgrader, name)
    } else if (contract === 'template-impl') {
      // Step 1: Deploy new implementation with CREATE3
      await deployTemplateImplementation(create3Deployer, name, version)
    } else if (contract === 'template-proxy') {
      // Step 2: Upgrade proxy to use new implementation
      await upgradeTemplateProxy(upgrader, name)
    } else if (contract === 'template') {
      // Convenience: Do both steps in sequence
      console.log(`\n⚠️  Running both steps in sequence...`)
      console.log(`This will deploy implementation and immediately upgrade the proxy.`)
      console.log(`For production, consider running these steps separately for verification.\n`)
      await deployTemplateImplementation(create3Deployer, name, version)
      await upgradeTemplateProxy(upgrader, name)
    } else if (contract === 'all') {
      await upgradeSacd(upgrader, name)
      await deployTemplateImplementation(create3Deployer, name, version)
      await upgradeTemplateProxy(upgrader, name)
    } else {
      console.log('\nUsage with environment variables:')
      console.log('\nSacd Contract:')
      console.log('  CONTRACT=sacd npx hardhat run scripts/upgrade.ts')
      console.log('\nTemplate Contract (two-step process):')
      console.log('  Step 1: Deploy implementation')
      console.log('    CONTRACT=template-impl VERSION=1.0.2 npx hardhat run scripts/upgrade.ts')
      console.log('  Step 2: Upgrade proxy')
      console.log('    CONTRACT=template-proxy npx hardhat run scripts/upgrade.ts')
      console.log('\nTemplate Contract (single command, both steps):')
      console.log('  CONTRACT=template VERSION=1.0.2 npx hardhat run scripts/upgrade.ts')
      console.log('\nUpgrade All:')
      console.log('  CONTRACT=all VERSION=1.0.2 npx hardhat run scripts/upgrade.ts')
      console.log('\nExamples with network:')
      console.log('  CONTRACT=template-impl VERSION=1.0.3 npx hardhat run scripts/upgrade.ts --network polygon')
      console.log('  CONTRACT=template-proxy npx hardhat run scripts/upgrade.ts --network polygon')
      process.exit(1)
    }

    console.log('\n========================================')
    console.log('✅ Operation completed successfully!')
    console.log('========================================\n')
  } catch (error) {
    console.error('\n❌ Operation failed:', error)
    process.exit(1)
  }
}

export { upgradeSacd, deployTemplateImplementation, upgradeTemplateProxy }

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

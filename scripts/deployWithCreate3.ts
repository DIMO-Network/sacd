import * as dotenv from 'dotenv'
import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { getAddresses, writeAddresses } from '../utils/helpers'

dotenv.config()

// CreateX contract address (same across all supported networks)
const CREATEX_ADDRESS = '0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed'

const CREATEX_ABI = [
  'function deployCreate3(bytes32 salt, bytes memory initCode) external payable returns (address newContract)',
  'function deployCreate3(bytes32 salt, bytes memory initCode) external payable returns (address)',
  'function deployCreate3AndInit(bytes32 salt, bytes memory initCode, bytes memory data, tuple(uint256 constructorAmount, uint256 initCallAmount) values) external payable returns (address)',
  'function computeCreate3Address(bytes32 salt, address deployer) external pure returns (address computedAddress)',
  'function computeCreate3Address(bytes32 salt) external view returns (address)',
]

const networkToChainId = {
  polygon: 137n,
  amoy: 80002n,
}

/**
 * Generates a deterministic salt for CREATE3 deployment with guard bytes
 * Format: deployer (20 bytes) + separator (1 byte) + hash (11 bytes) = 32 bytes
 *
 * @param deployer The deployer address
 * @param identifier A unique identifier (contract name + version)
 * @returns bytes32 salt
 */
function generateSalt(deployer: string, identifier: string): string {
  // Hash the identifier (contractName_version)
  const identifierHash = ethers.keccak256(ethers.toUtf8Bytes(identifier))

  // Extract deployer address (20 bytes) - remove '0x' prefix, keep original case
  const deployerBytes = deployer.slice(2).padStart(40, '0')

  // Add separator (1 byte)
  const separator = '00'

  // Take first 11 bytes (22 hex chars) from the identifier hash
  // When bytes32() is applied to >32 bytes, it takes the leftmost 32 bytes
  // So: deployer(20) + separator(1) + hash(11) = 32 bytes
  const hashSuffix = identifierHash.slice(2, 24) // characters 2-24 = 11 bytes

  // Combine: deployer (20 bytes) + separator (1 byte) + hash (11 bytes) = 32 bytes
  return '0x' + deployerBytes + separator + hashSuffix
}

async function deployWithCreate3(deployer: HardhatEthersSigner, contractName: string, salt: string): Promise<string> {
  console.log(`Deploying ${contractName} with Create3...`)
  console.log(`Deployer address: ${deployer.address}`)
  console.log(`Salt identifier: ${salt}`)

  const contractFactory: ContractFactory = await ethers.getContractFactory(contractName)

  // Get the deployment bytecode with constructor arguments
  const bytecode = contractFactory.bytecode

  if (!bytecode) {
    throw new Error('Failed to generate deployment data')
  }

  console.log(`Deployment bytecode length: ${bytecode.length} characters`)

  const createX = new Contract(CREATEX_ADDRESS, CREATEX_ABI, deployer)

  const saltBytes32 = generateSalt(deployer.address, salt)
  console.log(`Salt with guard bytes: ${saltBytes32}`)

  // // Try both methods of computing address
  // const computedAddress1 = await createX['computeCreate3Address(bytes32,address)'](saltBytes32, deployer.address)
  // console.log(`Computed address (with deployer param): ${computedAddress1}`)

  // const computedAddress2 = await createX['computeCreate3Address(bytes32)'](saltBytes32)
  // console.log(`Computed address (view function): ${computedAddress2}`)

  // const computedAddress = computedAddress2  // Use the view function result

  // const existingCode = await ethers.provider.getCode(computedAddress)
  // if (existingCode !== '0x') {
  //   console.log(`Contract already deployed at ${computedAddress}`)
  //   return computedAddress
  // }

  console.log('Deploying contract...')
  let tx, receipt

  try {
    tx = await createX.deployCreate3(saltBytes32, bytecode, { gasLimit: 5000000 })
    console.log(`Transaction sent: ${tx.hash}`)

    receipt = await tx.wait()
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`)
    console.log(`Transaction status: ${receipt.status}`)
    console.log(`Gas used: ${receipt.gasUsed}`)
  } catch (error: any) {
    console.error('Deployment transaction failed:')
    console.error('Error:', error.message)
    if (error.reason) console.error('Reason:', error.reason)
    if (error.data) console.error('Data:', error.data)
    throw error
  }

  if (receipt.status !== 1) {
    throw new Error(`Transaction failed with status: ${receipt.status}`)
  }

  // Parse logs to find the actual deployed address from CreateX event
  // CreateX emits: event ContractCreation(address indexed newContract, bytes32 indexed salt)
  // The newContract address is in topics[1]
  console.log(`\nParsing transaction logs...`)
  console.log(`Number of logs: ${receipt.logs.length}`)

  let actualDeployedAddress: string | null = null

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i]
    console.log(
      `Log ${i}: address=${log.address}, topics=${log.topics.length}, topics[0]=${log.topics[0]?.slice(0, 10)}...`
    )

    // Look for ContractCreation event from CreateX
    // Event signature: ContractCreation(address indexed newContract)
    if (log.address.toLowerCase() === CREATEX_ADDRESS.toLowerCase() && log.topics.length == 2) {
      // First topic is event signature, second topic is the deployed contract address
      const deployedAddressFromLog = '0x' + log.topics[1].slice(-40)
      console.log(`  -> Found ContractCreation event, deployed address: ${deployedAddressFromLog}`)
      actualDeployedAddress = deployedAddressFromLog
    }
  }

  if (!actualDeployedAddress) {
    throw new Error('Could not find deployed contract address in transaction logs')
  }

  console.log(`\nActual deployed address from logs: ${actualDeployedAddress}`)
  // console.log(`Computed address: ${computedAddress}`)
  // console.log(`Addresses match: ${actualDeployedAddress.toLowerCase() === computedAddress.toLowerCase()}`)

  // Verify code exists at the actual deployed address
  const deployedCode = await ethers.provider.getCode(actualDeployedAddress)
  if (deployedCode === '0x') {
    throw new Error(`No code found at deployed address ${actualDeployedAddress}`)
  }

  console.log(`Code length at deployed address: ${deployedCode.length}`)
  console.log(`Contract deployed successfully at: ${actualDeployedAddress}\n`)

  return actualDeployedAddress
}

async function deployProxyWithCreate3(
  deployer: HardhatEthersSigner,
  implementationAddress: string,
  initializeData: string,
  salt: string
): Promise<string> {
  console.log(`Deploying ERC1967Proxy with Create3...`)
  console.log(`Implementation: ${implementationAddress}`)
  console.log(`Salt identifier: ${salt}`)
  const proxyFactory = await ethers.getContractFactory('ERC1967Proxy')

  // Get the deployment bytecode with constructor arguments
  const deploymentData = (await proxyFactory.getDeployTransaction(implementationAddress, initializeData)).data

  if (!deploymentData) {
    throw new Error('Failed to generate proxy deployment data')
  }

  console.log(`Proxy deployment bytecode length: ${deploymentData.length} characters`)

  const createX = new Contract(CREATEX_ADDRESS, CREATEX_ABI, deployer)

  const saltBytes32 = generateSalt(deployer.address, salt)
  console.log(`Generated salt with guard bytes: ${saltBytes32}`)

  // // Try both methods of computing address
  // const computedAddress1 = await createX['computeCreate3Address(bytes32,address)'](saltBytes32, deployer.address)
  // console.log(`Computed proxy address (with deployer param): ${computedAddress1}`)

  // const computedAddress2 = await createX['computeCreate3Address(bytes32)'](saltBytes32)
  // console.log(`Computed proxy address (view function): ${computedAddress2}`)

  // const computedAddress = computedAddress2  // Use the view function result

  // // Check if proxy is already deployed
  // const existingCode = await ethers.provider.getCode(computedAddress)
  // if (existingCode !== '0x') {
  //   console.log(`Proxy already deployed at ${computedAddress}`)
  //   return computedAddress
  // }

  console.log('Deploying proxy...')
  let tx, receipt

  try {
    tx = await createX.deployCreate3(saltBytes32, deploymentData, { gasLimit: 5000000 })
    console.log(`Transaction sent: ${tx.hash}`)

    receipt = await tx.wait()
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`)
    console.log(`Transaction status: ${receipt.status}`)
    console.log(`Gas used: ${receipt.gasUsed}`)
  } catch (error: any) {
    console.error('Proxy deployment transaction failed:')
    console.error('Error:', error.message)
    if (error.reason) console.error('Reason:', error.reason)
    if (error.data) console.error('Data:', error.data)
    throw error
  }

  if (receipt.status !== 1) {
    throw new Error(`Proxy deployment transaction failed with status: ${receipt.status}`)
  }

  // Parse logs to find the actual deployed address from CreateX event
  console.log(`\nParsing proxy deployment logs...`)
  console.log(`Number of logs: ${receipt.logs.length}`)

  let actualDeployedAddress: string | null = null

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i]
    console.log(`Log ${i}: address=${log.address}, topics=${log.topics.length}`)

    // Look for ContractCreation event from CreateX
    if (log.address.toLowerCase() === CREATEX_ADDRESS.toLowerCase() && log.topics.length == 2) {
      const deployedAddressFromLog = '0x' + log.topics[1].slice(-40)
      console.log(`  -> Found ContractCreation event, deployed address: ${deployedAddressFromLog}`)
      actualDeployedAddress = deployedAddressFromLog
    }
  }

  if (!actualDeployedAddress) {
    throw new Error('Could not find deployed proxy address in transaction logs')
  }

  console.log(`\nActual deployed proxy address from logs: ${actualDeployedAddress}`)
  // console.log(`Computed address: ${computedAddress}`)
  // console.log(`Addresses match: ${actualDeployedAddress.toLowerCase() === computedAddress.toLowerCase()}`)

  // Verify code exists at the actual deployed address
  const deployedCode = await ethers.provider.getCode(actualDeployedAddress)
  if (deployedCode === '0x') {
    throw new Error(`No code found at deployed proxy address ${actualDeployedAddress}`)
  }

  console.log(`Code length at deployed proxy: ${deployedCode.length}`)
  console.log(`Proxy deployed successfully at: ${actualDeployedAddress}\n`)

  return actualDeployedAddress
}

// Function to compute addresses before deployment
async function computeAddresses() {
  const [deployer] = await ethers.getSigners()
  const createX = new Contract(CREATEX_ADDRESS, CREATEX_ABI, deployer)

  const salts = ['TemplateImplementation', 'TemplateProxy']

  console.log('Computed addresses:')
  for (const salt of salts) {
    const saltBytes32 = generateSalt(deployer.address, salt)
    const address = await createX['computeCreate3Address(bytes32,address)'](saltBytes32, deployer.address)
    console.log(`${salt}: ${address}`)
    const address1 = await createX['computeCreate3Address(bytes32)'](saltBytes32)
    console.log(`${salt}: ${address1}`)
  }
}

async function main() {
  let [deployer, user1] = await ethers.getSigners()
  let { name, chainId } = await ethers.provider.getNetwork()

  if (name === 'localhost') {
    name = 'amoy'
    chainId = networkToChainId[name as keyof typeof networkToChainId]

    // 0xCED3c922200559128930180d3f0bfFd4d9f4F123 Prod account
    // 0xC008EF40B0b42AAD7e34879EB024385024f753ea Shared dev account
    // 0xD64b27cA7F7d4447dFa8cb8701497Fb6eE774F6a Deployer create3
    deployer = await ethers.getImpersonatedSigner('0xD64b27cA7F7d4447dFa8cb8701497Fb6eE774F6a')

    await user1.sendTransaction({
      to: deployer.address,
      value: ethers.parseEther('10'),
    })
  }

  console.log(`Deploying on network: ${name} (${chainId})\n`)

  // Verify CreateX contract exists
  const createXCode = await ethers.provider.getCode(CREATEX_ADDRESS)
  if (createXCode === '0x') {
    throw new Error(
      `CreateX contract not found at ${CREATEX_ADDRESS}. Make sure you're on a supported network or the fork has the CreateX contract.`
    )
  }
  console.log(`CreateX contract verified at: ${CREATEX_ADDRESS}\n`)

  try {
    const templateImplAddress = await deployWithCreate3(deployer, 'Template', 'TemplateImplementation_1.0.1')

    const templateFactory = await ethers.getContractFactory('Template')
    const templateInitData = templateFactory.interface.encodeFunctionData('initialize', [
      process.env.TEMPLATE_BASE_URI || 'https://assets.dimo.xyz/ipfs/',
    ])

    const templateProxyAddress = await deployProxyWithCreate3(
      deployer,
      templateImplAddress,
      templateInitData,
      'TemplateProxy_1.0.1'
    )

    console.log('\n=== Deployment Summary ===')
    console.log(`Template Implementation: ${templateImplAddress}`)
    console.log(`Template Proxy: ${templateProxyAddress}`)

    const instances = getAddresses()
    instances[name].Template.implementation = templateImplAddress
    instances[name].Template.proxy = templateProxyAddress
    writeAddresses(instances, name)
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exit(1)
  }
}

export { deployWithCreate3, deployProxyWithCreate3, computeAddresses }

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

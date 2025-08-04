import { ethers } from 'hardhat'
import { Template, Sacd } from '../typechain-types'

/**
 * Example script demonstrating Template contract usage with SACD
 */
async function main() {
  const [deployer, user1, user2] = await ethers.getSigners()

  console.log('Deploying contracts...')

  // Deploy SACD first
  const SacdFactory = await ethers.getContractFactory('Sacd')
  const sacdImplementation = await SacdFactory.deploy()
  await sacdImplementation.waitForDeployment()

  const ProxyFactory = await ethers.getContractFactory('ERC1967Proxy')
  const sacdInitialize = await sacdImplementation.initialize.populateTransaction()
  const sacdProxy = await ProxyFactory.deploy(await sacdImplementation.getAddress(), sacdInitialize.data)
  await sacdProxy.waitForDeployment()

  const sacd = await ethers.getContractAt('Sacd', await sacdProxy.getAddress())

  // Deploy Template contract
  const TemplateFactory = await ethers.getContractFactory('Template')
  const templateImplementation = await TemplateFactory.deploy()
  await templateImplementation.waitForDeployment()

  const templateInitialize = await templateImplementation.initialize.populateTransaction()
  const templateProxy = await ProxyFactory.deploy(await templateImplementation.getAddress(), templateInitialize.data)
  await templateProxy.waitForDeployment()

  const template = await ethers.getContractAt('Template', await templateProxy.getAddress())

  console.log('SACD deployed to:', await sacd.getAddress())
  console.log('Template deployed to:', await template.getAddress())

  // Example 1: Create a template
  console.log('\n=== Creating Template ===')
  const templatePermissions = 0x12345678
  const templateIpfsUrl = 'ipfs://QmExampleTemplate123'

  const tx1 = await template.createTemplate(templatePermissions, templateIpfsUrl)
  const receipt1 = await tx1.wait()

  // Get the template ID from the event
  const templateCreatedEvent = receipt1?.logs.find((log) => {
    try {
      const parsed = template.interface.parseLog(log as any)
      return parsed?.name === 'TemplateCreated'
    } catch {
      return false
    }
  })

  const templateId = templateCreatedEvent ? template.interface.parseLog(templateCreatedEvent as any)?.args?.[0] : 1
  console.log('Template created with ID:', templateId)

  // Example 2: Get template data for SACD creation
  console.log('\n=== Getting Template Data ===')
  const customSource = 'example-source'
  const templateData = await template.getTemplate(templateId)
  const permissions = templateData.permissions
  const finalSource = templateData.ipfsUrl + '&source=' + customSource

  console.log('Template permissions:', permissions.toString(16))
  console.log('Combined source:', finalSource)

  // Example 3: Create a mock ERC721 token for demonstration
  console.log('\n=== Creating Mock ERC721 ===')
  const MockERC721Factory = await ethers.getContractFactory('MockERC721withSacd')
  const mockERC721 = await MockERC721Factory.deploy(await sacd.getAddress())
  await mockERC721.waitForDeployment()

  // Mint a token to user1
  await mockERC721.mint(user1.address)
  console.log('Mock ERC721 deployed to:', await mockERC721.getAddress())
  console.log('Token 1 minted to:', user1.address)

  // Example 4: Use template to create SACD permissions
  console.log('\n=== Creating SACD with Template ===')
  const asset = await mockERC721.getAddress()
  const tokenId = 1
  const grantee = user2.address
  const expiration = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

  // Method 1: Get template data and call SACD directly
  const templateDataForSacd = await template.getTemplate(templateId)
  const templatePermissionsForSacd = templateDataForSacd.permissions
  const templateSource = templateDataForSacd.ipfsUrl + '&source=direct-method'

  await sacd
    .connect(user1)
    .setPermissions(asset, tokenId, grantee, templatePermissionsForSacd, expiration, templateSource, 0n)

  console.log('SACD permissions created using template')
  console.log('Grantee:', grantee)
  console.log('Permissions:', templatePermissionsForSacd.toString(16))
  console.log('Source:', templateSource)

  // Verify the permissions were set
  const hasPermissions = await sacd.hasPermissions(asset, tokenId, grantee, templatePermissionsForSacd)
  console.log('Permissions verified:', hasPermissions)

  // Example 5: List templates by creator
  console.log('\n=== Listing Templates by Creator ===')
  const creatorTemplates = await template.getTemplatesByCreator(deployer.address)
  console.log(
    'Templates created by deployer:',
    creatorTemplates.map((id) => id.toString())
  )

  // Example 6: Get template details
  console.log('\n=== Template Details ===')
  const templateDetails = await template.getTemplate(templateId)
  console.log('Template ID:', templateDetails.templateId.toString())
  console.log('Creator:', templateDetails.creator)
  console.log('Permissions:', templateDetails.permissions.toString(16))
  console.log('IPFS URL:', templateDetails.ipfsUrl)
  console.log('Is Active:', templateDetails.isActive)
  console.log('Created At:', new Date(Number(templateDetails.createdAt) * 1000).toISOString())

  console.log('\n=== Example Complete ===')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

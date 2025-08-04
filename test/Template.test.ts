import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { Template, Sacd, MockERC721withSacd } from '../typechain-types'

describe('Template Contract', function () {
  let template: Template
  let sacd: Sacd
  let mockERC721: MockERC721withSacd
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress
  let user3: SignerWithAddress

  beforeEach(async function () {
    ;[owner, user1, user2, user3] = await ethers.getSigners()

    // Deploy SACD first
    const SacdFactory = await ethers.getContractFactory('Sacd')
    const sacdImplementation = await SacdFactory.deploy()
    await sacdImplementation.waitForDeployment()

    const ProxyFactory = await ethers.getContractFactory('ERC1967Proxy')
    const sacdInitialize = await sacdImplementation.initialize.populateTransaction()
    const sacdProxy = await ProxyFactory.deploy(await sacdImplementation.getAddress(), sacdInitialize.data)
    await sacdProxy.waitForDeployment()

    sacd = await ethers.getContractAt('Sacd', await sacdProxy.getAddress())

    // Deploy Template contract
    const TemplateFactory = await ethers.getContractFactory('Template')
    const templateImplementation = await TemplateFactory.deploy()
    await templateImplementation.waitForDeployment()

    const templateInitialize = await templateImplementation.initialize.populateTransaction()
    const templateProxy = await ProxyFactory.deploy(await templateImplementation.getAddress(), templateInitialize.data)
    await templateProxy.waitForDeployment()

    template = await ethers.getContractAt('Template', await templateProxy.getAddress())

    // Deploy mock ERC721
    const MockERC721Factory = await ethers.getContractFactory('MockERC721withSacd')
    mockERC721 = await MockERC721Factory.deploy(await sacd.getAddress())
    await mockERC721.waitForDeployment()
  })

  describe('Template Management', function () {
    it('Should create a template successfully', async function () {
      const permissions = 0x12345678
      const ipfsUrl = 'ipfs://QmTest123'

      await expect(template.createTemplate(permissions, ipfsUrl))
        .to.emit(template, 'TemplateCreated')
        .withArgs(1, owner.address, permissions, ipfsUrl)

      const templateData = await template.getTemplate(1)
      expect(templateData.templateId).to.equal(1)
      expect(templateData.creator).to.equal(owner.address)
      expect(templateData.permissions).to.equal(permissions)
      expect(templateData.ipfsUrl).to.equal(ipfsUrl)
      expect(templateData.isActive).to.be.true
    })

    it('Should not allow non-managers to create templates', async function () {
      const permissions = 0x12345678
      const ipfsUrl = 'ipfs://QmTest123'

      await expect(template.connect(user1).createTemplate(permissions, ipfsUrl)).to.be.revertedWithCustomError(
        template,
        'AccessControlUnauthorizedAccount'
      )
    })

    it('Should not create template with empty IPFS URL', async function () {
      const permissions = 0x12345678
      const ipfsUrl = ''

      await expect(template.createTemplate(permissions, ipfsUrl)).to.be.revertedWithCustomError(
        template,
        'InvalidTemplateData'
      )
    })

    it('Should deactivate template successfully', async function () {
      // Create template first
      const permissions = 0x12345678
      const ipfsUrl = 'ipfs://QmTest123'
      await template.createTemplate(permissions, ipfsUrl)

      // Deactivate template
      await expect(template.deactivateTemplate(1)).to.emit(template, 'TemplateDeactivated').withArgs(1, owner.address)

      const templateData = await template.getTemplate(1)
      expect(templateData.isActive).to.be.false
    })

    it('Should get templates by creator', async function () {
      // Create multiple templates
      await template.createTemplate(0x11111111, 'ipfs://QmTest1')
      await template.createTemplate(0x22222222, 'ipfs://QmTest2')
      await template.createTemplate(0x33333333, 'ipfs://QmTest3')

      const creatorTemplates = await template.getTemplatesByCreator(owner.address)
      expect(creatorTemplates).to.have.length(3)
      expect(creatorTemplates[0]).to.equal(1)
      expect(creatorTemplates[1]).to.equal(2)
      expect(creatorTemplates[2]).to.equal(3)
    })

    it('Should get template count', async function () {
      expect(await template.getTemplateCount()).to.equal(0)

      await template.createTemplate(0x11111111, 'ipfs://QmTest1')
      expect(await template.getTemplateCount()).to.equal(1)

      await template.createTemplate(0x22222222, 'ipfs://QmTest2')
      expect(await template.getTemplateCount()).to.equal(2)
    })

    it('Should check if template is active', async function () {
      await template.createTemplate(0x11111111, 'ipfs://QmTest1')

      expect(await template.isTemplateActive(1)).to.be.true

      await template.deactivateTemplate(1)
      expect(await template.isTemplateActive(1)).to.be.false
    })
  })

  describe('SACD Integration', function () {
    beforeEach(async function () {
      // Create a template
      await template.createTemplate(0x12345678, 'ipfs://QmTemplate123')

      // Mint a token to user1
      await mockERC721.mint(user1.address)
    })

    it('Should check template status in SACD permissions', async function () {
      const asset = await mockERC721.getAddress()
      const tokenId = 1
      const grantee = user2.address
      const templateId = 1
      const expiration = Math.floor(Date.now() / 1000) + 3600

      // Get template data directly
      const templateData = await template.getTemplate(templateId)
      const permissions = templateData.permissions
      const finalSource = templateData.ipfsUrl + '&source=template-status-test'

      // Call SACD with template ID
      await sacd
        .connect(user1)
        .setPermissions(asset, tokenId, grantee, permissions, expiration, finalSource, templateId)

      // Set the template contract in SACD
      await sacd.setTemplateContract(await template.getAddress())

      // Verify permissions work when template is active
      expect(await sacd.hasPermissions(asset, tokenId, grantee, permissions)).to.be.true

      // Deactivate the template
      await template.deactivateTemplate(templateId)

      // Verify permissions are revoked when template is deactivated
      expect(await sacd.hasPermissions(asset, tokenId, grantee, permissions)).to.be.false
    })
  })
})

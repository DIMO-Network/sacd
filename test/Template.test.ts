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
      const templateURI = 'ipfs://QmTest123'

      await expect(template.createTemplate(permissions, templateURI))
        .to.emit(template, 'TemplateCreated')
        .withArgs(1, owner.address, permissions, templateURI)

      const templateData = await template.getTemplate(1)
      expect(templateData.templateId).to.equal(1)
      expect(templateData.owner).to.equal(owner.address)
      expect(templateData.permissions).to.equal(permissions)
      expect(templateData.templateURI).to.equal(templateURI)
      expect(templateData.isActive).to.be.true
    })

    it('Should not allow non-managers to create templates', async function () {
      const permissions = 0x12345678
      const templateURI = 'ipfs://QmTest123'

      await expect(template.connect(user1).createTemplate(permissions, templateURI)).to.be.revertedWithCustomError(
        template,
        'AccessControlUnauthorizedAccount'
      )
    })

    it('Should not create template with empty template URI', async function () {
      const permissions = 0x12345678
      const templateURI = ''

      await expect(template.createTemplate(permissions, templateURI)).to.be.revertedWithCustomError(
        template,
        'InvalidTemplateData'
      )
    })

    it('Should deactivate template successfully', async function () {
      // Create template first
      const permissions = 0x12345678
      const templateURI = 'ipfs://QmTest123'
      await template.createTemplate(permissions, templateURI)

      // Deactivate template
      await expect(template.deactivateTemplate(1)).to.emit(template, 'TemplateDeactivated').withArgs(1, owner.address)

      const templateData = await template.getTemplate(1)
      expect(templateData.isActive).to.be.false
    })

    it('Should check if template is active', async function () {
      await template.createTemplate(0x11111111, 'ipfs://QmTest1')

      expect(await template.isTemplateActive(1)).to.be.true

      await template.deactivateTemplate(1)
      expect(await template.isTemplateActive(1)).to.be.false
    })
  })

  describe('ERC721 Functionality', function () {
    it('Should mint NFT when creating template', async function () {
      const permissions = 0x12345678
      const templateURI = 'ipfs://QmTest123'

      await template.createTemplate(permissions, templateURI)

      // Check that NFT was minted to creator
      expect(await template.ownerOf(1)).to.equal(owner.address)
      expect(await template.balanceOf(owner.address)).to.equal(1)
    })

    it('Should return correct tokenURI for IPFS URLs', async function () {
      const permissions = 0x12345678
      const templateURI = 'ipfs://QmTest123'

      await template.createTemplate(permissions, templateURI)

      // Check tokenURI returns the DIMO assets URL with IPFS URL
      expect(await template.tokenURI(1)).to.equal('https://assets.dimo.org/' + templateURI)
    })

    it('Should return correct totalSupply', async function () {
      // Initially no templates
      expect(await template.totalSupply()).to.equal(0)

      // Create templates
      await template.createTemplate(0x11111111, 'ipfs://QmTest1')
      expect(await template.totalSupply()).to.equal(1)

      await template.createTemplate(0x22222222, 'ipfs://QmTest2')
      expect(await template.totalSupply()).to.equal(2)
    })

    it('Should allow NFT transfer', async function () {
      const permissions = 0x12345678
      const ipfsUrl = 'ipfs://QmTest123'

      await template.createTemplate(permissions, ipfsUrl)

      // Transfer NFT to user1
      await template.transferFrom(owner.address, user1.address, 1)

      // Check ownership changed
      expect(await template.ownerOf(1)).to.equal(user1.address)
      expect(await template.balanceOf(owner.address)).to.equal(0)
      expect(await template.balanceOf(user1.address)).to.equal(1)
    })

    it('Should revert tokenURI for non-existent template', async function () {
      await expect(template.tokenURI(999)).to.be.revertedWithCustomError(template, 'TemplateNotFound')
    })

    it('Should return DIMO assets URL format for IPFS tokenURI', async function () {
      const permissions = 0x12345678
      const templateURI = 'ipfs://QmTest123'

      await template.createTemplate(permissions, templateURI)

      const tokenURI = await template.tokenURI(1)
      expect(tokenURI).to.equal('https://assets.dimo.org/ipfs://QmTest123')
      expect(tokenURI).to.include('https://assets.dimo.org/')
      expect(tokenURI).to.include(templateURI)
    })

    it('Should return templateURI as-is for non-IPFS URLs', async function () {
      const permissions = 0x12345678
      const templateURI = 'https://example.com/template.json'

      await template.createTemplate(permissions, templateURI)

      const tokenURI = await template.tokenURI(1)
      expect(tokenURI).to.equal(templateURI)
      expect(tokenURI).to.not.include('https://assets.dimo.org/')
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
      const finalSource = templateData.templateURI

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

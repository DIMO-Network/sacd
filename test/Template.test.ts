import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { Template, Sacd, MockERC721withSacd } from '../typechain-types'

import * as C from './constants'

describe('Template Contract', function () {
  let template: Template
  let sacd: Sacd
  let mockERC721: MockERC721withSacd
  let owner: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress

  beforeEach(async function () {
    ;[owner, user1, user2] = await ethers.getSigners()

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

    const templateInitialize = await templateImplementation.initialize.populateTransaction(C.TEMPLATE_BASE_URI)
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
      await expect(template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE))
        .to.emit(template, 'TemplateCreated')
        .withArgs(1, owner.address, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      const templateData = await template.getTemplate(1)
      expect(templateData.templateId).to.equal(1)
      expect(templateData.owner).to.equal(owner.address)
      expect(templateData.permissions).to.equal(C.MOCK_TEMPLATE_PERMISSIONS)
      expect(templateData.templateURI).to.equal(C.MOCK_TEMPLATE_SOURCE)
      expect(templateData.isActive).to.be.true
    })

    it('Should not allow non-managers to create templates', async function () {
      await expect(
        template.connect(user1).createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
      ).to.be.revertedWithCustomError(template, 'AccessControlUnauthorizedAccount')
    })

    it('Should not create template with empty template URI', async function () {
      const templateURI = ''

      await expect(template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, templateURI)).to.be.revertedWithCustomError(
        template,
        'InvalidTemplateData'
      )
    })

    it('Should deactivate template successfully', async function () {
      // Create template first
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

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
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check that NFT was minted to creator
      expect(await template.ownerOf(1)).to.equal(owner.address)
      expect(await template.balanceOf(owner.address)).to.equal(1)
    })

    it('Should return correct tokenURI for IPFS URLs', async function () {
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check tokenURI returns the DIMO assets URL with IPFS URL
      expect(await template.tokenURI(1)).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_CID)
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
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

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
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      const tokenURI = await template.tokenURI(1)
      expect(tokenURI).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_CID)
    })

    it('Should return templateURI as-is for non-IPFS URLs', async function () {
      const templateURI = 'https://example.com/template.json'

      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, templateURI)

      const tokenURI = await template.tokenURI(1)
      expect(tokenURI).to.equal(templateURI)
      expect(tokenURI).to.not.include(C.TEMPLATE_BASE_URI)
    })
  })

  describe('SACD Integration', function () {
    beforeEach(async function () {
      // Create a template
      await template.createTemplate(C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

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
        .setPermissions(asset, tokenId, grantee, permissions, expiration, templateId, finalSource)

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

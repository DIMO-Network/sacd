import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre, { ignition } from 'hardhat'

import * as C from './constants'
import SacdModule from '../ignition/modules/Sacd'
import TemplateModule from '../ignition/modules/Template'
import { stringToUint256WithHash } from '../utils/helpers'
import type { Sacd, Template } from '../typechain-types'

describe('Template', function () {
  async function setup() {
    const [owner, user1, user2, otherAccount] = await hre.ethers.getSigners()

    // Deploy template contract
    const template = (await ignition.deploy(TemplateModule)).template as unknown as Template

    const sacd = (await ignition.deploy(SacdModule)).sacd as unknown as Sacd

    return { owner, user1, user2, otherAccount, template, sacd }
  }
  async function setupWithMint() {
    const vars = await loadFixture(setup)

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')
    const mockErc20Factory = await hre.ethers.getContractFactory('MockERC20')

    const mockErc721 = await mockErc721Factory.deploy(await vars.sacd.getAddress())
    const mockErc20 = await mockErc20Factory.deploy()

    await vars.template.createTemplate(vars.owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
    await mockErc721.mint(vars.user1.address)

    return { ...vars, mockErc721, mockErc20 }
  }

  describe('Template Management', function () {
    it('Should create a template successfully', async function () {
      const { template, owner } = await loadFixture(setup)

      await expect(template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE))
        .to.emit(template, 'TemplateCreated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID, owner.address, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      const templateData = await template.getTemplate(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(templateData.permissions).to.equal(C.MOCK_TEMPLATE_PERMISSIONS)
      expect(templateData.templateURI).to.equal(C.MOCK_TEMPLATE_SOURCE)
      expect(templateData.isActive).to.be.true
    })
    it('Should not allow non-managers to create templates', async function () {
      const { template, owner, user1 } = await loadFixture(setup)

      await expect(
        template.connect(user1).createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
      ).to.be.revertedWithCustomError(template, 'AccessControlUnauthorizedAccount')
    })

    it('Should not create template with empty template URI', async function () {
      const { template, owner } = await loadFixture(setup)

      const templateURI = ''

      await expect(
        template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, templateURI)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template with invalid CID format (46 chars but not starting with Qm)', async function () {
      const { template, owner } = await loadFixture(setup)

      // Create an invalid CID that has 46 characters but doesn't start with Qm
      const invalidCid = 'XX' + 'a'.repeat(44) // 46 characters, starts with XX instead of Qm
      const templateURI = 'ipfs://' + invalidCid

      await expect(
        template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, templateURI)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template without ipfs:// prefix', async function () {
      const { template, owner } = await loadFixture(setup)

      // Use a valid CID but without the ipfs:// prefix
      const templateURI = 'ffff:///' + C.MOCK_TEMPLATE_CID // Missing ipfs:// prefix

      await expect(
        template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, templateURI)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template with CID of incorrect length', async function () {
      const { template, owner } = await loadFixture(setup)

      // Create a CID that starts with Qm but is too short
      const shortCid = 'Qm' + 'a'.repeat(20) // Only 22 characters instead of 46
      const templateURI = 'ipfs://' + shortCid

      await expect(
        template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, templateURI)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should deactivate template successfully', async function () {
      const { template, owner } = await loadFixture(setup)

      // Create template first
      await template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Deactivate template
      await expect(template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.emit(template, 'TemplateDeactivated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)

      const templateData = await template.getTemplate(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(templateData.isActive).to.be.false
    })
    it('Should check if template is active', async function () {
      const { template, owner } = await loadFixture(setup)
      const cid = 'QmaA14Co9Q9AuNHcs6KH2ZmJ8sCTwW6ZN7TJfxNcXnrUAX'
      const templateId = stringToUint256WithHash(cid)

      await template.createTemplate(owner, 0x11111111, 'ipfs://' + cid)

      expect(await template.isTemplateActive(templateId)).to.be.true

      await template.deactivateTemplate(templateId)
      expect(await template.isTemplateActive(templateId)).to.be.false
    })
  })

  describe('ERC721 Functionality', function () {
    it('Should mint NFT when creating template', async function () {
      const { template, owner } = await loadFixture(setup)

      await template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check that NFT was minted to creator
      expect(await template.ownerOf(C.MOCK_TEMPLATE_TOKEN_ID)).to.equal(owner.address)
      expect(await template.balanceOf(owner.address)).to.equal(1)
    })

    it('Should return correct tokenURI for IPFS URLs', async function () {
      const { template, owner } = await loadFixture(setup)

      await template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check tokenURI returns the DIMO assets URL with IPFS URL
      expect(await template.tokenURI(C.MOCK_TEMPLATE_TOKEN_ID)).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_CID)
    })

    it('Should allow NFT transfer', async function () {
      const { template, owner, user1 } = await loadFixture(setup)

      await template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Transfer NFT to user1
      await template.transferFrom(owner.address, user1.address, C.MOCK_TEMPLATE_TOKEN_ID)

      // Check ownership changed
      expect(await template.ownerOf(C.MOCK_TEMPLATE_TOKEN_ID)).to.equal(user1.address)
      expect(await template.balanceOf(owner.address)).to.equal(0)
      expect(await template.balanceOf(user1.address)).to.equal(1)
    })

    it('Should return an empty sring for non-existent template', async function () {
      const { template } = await loadFixture(setup)

      expect(template.tokenURI(999)).to.be.empty
    })

    it('Should return DIMO assets URL format for IPFS tokenURI', async function () {
      const { template, owner } = await loadFixture(setup)

      await template.createTemplate(owner, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      const tokenURI = await template.tokenURI(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(tokenURI).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_CID)
    })
  })

  describe('SACD Integration', function () {
    it('Should check template status in SACD permissions', async function () {
      const { template, sacd, user1, user2, mockErc721 } = await loadFixture(setupWithMint)

      const asset = await mockErc721.getAddress()
      const tokenId = 1
      const grantee = user2.address
      const templateId = C.MOCK_TEMPLATE_TOKEN_ID
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

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre, { ignition } from 'hardhat'

import * as C from './constants'
import SacdModule from '../ignition/modules/Sacd'
import TemplateModule from '../ignition/modules/Template'
import type { Sacd, Template } from '../typechain-types'

describe('Template', function () {
  async function setup() {
    const [owner, user1, user2, otherAccount] = await hre.ethers.getSigners()

    // Deploy template contract
    const template = (
      await ignition.deploy(TemplateModule, {
        parameters: {
          TemplateProxyModule: {
            admin: owner.address,
          },
        },
      })
    ).template as unknown as Template
    const sacd = (await ignition.deploy(SacdModule)).sacd as unknown as Sacd

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')

    const mockErc721 = await mockErc721Factory.deploy(await sacd.getAddress())
    const MOCK_ERC_721_ADDRESS = await mockErc721.getAddress()

    return { owner, user1, user2, otherAccount, template, sacd, mockErc721, MOCK_ERC_721_ADDRESS }
  }
  async function setupWithMint() {
    const vars = await loadFixture(setup)

    await vars.template.createTemplate(
      vars.owner,
      vars.MOCK_ERC_721_ADDRESS,
      C.MOCK_TEMPLATE_PERMISSIONS,
      C.MOCK_TEMPLATE_SOURCE
    )
    await vars.mockErc721.mint(vars.user1.address)

    return vars
  }

  describe('Template Management', function () {
    it('Should create a template successfully', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
      )
        .to.emit(template, 'TemplateCreated')
        .withArgs(
          C.MOCK_TEMPLATE_TOKEN_ID,
          owner.address,
          MOCK_ERC_721_ADDRESS,
          C.MOCK_TEMPLATE_PERMISSIONS,
          C.MOCK_TEMPLATE_SOURCE
        )
        .to.emit(template, 'TemplateActivated')

      const templateData = await template.templates(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(templateData.asset).to.equal(MOCK_ERC_721_ADDRESS)
      expect(templateData.permissions).to.equal(C.MOCK_TEMPLATE_PERMISSIONS)
      expect(templateData.source).to.equal(C.MOCK_TEMPLATE_SOURCE)
      expect(templateData.isActive).to.be.true
    })
    it('Should not allow non-managers to create templates', async function () {
      const { template, owner, user1, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await expect(
        template
          .connect(user1)
          .createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
      )
        .to.be.revertedWithCustomError(template, 'AccessControlUnauthorizedAccount')
        .withArgs(user1.address, C.TEMPLATE_MANAGER_ROLE)
    })
    it('Should not create template with empty template URI', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      const source = ''

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, source)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template with invalid CID format (46 chars but not starting with Qm)', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      // Create an invalid CID that has 46 characters but doesn't start with Qm
      const invalidCid = 'XX' + 'a'.repeat(44) // 46 characters, starts with XX instead of Qm
      const source = 'ipfs://' + invalidCid

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, source)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template with invalid CID format (46 chars, starting with Q, but not following m)', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      // Create an invalid CID that has 46 characters but doesn't start with Qm
      const invalidCid = 'QX' + 'a'.repeat(44) // 46 characters, starts with XX instead of Qm
      const source = 'ipfs://' + invalidCid

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, source)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template with CID of incorrect length', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      // Create a CID that starts with Qm but is too short
      const shortCid = 'Qm' + 'a'.repeat(20) // Only 22 characters instead of 46
      const source = 'ipfs://' + shortCid

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, source)
      ).to.be.revertedWithCustomError(template, 'InvalidTemplateData')
    })
    it('Should not create template if CID was already used', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setupWithMint)

      await expect(
        template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)
      )
        .to.be.revertedWithCustomError(template, 'TemplateAlreadyExists')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)
    })
    it('Should revert if template ID does not exist when activate', async function () {
      const { template } = await loadFixture(setup)

      await expect(template.activateTemplate(99n))
        .to.be.revertedWithCustomError(template, 'TemplateNotFound')
        .withArgs(99n)
    })
    it('Should revert if caller is not the template ID owner when activate', async function () {
      const { template, owner, otherAccount, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Deactivate template
      await expect(template.connect(otherAccount).activateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.be.revertedWithCustomError(template, 'Unauthorized')
        .withArgs(otherAccount.address, C.MOCK_TEMPLATE_TOKEN_ID)
    })
    it('Should revert if template is already activated', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      await expect(template.activateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.be.revertedWithCustomError(template, 'TemplateAlreadyActivated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)
    })
    it('Should deactivate template successfully', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      // Create template first
      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Deactivate template
      await expect(template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.emit(template, 'TemplateDeactivated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)

      const templateData = await template.templates(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(templateData.isActive).to.be.false
    })

    it('Should revert if template ID does not exist when deactivate', async function () {
      const { template } = await loadFixture(setup)

      await expect(template.deactivateTemplate(99n))
        .to.be.revertedWithCustomError(template, 'TemplateNotFound')
        .withArgs(99n)
    })
    it('Should revert if caller is not the template ID owner when deactivate', async function () {
      const { template, owner, otherAccount, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Deactivate template
      await expect(template.connect(otherAccount).deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.be.revertedWithCustomError(template, 'Unauthorized')
        .withArgs(otherAccount.address, C.MOCK_TEMPLATE_TOKEN_ID)
    })
    it('Should revert if template is already deactivated', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

      await expect(template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.be.revertedWithCustomError(template, 'TemplateAlreadyDeactivated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)
    })
    it('Should deactivate template successfully', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      // Create template first
      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Deactivate template
      await expect(template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID))
        .to.emit(template, 'TemplateDeactivated')
        .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)

      const templateData = await template.templates(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(templateData.isActive).to.be.false
    })
    it('Should check if template is active', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      expect(await template.isTemplateActive(C.MOCK_TEMPLATE_TOKEN_ID)).to.be.true

      await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

      expect(await template.isTemplateActive(C.MOCK_TEMPLATE_TOKEN_ID)).to.be.false

      // Template does not exist
      expect(await template.isTemplateActive(99n)).to.be.false
    })
  })

  describe('ERC721 Functionality', function () {
    it('Should mint NFT when creating template', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check that NFT was minted to creator
      expect(await template.ownerOf(C.MOCK_TEMPLATE_TOKEN_ID)).to.equal(owner.address)
      expect(await template.balanceOf(owner.address)).to.equal(1)
    })

    it('Should return correct tokenURI for IPFS URLs', async function () {
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      // Check tokenURI returns the DIMO assets URL with IPFS URL
      expect(await template.tokenURI(C.MOCK_TEMPLATE_TOKEN_ID)).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_SOURCE)
    })

    it('Should allow NFT transfer', async function () {
      const { template, owner, user1, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

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
      const { template, owner, MOCK_ERC_721_ADDRESS } = await loadFixture(setup)

      await template.createTemplate(owner, MOCK_ERC_721_ADDRESS, C.MOCK_TEMPLATE_PERMISSIONS, C.MOCK_TEMPLATE_SOURCE)

      const tokenURI = await template.tokenURI(C.MOCK_TEMPLATE_TOKEN_ID)
      expect(tokenURI).to.equal(C.TEMPLATE_BASE_URI + C.MOCK_TEMPLATE_SOURCE)
    })

    it('Should return empty tokenURI for inexisting tokens', async function () {
      const { template } = await loadFixture(setup)

      const tokenURI = await template.tokenURI(99n)
      expect(tokenURI).to.be.empty
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
      const templateData = await template.templates(templateId)
      const permissions = templateData.permissions
      const finalSource = templateData.source

      // Set the template contract in SACD
      await sacd.setTemplateContract(await template.getAddress())

      // Call SACD with template ID
      await sacd
        .connect(user1)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](asset, tokenId, grantee, permissions, expiration, templateId, finalSource)

      // Verify permissions work when template is active
      expect(await sacd.hasPermissions(asset, tokenId, grantee, permissions)).to.be.true

      // Deactivate the template
      await template.deactivateTemplate(templateId)

      // Verify permissions are revoked when template is deactivated
      expect(await sacd.hasPermissions(asset, tokenId, grantee, permissions)).to.be.false
    })
  })
})

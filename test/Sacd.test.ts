import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre, { ignition } from 'hardhat'

import * as C from './constants'
import SacdModule from '../ignition/modules/Sacd'
import TemplateModule from '../ignition/modules/Template'
import type { Sacd, Template } from '../typechain-types'

describe('Sacd', function () {
  async function setup() {
    const [owner, grantor, grantee, otherAccount] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')
    const mockErc20Factory = await hre.ethers.getContractFactory('MockERC20')

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

    const sacd = (
      await ignition.deploy(SacdModule, {
        parameters: {
          ProxyModule: {
            templateContractAddress: await template.getAddress(),
          },
        },
      })
    ).sacd as unknown as Sacd
    const mockErc721 = await mockErc721Factory.deploy(await sacd.getAddress())
    const mockErc20 = await mockErc20Factory.deploy()

    // Create a template with specific permissions
    await template.createTemplate(
      owner,
      await mockErc721.getAddress(),
      C.MOCK_TEMPLATE_PERMISSIONS,
      C.MOCK_TEMPLATE_SOURCE
    )

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, otherAccount, mockErc721, mockErc20, template, sacd, DEFAULT_EXPIRATION }
  }

  describe('initialize', () => {
    it('Should correctly initialize', async () => {
      const { sacd, owner, template } = await loadFixture(setup)

      expect(await sacd.hasRole(C.DEFAULT_ADMIN_ROLE, owner)).to.be.true
      expect(await sacd.hasRole(C.ADMIN_ROLE, owner)).to.be.true

      expect(await sacd.templateContract()).to.equal(await template.getAddress())
    })
  })

  describe('setTemplateContract', () => {
    it('Should revert if caller does not have admin role', async () => {
      const { sacd, otherAccount, template } = await loadFixture(setup)

      await expect(sacd.connect(otherAccount).setTemplateContract(await template.getAddress()))
        .to.be.revertedWithCustomError(template, 'AccessControlUnauthorizedAccount')
        .withArgs(otherAccount.address, C.ADMIN_ROLE)
    })
  })

  describe('setPermissions', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner or asset contract', async () => {
        const { mockErc721, sacd, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantee)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if asset address is not an ERC721', async () => {
        const { sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](otherAccount.address, 2n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
        ).to.be.reverted
      })
      it('Should revert if grantee is address(0)', async () => {
        const { mockErc721, sacd, grantor, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 1n, hre.ethers.ZeroAddress, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
        ).to.be.revertedWithCustomError(sacd, 'ZeroAddress')
      })
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 2n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 2)
      })
      it('Should revert if templateId != 0 and template contract address is not set', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await sacd.setTemplateContract(hre.ethers.ZeroAddress)

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)
        ).to.be.revertedWithCustomError(sacd, 'TemplateContractNotSet')
      })
      it('Should revert if template asset do not match', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        const newMockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')
        const newMockErc721 = await newMockErc721Factory.deploy(await sacd.getAddress())
        await newMockErc721.mint(grantor.address)

        // Try to set permissions with different permissions than template
        const differentPermissions = 0x87654321n
        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await newMockErc721.getAddress(), 1n, grantee.address, differentPermissions, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'TemplateAssetMismatch')
          .withArgs(C.MOCK_TEMPLATE_TOKEN_ID, await mockErc721.getAddress(), await newMockErc721.getAddress())
      })
      it('Should revert if template permissions do not match', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const MOCK_ERC_721_ADDRESS = await mockErc721.getAddress()

        // Try to set permissions with different permissions than template
        const differentPermissions = 0x87654321n
        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](MOCK_ERC_721_ADDRESS, 1n, grantee.address, differentPermissions, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'TemplatePermissionsMismatch')
          .withArgs(C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_TEMPLATE_PERMISSIONS, differentPermissions)
      })
      it('Should revert if template is not active', async () => {
        const { mockErc721, sacd, template, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const MOCK_ERC_721_ADDRESS = await mockErc721.getAddress()

        await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](MOCK_ERC_721_ADDRESS, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'TemplateNotActive')
          .withArgs(C.MOCK_TEMPLATE_TOKEN_ID)
      })
      it('Should revert if template does not exist', async () => {
        const { mockErc721, sacd, template, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const MOCK_ERC_721_ADDRESS = await mockErc721.getAddress()

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](MOCK_ERC_721_ADDRESS, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, 99n, C.MOCK_SACD_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'TemplateNotActive')
          .withArgs(99n)
      })
    })

    context('State', () => {
      context('Caller is the token owner', () => {
        it('Should correctly set new permissions with no template', async () => {
          const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc721Address = await mockErc721.getAddress()

          await sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

          const permissionRecord = await sacd.permissionRecords(mockErc721Address, 1n, 1n, grantee.address)

          expect(permissionRecord.permissions).to.equal(C.MOCK_PERMISSIONS)
          expect(permissionRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(permissionRecord.templateId).to.equal(0n)
          expect(permissionRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
        it('Should correclty set new permissions with matching template permissions', async () => {
          const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc721Address = await mockErc721.getAddress()

          // Set permissions with matching template permissions
          await sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

          const permissionRecord = await sacd.permissionRecords(mockErc721Address, 1n, 1n, grantee.address)

          expect(permissionRecord.permissions).to.equal(C.MOCK_TEMPLATE_PERMISSIONS)
          expect(permissionRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(permissionRecord.templateId).to.equal(C.MOCK_TEMPLATE_TOKEN_ID)
          expect(permissionRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
      })

      context('Caller is the asset contract', () => {
        it('Should correctly set new permissions with no template', async () => {
          const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc721Address = await mockErc721.getAddress()
          await mockErc721.connect(grantor).mintWithSacd(grantor.address, {
            grantee: grantee.address,
            permissions: C.MOCK_PERMISSIONS,
            expiration: DEFAULT_EXPIRATION,
            templateId: 0n,
            source: C.MOCK_SACD_SOURCE,
          })

          const permissionRecord = await sacd.permissionRecords(mockErc721Address, 2n, 1n, grantee.address)

          expect(permissionRecord.permissions).to.equal(C.MOCK_PERMISSIONS)
          expect(permissionRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(permissionRecord.templateId).to.equal(0n)
          expect(permissionRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
        it('Should correclty set new permissions with matching template permissions', async () => {
          const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc721Address = await mockErc721.getAddress()
          await mockErc721.connect(grantor).mintWithSacd(grantor.address, {
            grantee: grantee.address,
            permissions: C.MOCK_TEMPLATE_PERMISSIONS,
            expiration: DEFAULT_EXPIRATION,
            templateId: C.MOCK_TEMPLATE_TOKEN_ID,
            source: C.MOCK_SACD_SOURCE,
          })

          const permissionRecord = await sacd.permissionRecords(mockErc721Address, 2n, 1n, grantee.address)

          expect(permissionRecord.permissions).to.equal(C.MOCK_TEMPLATE_PERMISSIONS)
          expect(permissionRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(permissionRecord.templateId).to.equal(C.MOCK_TEMPLATE_TOKEN_ID)
          expect(permissionRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
      })
    })

    context('Events', () => {
      it('Should emit PermissionsSet with correct params', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await expect(
          sacd
            .connect(grantor)
            [
              'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
            ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
        )
          .to.emit(sacd, 'PermissionsSet')
          .withArgs(
            mockErc721Address,
            1n,
            C.MOCK_PERMISSIONS,
            grantee.address,
            DEFAULT_EXPIRATION,
            0n,
            C.MOCK_SACD_SOURCE
          )
      })
    })

    context('on transfer', () => {
      it('Should invalidate old permissions when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.false
      })
      it('Should correctly set new permissions by the new token ID owner', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        await sacd
          .connect(otherAccount)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
      })
    })
  })

  describe('setPayment', () => {
    context('Error handling', () => {
      it('Should revert if grantor is address(0)', async () => {
        const { mockErc20, sacd, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantee)
            .setPayment(
              await mockErc20.getAddress(),
              hre.ethers.ZeroAddress,
              123n,
              DEFAULT_EXPIRATION,
              '0x000000',
              C.MOCK_SACD_SOURCE
            )
        ).to.be.revertedWithCustomError(sacd, 'ZeroAddress')
      })
      it('Should revert if asset is address(0) and currency is empty', async () => {
        const { sacd, grantee, grantor, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantee)
            .setPayment(
              hre.ethers.ZeroAddress,
              grantor.address,
              123n,
              DEFAULT_EXPIRATION,
              '0x000000',
              C.MOCK_SACD_SOURCE
            )
        ).to.be.revertedWithCustomError(sacd, 'InvalidCurrency')
      })
      it('Should revert if asset is not address(0) and currency is not empty', async () => {
        const { mockErc20, sacd, grantee, grantor, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantee)
            .setPayment(
              await mockErc20.getAddress(),
              grantor.address,
              123n,
              DEFAULT_EXPIRATION,
              C.MOCK_PAYMENT_CURRENCY,
              C.MOCK_SACD_SOURCE
            )
        ).to.be.revertedWithCustomError(sacd, 'InvalidCurrency')
      })
    })

    context('ERC20 asset', () => {
      context('State', () => {
        it('Should correctly set payment infos', async () => {
          const { mockErc20, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc20Address = await mockErc20.getAddress()

          await sacd
            .connect(grantee)
            .setPayment(
              mockErc20Address,
              grantor.address,
              C.MOCK_PAYMENT_AMOUNT,
              DEFAULT_EXPIRATION,
              '0x000000',
              C.MOCK_SACD_SOURCE
            )

          const paymentRecord = await sacd.currentPaymentRecord(mockErc20Address, grantee.address, grantor.address)

          expect(paymentRecord.amount).to.equal(C.MOCK_PAYMENT_AMOUNT)
          expect(paymentRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(paymentRecord.currency).to.equal('0x000000')
          expect(paymentRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
      })

      context('Events', () => {
        it('Should emit PaymentSet with correct params', async () => {
          const { mockErc20, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
          const mockErc20Address = await mockErc20.getAddress()

          await expect(
            sacd
              .connect(grantee)
              .setPayment(
                mockErc20Address,
                grantor.address,
                C.MOCK_PAYMENT_AMOUNT,
                DEFAULT_EXPIRATION,
                '0x000000',
                C.MOCK_SACD_SOURCE
              )
          )
            .to.emit(sacd, 'PaymentSet')
            .withArgs(
              mockErc20Address,
              grantee.address,
              grantor.address,
              C.MOCK_PAYMENT_AMOUNT,
              DEFAULT_EXPIRATION,
              C.MOCK_SACD_SOURCE
            )
        })
      })
    })

    context('Fiat asset', () => {
      context('State', () => {
        it('Should correctly set payment infos', async () => {
          const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

          await sacd
            .connect(grantee)
            .setPayment(
              hre.ethers.ZeroAddress,
              grantor.address,
              C.MOCK_PAYMENT_AMOUNT,
              DEFAULT_EXPIRATION,
              C.MOCK_PAYMENT_CURRENCY,
              C.MOCK_SACD_SOURCE
            )

          const paymentRecord = await sacd.currentPaymentRecord(
            hre.ethers.ZeroAddress,
            grantee.address,
            grantor.address
          )

          expect(paymentRecord.amount).to.equal(C.MOCK_PAYMENT_AMOUNT)
          expect(paymentRecord.expiration).to.equal(DEFAULT_EXPIRATION)
          expect(paymentRecord.currency).to.equal(C.MOCK_PAYMENT_CURRENCY)
          expect(paymentRecord.source).to.equal(C.MOCK_SACD_SOURCE)
        })
      })

      context('Events', () => {
        it('Should emit PaymentSet with correct params', async () => {
          const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

          await expect(
            sacd
              .connect(grantee)
              .setPayment(
                hre.ethers.ZeroAddress,
                grantor.address,
                C.MOCK_PAYMENT_AMOUNT,
                DEFAULT_EXPIRATION,
                C.MOCK_PAYMENT_CURRENCY,
                C.MOCK_SACD_SOURCE
              )
          )
            .to.emit(sacd, 'PaymentSet')
            .withArgs(
              hre.ethers.ZeroAddress,
              grantee.address,
              grantor.address,
              C.MOCK_PAYMENT_AMOUNT,
              DEFAULT_EXPIRATION,
              C.MOCK_SACD_SOURCE
            )
        })
      })
    })
  })

  describe('hasPermission', () => {
    it('Should return false if token Id does not exist', async () => {
      const { mockErc721, sacd, grantee } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      expect(await sacd.hasPermission(mockErc721Address, 99n, grantee.address, 0)).to.be.false
    })
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 2n, grantee.address, 0)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, otherAccount.address, 0)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)
      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return false if template is not active', async () => {
      const { mockErc721, sacd, grantor, grantee, template, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 2)).to.be.true

      await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 2)).to.be.false
    })
    it('Should return false if template ID is defined, but no template contract is set', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 2)).to.be.true

      await sacd.setTemplateContract(hre.ethers.ZeroAddress)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 2)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
    })
    it('Should return true if grantee is the token owner', async () => {
      const { mockErc721, sacd, grantor } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantor.address, 4)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.false
      })
      it('Should return false for the former token ID owner if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, otherAccount } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantor.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantor.address, 4)).to.be.false
      })
    })
  })

  describe('hasPermissions', () => {
    it('Should return false if token Id does not exist', async () => {
      const { mockErc721, sacd, grantee } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      expect(await sacd.hasPermissions(mockErc721Address, 99n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      // C.MOCK_PERMISSIONS 816 11 00 11 00 00
      // Test               819 11 00 11 00 11
      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, 819)).to.be.false
    })
    it('Should return false if template is not active', async () => {
      const { mockErc721, sacd, grantor, grantee, template, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.be.true

      await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.be.false
    })
    it('Should return false if template ID is defined, but no template contract is set', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.be.true

      await sacd.setTemplateContract(hre.ethers.ZeroAddress)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true
    })
    it('Should return true if grantee is the token owner', async () => {
      const { mockErc721, sacd, grantor } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantor.address, C.MOCK_PERMISSIONS)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
      })
      it('Should return false for the former token ID owner if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, otherAccount } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantor.address, C.MOCK_PERMISSIONS)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantor.address, C.MOCK_PERMISSIONS)).to.be.false
      })
    })
  })

  describe('getPermissions', () => {
    it('Should return 0 if token Id does not exist', async () => {
      const { mockErc721, sacd, grantee } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      expect(await sacd.getPermissions(mockErc721Address, 99n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if template is not active', async () => {
      const { mockErc721, sacd, template, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.equal(
        C.MOCK_TEMPLATE_PERMISSIONS
      )

      await template.deactivateTemplate(C.MOCK_TEMPLATE_TOKEN_ID)

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if template ID is defined, but no template contract is set', async () => {
      const { mockErc721, sacd, template, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_TEMPLATE_TOKEN_ID, C.MOCK_SACD_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.equal(
        C.MOCK_TEMPLATE_PERMISSIONS
      )

      await sacd.setTemplateContract(hre.ethers.ZeroAddress)

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_TEMPLATE_PERMISSIONS)).to.equal(0)
    })
    it('Should correctly return intersected permissions', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      // C.MOCK_PERMISSIONS 816 11 00 11 00 00
      // Test               771 11 00 00 00 11
      // Result             768 11 00 00 00 00
      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, 771)).to.equal(768)
    })
    it('Should return the input permissions if grantee is the token owner', async () => {
      const { mockErc721, sacd, grantor } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      // Test               771 11 00 00 00 11
      // Result             768 11 00 00 00 00
      expect(await sacd.getPermissions(mockErc721Address, 1n, grantor.address, 771)).to.equal(771)
    })

    context('on transfer', () => {
      it('Should return 0 if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          [
            'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

        expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(
          C.MOCK_PERMISSIONS
        )

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
      })
    })
  })

  describe('onTransfer', () => {
    it('Should increment token version when token ID is transferred', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        [
          'setPermissions(address,uint256,address,uint256,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, 0n, C.MOCK_SACD_SOURCE)

      const tokenVersionBefore = await sacd.tokenIdToVersion(mockErc721Address, 1n)

      expect(tokenVersionBefore).to.equal(1)

      await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

      const tokenVersionAfter = await sacd.tokenIdToVersion(mockErc721Address, 1n)

      expect(tokenVersionAfter).to.equal(2n)
    })
  })
})

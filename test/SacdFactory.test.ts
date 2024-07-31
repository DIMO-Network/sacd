import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { EventLog, Log } from 'ethers'

import * as C from './constants'

describe('SacdFactory', function () {
  async function setup() {
    const [owner, grantor, grantee, otherAccount] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721')
    const sacdTemplateFactory = await hre.ethers.getContractFactory('Sacd')
    const sacdFactoryFactory = await hre.ethers.getContractFactory('SacdFactory')

    const mockErc721 = await mockErc721Factory.deploy()
    const sacdTemplate = await sacdTemplateFactory.deploy()
    const sacdFactory = await sacdFactoryFactory.deploy(await sacdTemplate.getAddress())

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, otherAccount, mockErc721, sacdFactory, DEFAULT_EXPIRATION }
  }

  describe('set', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner', async () => {
        const { mockErc721, sacdFactory, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantee)
            .set(
              await mockErc721.getAddress(),
              1n,
              C.MOCK_PERMISSIONS,
              grantee.address,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        )
          .to.be.revertedWithCustomError(sacdFactory, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if asset address is not an ERC721', async () => {
        const { sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantor)
            .set(otherAccount.address, 2n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        ).to.be.reverted
      })
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantor)
            .set(
              await mockErc721.getAddress(),
              2n,
              C.MOCK_PERMISSIONS,
              grantee.address,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        )
          .to.be.revertedWithCustomError(sacdFactory, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 2)
      })
    })

    context('State', () => {
      it('Should create a new SACD with correct params if it does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await (
          await sacdFactory
            .connect(grantor)
            .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        ).wait()

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)

        expect(await sacd.asset()).to.equal(mockErc721Address)
        expect(await sacd.tokenId()).to.equal(1n)
      })
      it('Should set permissions for a SACD just created', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(permissionRecords.expiration).to.equal(DEFAULT_EXPIRATION)
        expect(permissionRecords.source).to.equal(C.MOCK_SOURCE)
      })
      it('Should set permissions for an existing SACD', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, hre.ethers.ZeroAddress, 0n, '')

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecordsBefore = await sacd.permissionRecords(grantee.address)

        expect(permissionRecordsBefore.permissions).to.equal(0n)
        expect(permissionRecordsBefore.expiration).to.equal(0n)
        expect(permissionRecordsBefore.source).to.be.empty

        await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionRecordsAfter = await sacd.permissionRecords(grantee.address)

        expect(permissionRecordsAfter.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(permissionRecordsAfter.expiration).to.equal(DEFAULT_EXPIRATION)
        expect(permissionRecordsAfter.source).to.equal(C.MOCK_SOURCE)
      })
    })

    context.only('Events', () => {
      it('Should emit SacdCreated with correct params if SACD does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        const tx = await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const eventLog = (await tx.wait())?.logs[1] as EventLog

        expect(hre.ethers.isAddress(eventLog.args.sacd)).to.be.true
        expect(eventLog.args.asset).to.equal(mockErc721Address)
        expect(eventLog.args.tokenId).to.equal(1n)
      })
      it.skip('Should emit PermissionsSet with correct params for a SACD just created', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        const tx = await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const eventLog = (await tx.wait())?.logs[1] as EventLog

        expect(hre.ethers.isAddress(eventLog.args.sacd)).to.be.true
        expect(eventLog.args.asset).to.equal(mockErc721Address)
        expect(eventLog.args.tokenId).to.equal(1n)
      })
      it.skip('Should not set permissions for a SACD just created if grantee is address(0)', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, hre.ethers.ZeroAddress, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(0n)
        expect(permissionRecords.expiration).to.equal(0n)
        expect(permissionRecords.source).to.be.empty
      })
    })
  })

  describe.skip('hasPermission', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 2n, grantee.address, 0)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, otherAccount.address, 0)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
      await time.increase(time.duration.years(5))

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
    })
  })

  describe.skip('hasPermissions', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.be
        .false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      // C.MOCK_PERMISSIONS 816 1 1 0 0 1 1 0 0 0 0
      // Test               819 1 1 0 0 1 1 0 0 1 1
      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, 819)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        .set(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true
    })
  })
})

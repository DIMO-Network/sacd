import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

import * as C from './constants'

describe('Sacd', function () {
  async function setup() {
    const [owner, grantor, grantee, otherAccount] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')
    const sacdFactory = await hre.ethers.getContractFactory('Sacd')

    const sacd = await sacdFactory.deploy(owner.address, [])
    const mockErc721 = await mockErc721Factory.deploy(await sacd.getAddress())

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, otherAccount, mockErc721, sacd, DEFAULT_EXPIRATION }
  }

  describe('setPermissions', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner', async () => {
        const { mockErc721, sacd, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantee)
            .setPermissions(
              await mockErc721.getAddress(),
              1n,
              grantee.address,
              C.MOCK_PERMISSIONS,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        )
          .to.be.revertedWithCustomError(sacd, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if asset address is not an ERC721', async () => {
        const { sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            .setPermissions(
              otherAccount.address,
              2n,
              grantee.address,
              C.MOCK_PERMISSIONS,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        ).to.be.reverted
      })
      it('Should revert if grantee is address(0)', async () => {
        const { mockErc721, sacd, grantor, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            .setPermissions(
              await mockErc721.getAddress(),
              1n,
              hre.ethers.ZeroAddress,
              C.MOCK_PERMISSIONS,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        ).to.be.revertedWithCustomError(sacd, 'ZeroAddress')
      })
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacd
            .connect(grantor)
            .setPermissions(
              await mockErc721.getAddress(),
              2n,
              grantee.address,
              C.MOCK_PERMISSIONS,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        )
          .to.be.revertedWithCustomError(sacd, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 2)
      })
    })

    context('State', () => {
      it('Should correctly set new permissions', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionRecord = await sacd.permissionRecords(mockErc721Address, 1n, 1n, grantee.address)

        expect(permissionRecord.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(permissionRecord.expiration).to.equal(DEFAULT_EXPIRATION)
        expect(permissionRecord.source).to.equal(C.MOCK_SOURCE)
      })
    })

    context('Events', () => {
      it('Should emit PermissionsSet with correct params', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await expect(
          sacd
            .connect(grantor)
            .setPermissions(
              mockErc721Address,
              1n,
              grantee.address,
              C.MOCK_PERMISSIONS,
              DEFAULT_EXPIRATION,
              C.MOCK_SOURCE
            )
        )
          .to.emit(sacd, 'PermissionsSet')
          .withArgs(mockErc721Address, 1n, C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
      })
    })

    context('on transfer', () => {
      it('Should invalidate old permissions when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.false
      })
      it('Should correctly set new permissions by the new token ID owner', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        await sacd
          .connect(otherAccount)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
      })
    })
  })

  describe('hasPermission', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 2n, grantee.address, 0)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, otherAccount.address, 0)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.false
      })
    })
  })

  describe('hasPermissions', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      // C.MOCK_PERMISSIONS 816 11 00 11 00 00
      // Test               819 11 00 11 00 11
      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, 819)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacd.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
      })
    })
  })

  describe('getPermissions', () => {
    it('Should return 0 if token Id does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if grantee does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.getPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should return 0 if permission is already expired', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.equal(0)
    })
    it('Should correctly return intersected permissions', async () => {
      const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacd
        .connect(grantor)
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      // C.MOCK_PERMISSIONS 816 11 00 11 00 00
      // Test               771 11 00 00 00 11
      // Result             768 11 00 00 00 00
      expect(await sacd.getPermissions(mockErc721Address, 1n, grantee.address, 771)).to.equal(768)
    })

    context('on transfer', () => {
      it('Should return 0 if when token ID is transferred', async () => {
        const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacd
          .connect(grantor)
          .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

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
        .setPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      const tokenVersionBefore = await sacd.tokenIdToVersion(mockErc721Address, 1n)

      expect(tokenVersionBefore).to.equal(1)

      await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

      const tokenVersionAfter = await sacd.tokenIdToVersion(mockErc721Address, 1n)

      expect(tokenVersionAfter).to.equal(2n)
    })
  })
})

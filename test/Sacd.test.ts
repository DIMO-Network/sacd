import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

import * as C from './constants'

describe('Sacd', function () {
  async function setup() {
    const [owner, grantor, grantee, otherAccount] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721')
    const sacdFactory = await hre.ethers.getContractFactory('Sacd')

    const mockErc721 = await mockErc721Factory.deploy()
    const sacd = await sacdFactory.deploy()

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, otherAccount, mockErc721, sacd, DEFAULT_EXPIRATION }
  }
  async function setupInitialized() {
    const vars = await setup()

    await vars.sacd.initialize(await vars.mockErc721.getAddress(), 1n, vars.grantor.address)

    return { ...vars }
  }

  describe('initialize', () => {
    context('Error handling', () => {
      it('Should revert if it is already initialized', async () => {
        const { grantor, mockErc721, sacd } = await loadFixture(setup)

        await sacd.initialize(await mockErc721.getAddress(), 1n, grantor.address)

        await expect(sacd.initialize(await mockErc721.getAddress(), 1n, grantor.address)).to.be.revertedWithCustomError(
          sacd,
          'AlreadyInitialized'
        )
      })
      it('Should revert if asset is address(0)', async () => {
        const { grantor, sacd } = await loadFixture(setup)

        await expect(sacd.initialize(hre.ethers.ZeroAddress, 1n, grantor.address)).to.be.revertedWithCustomError(
          sacd,
          'ZeroAddress'
        )
      })
      it('Should revert if token ID is 0', async () => {
        const { grantor, mockErc721, sacd } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await expect(sacd.initialize(mockErc721Address, 0n, grantor.address))
          .to.be.revertedWithCustomError(sacd, 'InvalidTokenId')
          .withArgs(mockErc721Address, 0n)
      })
      it('Should revert if current token owner is address(0)', async () => {
        const { mockErc721, sacd } = await loadFixture(setup)

        await expect(
          sacd.initialize(await mockErc721.getAddress(), 1n, hre.ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(sacd, 'ZeroAddress')
      })
    })
  })

  describe('setPermissions', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token ID owner', async () => {
        const { sacd, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

        await expect(
          sacd.connect(grantee).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if token ID does not exist', async () => {
        // This is a case where the token ID was burned
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

        await mockErc721.burn(1n)

        await expect(
          sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        )
          .to.be.revertedWithCustomError(sacd, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 1n)
      })
    })

    context('State', () => {
      it('Should correctly set permissions', async () => {
        const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

        await sacd
          .connect(grantor)
          .setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords['permissions']).to.equal(C.MOCK_PERMISSIONS)
        expect(permissionRecords['expiration']).to.equal(DEFAULT_EXPIRATION)
        expect(permissionRecords['source']).to.equal(C.MOCK_SOURCE)
      })
    })

    context('Events', () => {
      it('Should emit PermissionsSet with correct params', async () => {
        const { mockErc721, sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

        await expect(
          sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        )
          .to.emit(sacd, 'PermissionsSet')
          .withArgs(
            await mockErc721.getAddress(),
            1n,
            C.MOCK_PERMISSIONS,
            grantee.address,
            DEFAULT_EXPIRATION,
            C.MOCK_SOURCE
          )
      })
    })
  })

  describe('hasPermission', () => {
    it('Should return false if token ID owner and SACD current token ID owner does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } =
        await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.true

      await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.false
    })
    it('Should return false if token ID does not exist', async () => {
      const { mockErc721, sacd, grantee } = await loadFixture(setupInitialized)

      await mockErc721.burn(1n)

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.true

      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(grantee.address, 1)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermission(grantee.address, 4)).to.be.true
    })
  })

  describe('hasPermissions', () => {
    it('Should return false if token ID owner and SACD current token ID owner does not match', async () => {
      const { mockErc721, sacd, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } =
        await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.true

      await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if token ID does not exist', async () => {
      const { mockErc721, sacd, grantee } = await loadFixture(setupInitialized)

      await mockErc721.burn(1n)

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.true

      await time.increase(time.duration.years(5))

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      // C.MOCK_PERMISSIONS 816 1 1 0 0 1 1 0 0 0 0
      // Test               819 1 1 0 0 1 1 0 0 1 1
      expect(await sacd.hasPermissions(grantee.address, 819)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { sacd, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setupInitialized)

      await sacd.connect(grantor).setPermissions(C.MOCK_PERMISSIONS, grantee.address, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacd.hasPermissions(grantee.address, C.MOCK_PERMISSIONS)).to.be.true
    })
  })
})

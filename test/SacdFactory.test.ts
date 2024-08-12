import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { EventLog } from 'ethers'

import * as C from './constants'

describe('SacdFactory', function () {
  async function setup() {
    const [owner, grantor, grantee, otherAccount] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721withSacd')
    const sacdTemplateFactory = await hre.ethers.getContractFactory('Sacd')
    const sacdFactoryFactory = await hre.ethers.getContractFactory('SacdFactory')

    const sacdTemplate = await sacdTemplateFactory.deploy()
    const sacdFactory = await sacdFactoryFactory.deploy(await sacdTemplate.getAddress())
    const mockErc721 = await mockErc721Factory.deploy(await sacdFactory.getAddress())

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, otherAccount, mockErc721, sacdFactory, DEFAULT_EXPIRATION }
  }

  describe('createSacd(address,uint256)', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner', async () => {
        const { mockErc721, sacdFactory, grantee } = await loadFixture(setup)

        await expect(sacdFactory.connect(grantee)['createSacd(address,uint256)'](await mockErc721.getAddress(), 1n))
          .to.be.revertedWithCustomError(sacdFactory, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if asset address is not an ERC721', async () => {
        const { sacdFactory, grantor, otherAccount } = await loadFixture(setup)

        await expect(sacdFactory.connect(grantor)['createSacd(address,uint256)'](otherAccount.address, 1n)).to.be
          .reverted
      })
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacdFactory, grantor } = await loadFixture(setup)

        await expect(sacdFactory.connect(grantor)['createSacd(address,uint256)'](await mockErc721.getAddress(), 2n))
          .to.be.revertedWithCustomError(sacdFactory, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 2)
      })
    })

    context('State', () => {
      it('Should create a new SACD with correct params if it does not exist', async () => {
        const { mockErc721, sacdFactory, grantor } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01Address)).to.be.true
        expect(sacdToken01Address).to.not.equal(hre.ethers.ZeroAddress)

        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)

        expect(await sacd.asset()).to.equal(mockErc721Address)
        expect(await sacd.tokenId()).to.equal(1n)
      })
    })

    context('Events', () => {
      it('Should emit SacdCreated with correct params if SACD does not exist', async () => {
        const { mockErc721, sacdFactory, grantor } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        const tx = await sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)

        const eventLog = (await tx.wait())?.logs[0] as EventLog

        expect(hre.ethers.isAddress(eventLog.args.sacd)).to.be.true
        expect(eventLog.args.asset).to.equal(mockErc721Address)
        expect(eventLog.args.tokenId).to.equal(1n)
      })
      it('Should not emit SacdCreated if SACD already exists', async () => {
        const { mockErc721, sacdFactory, grantor } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)

        await expect(sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)).to.not.emit(
          sacdFactory,
          'SacdCreated'
        )
      })
    })

    context('on transfer', () => {
      it('Should create a new SACD when token ID is transferred', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, otherAccount } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)

        const sacdToken01AddressBefore = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01AddressBefore)).to.be.true
        expect(sacdToken01AddressBefore).to.not.equal(hre.ethers.ZeroAddress)

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        await sacdFactory.connect(otherAccount)['createSacd(address,uint256)'](mockErc721Address, 1n)

        const sacdToken01AddressAfter = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01AddressAfter)).to.be.true
        expect(sacdToken01AddressAfter).to.not.equal(hre.ethers.ZeroAddress)
        expect(sacdToken01AddressAfter).to.not.equal(sacdToken01AddressBefore)
      })
    })
  })

  describe('createSacd(address,uint256,address,uint256,uint256,string)', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner', async () => {
        const { mockErc721, sacdFactory, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantee)
            [
              'createSacd(address,uint256,address,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        )
          .to.be.revertedWithCustomError(sacdFactory, 'Unauthorized')
          .withArgs(grantee.address)
      })
      it('Should revert if asset address is not an ERC721', async () => {
        const { sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantor)
            [
              'createSacd(address,uint256,address,uint256,uint256,string)'
            ](otherAccount.address, 2n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        ).to.be.reverted
      })
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)

        await expect(
          sacdFactory
            .connect(grantor)
            [
              'createSacd(address,uint256,address,uint256,uint256,string)'
            ](await mockErc721.getAddress(), 2n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        )
          .to.be.revertedWithCustomError(sacdFactory, 'InvalidTokenId')
          .withArgs(await mockErc721.getAddress(), 2)
      })
    })

    context('State', () => {
      it('Should create a new SACD with correct params if it does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01Address)).to.be.true
        expect(sacdToken01Address).to.not.equal(hre.ethers.ZeroAddress)

        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)

        expect(await sacd.asset()).to.equal(mockErc721Address)
        expect(await sacd.tokenId()).to.equal(1n)
      })
      it('Should set permissions for a SACD just created', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(permissionRecords.expiration).to.equal(DEFAULT_EXPIRATION)
        expect(permissionRecords.source).to.equal(C.MOCK_SOURCE)
      })
      it('Should not set permissions for a SACD just created if grantee is address(0)', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, hre.ethers.ZeroAddress, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(0n)
        expect(permissionRecords.expiration).to.equal(0n)
        expect(permissionRecords.source).to.be.empty
      })
      it('Should not set permissions for a SACD just created if permissions is 0', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, 0n, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(0n)
        expect(permissionRecords.expiration).to.equal(0n)
        expect(permissionRecords.source).to.be.empty
      })
      it('Should not set permissions for a SACD just created if expiration is 0', async () => {
        const { mockErc721, sacdFactory, grantor, grantee } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, 0n, C.MOCK_SOURCE)

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(0n)
        expect(permissionRecords.expiration).to.equal(0n)
        expect(permissionRecords.source).to.be.empty
      })
      it('Should not set permissions for a SACD just created if source is empty', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, '')

        const sacdToken01Address = await sacdFactory.sacds(mockErc721Address, 1n)
        const sacd = await hre.ethers.getContractAt('Sacd', sacdToken01Address)
        const permissionRecords = await sacd.permissionRecords(grantee.address)

        expect(permissionRecords.permissions).to.equal(0n)
        expect(permissionRecords.expiration).to.equal(0n)
        expect(permissionRecords.source).to.be.empty
      })
    })

    context('Events', () => {
      it('Should emit SacdCreated with correct params if SACD does not exist', async () => {
        const { mockErc721, sacdFactory, grantor } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, hre.ethers.ZeroAddress, 0n, 0n, '')

        const eventLog = (await tx.wait())?.logs[0] as EventLog

        expect(hre.ethers.isAddress(eventLog.args.sacd)).to.be.true
        expect(eventLog.args.asset).to.equal(mockErc721Address)
        expect(eventLog.args.tokenId).to.equal(1n)
      })
      it('Should not emit SacdCreated if SACD already exists', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, hre.ethers.ZeroAddress, 0n, 0n, '')

        await expect(
          sacdFactory
            .connect(grantor)
            [
              'createSacd(address,uint256,address,uint256,uint256,string)'
            ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
        ).to.not.emit(sacdFactory, 'SacdCreated')
      })
      it('Should emit PermissionsSet with correct params for a SACD just created', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()
        const sacd = await hre.ethers.getContractFactory('Sacd')

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionsEvent = (await tx.wait())?.logs
          .map((log) => sacd.interface.parseLog(log))
          .filter((log: any) => log && log.name === 'PermissionsSet')[0]

        expect(permissionsEvent?.args[0]).to.equal(mockErc721Address) // asset
        expect(permissionsEvent?.args[1]).to.equal(1n) // tokenId
        expect(permissionsEvent?.args[2]).to.equal(C.MOCK_PERMISSIONS) // permissions
        expect(permissionsEvent?.args[3]).to.equal(grantee.address) // grantee
        expect(permissionsEvent?.args[4]).to.equal(DEFAULT_EXPIRATION) // expiration
        expect(permissionsEvent?.args[5]).to.equal(C.MOCK_SOURCE) // source
      })
      it('Should not emit PermissionsSet for a SACD just created if grantee is address(0)', async () => {
        const { mockErc721, sacdFactory, grantor, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()
        const sacd = await hre.ethers.getContractFactory('Sacd')

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, hre.ethers.ZeroAddress, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionsEvent = (await tx.wait())?.logs
          .map((log) => sacd.interface.parseLog(log))
          .filter((log: any) => log && log.name === 'PermissionsSet')

        expect(permissionsEvent).to.be.empty
      })
      it('Should not emit PermissionsSet for a SACD just created if permissions is 0', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()
        const sacd = await hre.ethers.getContractFactory('Sacd')

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, 0n, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const permissionsEvent = (await tx.wait())?.logs
          .map((log) => sacd.interface.parseLog(log))
          .filter((log: any) => log && log.name === 'PermissionsSet')

        expect(permissionsEvent).to.be.empty
      })
      it('Should not emit PermissionsSet for a SACD just created if expiration is 0', async () => {
        const { mockErc721, sacdFactory, grantor, grantee } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()
        const sacd = await hre.ethers.getContractFactory('Sacd')

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, 0n, C.MOCK_SOURCE)

        const permissionsEvent = (await tx.wait())?.logs
          .map((log) => sacd.interface.parseLog(log))
          .filter((log: any) => log && log.name === 'PermissionsSet')

        expect(permissionsEvent).to.be.empty
      })
      it('Should not emit PermissionsSet for a SACD just created if source is empty', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()
        const sacd = await hre.ethers.getContractFactory('Sacd')

        const tx = await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, '')

        const permissionsEvent = (await tx.wait())?.logs
          .map((log) => sacd.interface.parseLog(log))
          .filter((log: any) => log && log.name === 'PermissionsSet')

        expect(permissionsEvent).to.be.empty
      })
    })

    context('on transfer', () => {
      it('Should create a new SACD when token ID is transferred', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01AddressBefore = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01AddressBefore)).to.be.true
        expect(sacdToken01AddressBefore).to.not.equal(hre.ethers.ZeroAddress)

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        await sacdFactory
          .connect(otherAccount)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        const sacdToken01AddressAfter = await sacdFactory.sacds(mockErc721Address, 1n)

        expect(hre.ethers.isAddress(sacdToken01AddressAfter)).to.be.true
        expect(sacdToken01AddressAfter).to.not.equal(hre.ethers.ZeroAddress)
        expect(sacdToken01AddressAfter).to.not.equal(sacdToken01AddressBefore)
      })
    })
  })

  describe('hasPermission', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 2n, grantee.address, 0)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, otherAccount.address, 0)).to.be.false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)
      await time.increase(time.duration.years(5))

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 0)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacdFactory.hasPermission(mockErc721Address, 1n, grantee.address, 4)).to.be.false
      })
    })
  })

  describe('hasPermissions', () => {
    it('Should return false if token Id does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 2n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if grantee does not match', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, otherAccount.address, C.MOCK_PERMISSIONS)).to.be
        .false
    })
    it('Should return false if permission is already expired', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      await time.increase(time.duration.years(5))

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
    })
    it('Should return false if it does not have permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      // C.MOCK_PERMISSIONS 816 11 00 11 00 00
      // Test               819 11 00 11 00 11
      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, 819)).to.be.false
    })
    it('Should return true if it has permission', async () => {
      const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory
        .connect(grantor)
        [
          'createSacd(address,uint256,address,uint256,uint256,string)'
        ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

      expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true
    })

    context('on transfer', () => {
      it('Should return false if when token ID is transferred', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, otherAccount, DEFAULT_EXPIRATION } = await loadFixture(setup)
        const mockErc721Address = await mockErc721.getAddress()

        await sacdFactory
          .connect(grantor)
          [
            'createSacd(address,uint256,address,uint256,uint256,string)'
          ](mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS, DEFAULT_EXPIRATION, C.MOCK_SOURCE)

        expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.true

        await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

        expect(await sacdFactory.hasPermissions(mockErc721Address, 1n, grantee.address, C.MOCK_PERMISSIONS)).to.be.false
      })
    })
  })

  describe('onTransfer', () => {
    it('Should set SACD to address(0) when token ID is transferred', async () => {
      const { mockErc721, sacdFactory, grantor, otherAccount } = await loadFixture(setup)
      const mockErc721Address = await mockErc721.getAddress()

      await sacdFactory.connect(grantor)['createSacd(address,uint256)'](mockErc721Address, 1n)

      const sacdAddressBefore = await sacdFactory.sacds(mockErc721Address, 1n)

      expect(sacdAddressBefore).to.not.equal(hre.ethers.ZeroAddress)

      await mockErc721.connect(grantor).transferFrom(grantor.address, otherAccount.address, 1n)

      const sacdAddressAfter = await sacdFactory.sacds(mockErc721Address, 1n)

      expect(sacdAddressAfter).to.equal(hre.ethers.ZeroAddress)
    })
  })
})

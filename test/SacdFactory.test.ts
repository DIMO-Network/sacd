import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { getAddress, parseGwei, isAddress } from 'viem'

import * as C from './constants'

describe.only('SacdFactory', function () {
  async function deployMockERC721() {
    const [, user1] = await hre.viem.getWalletClients()
    const mockErc721 = await hre.viem.deployContract('MockERC721')
    await mockErc721.write.mint([user1.account.address])

    return { mockErc721 }
  }

  async function deploySacdFactory() {
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))
    const [owner, user1] = await hre.viem.getWalletClients()

    const sacdTemplate = await hre.viem.deployContract('Sacd')
    const sacdFactory = await hre.viem.deployContract('SacdFactory', [sacdTemplate.address])

    return { sacdTemplate, sacdFactory, owner, user1, DEFAULT_EXPIRATION }
  }

  describe('constructor', () => {
    it('Should correctly set the SACD template', async () => {
      const { sacdTemplate, sacdFactory } = await loadFixture(deploySacdFactory)

      expect(await sacdFactory.read.sacdTemplate()).to.equal(getAddress(sacdTemplate.address))
    })
  })

  describe('createSacd', () => {
    context('State', () => {
      it('Should create a new SACD with correct params', async () => {
        const { mockErc721 } = await loadFixture(deployMockERC721)
        const { sacdFactory, user1, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        await sacdFactory.write.createSacd(
          [mockErc721.address, 1n, C.MOCK_PERMISSIONS, user1.account.address, DEFAULT_EXPIRATION, ''],
          {
            account: user1.account,
          }
        )
        const sacdCreatedEvents = await sacdFactory.getEvents.SacdCreated()

        const sacdCreated = await hre.viem.getContractAt('Sacd', sacdCreatedEvents[0].args.sacdAddress as `0x${string}`)

        expect(await sacdCreated.read.initialized()).to.be.true
        expect(await sacdCreated.read.nftAddr()).to.equal(getAddress(mockErc721.address))
        expect(await sacdCreated.read.tokenId()).to.equal(1n)
        expect(await sacdCreated.read.permissions()).to.equal(C.MOCK_PERMISSIONS)
        expect(await sacdCreated.read.grantee()).to.equal(getAddress(user1.account.address))
        expect(await sacdCreated.read.expiration()).to.equal(DEFAULT_EXPIRATION)
        expect(await sacdCreated.read.source()).to.equal('')
      })
    })

    context('Events', () => {
      it('Should emit SacdCreated with correct params', async () => {
        const { mockErc721 } = await loadFixture(deployMockERC721)
        const { sacdFactory, user1, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        await sacdFactory.write.createSacd(
          [mockErc721.address, 1n, C.MOCK_PERMISSIONS, user1.account.address, DEFAULT_EXPIRATION, ''],
          {
            account: user1.account,
          }
        )

        const sacdCreatedEvents = await sacdFactory.getEvents.SacdCreated()
        expect(sacdCreatedEvents).to.have.lengthOf(1)
        expect(sacdCreatedEvents[0].args.nftAddress).to.equal(getAddress(mockErc721.address))
        expect(sacdCreatedEvents[0].args.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(isAddress(sacdCreatedEvents[0].args.sacdAddress as string)).to.be.true
        expect(sacdCreatedEvents[0].args.tokenId).to.equal(1n)
      })
    })
  })
})

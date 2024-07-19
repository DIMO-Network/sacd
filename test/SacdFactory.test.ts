import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { EventLog } from 'ethers'

import * as C from './constants'

describe('SacdFactory', function () {
  async function deploySacdFactory() {
    const [owner, grantor, grantee] = await hre.ethers.getSigners()
    const DEFAULT_EXPIRATION = BigInt((await time.latest()) + time.duration.years(1))

    const mockErc721Factory = await hre.ethers.getContractFactory('MockERC721')
    const sacdTemplateFactory = await hre.ethers.getContractFactory('Sacd')
    const sacdFactoryFactory = await hre.ethers.getContractFactory('SacdFactory')

    const mockErc721 = await mockErc721Factory.deploy()
    const sacdTemplate = await sacdTemplateFactory.deploy()
    const sacdFactory = await sacdFactoryFactory.deploy(await sacdTemplate.getAddress())

    await mockErc721.mint(grantor.address)

    return { owner, grantor, grantee, mockErc721, sacdTemplate, sacdFactory, DEFAULT_EXPIRATION }
  }

  describe('constructor', () => {
    it('Should correctly set the SACD template', async () => {
      const { sacdTemplate, sacdFactory } = await loadFixture(deploySacdFactory)

      expect(await sacdFactory.sacdTemplate()).to.equal(await sacdTemplate.getAddress())
    })
  })

  describe('createSacd', () => {
    context('Error handling', () => {
      it('Should revert if caller is not the token Id owner', async () => {
        const { mockErc721, sacdFactory, grantee, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        await expect(
          sacdFactory
            .connect(grantee)
            .createSacd(
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
      it('Should revert if tokend ID does not exist', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        await expect(
          sacdFactory
            .connect(grantor)
            .createSacd(
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
      it('Should create a new SACD with correct params', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        const tx = await sacdFactory
          .connect(grantor)
          .createSacd(
            await mockErc721.getAddress(),
            1n,
            C.MOCK_PERMISSIONS,
            grantee.address,
            DEFAULT_EXPIRATION,
            C.MOCK_SOURCE
          )
        const sacdAddress = ((await tx.wait())?.logs[0] as EventLog).args.sacdAddress as string
        const sacdCreated = await hre.ethers.getContractAt('Sacd', sacdAddress)

        expect(await sacdCreated.initialized()).to.be.true
        expect(await sacdCreated.nftAddr()).to.equal(await mockErc721.getAddress())
        expect(await sacdCreated.tokenId()).to.equal(1n)
        expect(await sacdCreated.permissions()).to.equal(C.MOCK_PERMISSIONS)
        expect(await sacdCreated.grantee()).to.equal(grantee.address)
        expect(await sacdCreated.expiration()).to.equal(DEFAULT_EXPIRATION)
        expect(await sacdCreated.source()).to.equal(C.MOCK_SOURCE)
      })
    })

    context('Events', () => {
      it('Should emit SacdCreated with correct params', async () => {
        const { mockErc721, sacdFactory, grantor, grantee, DEFAULT_EXPIRATION } = await loadFixture(deploySacdFactory)

        const tx = await sacdFactory
          .connect(grantor)
          .createSacd(
            await mockErc721.getAddress(),
            1n,
            C.MOCK_PERMISSIONS,
            grantee.address,
            DEFAULT_EXPIRATION,
            C.MOCK_SOURCE
          )

        const eventLog = (await tx.wait())?.logs[0] as EventLog

        expect(eventLog.args.nftAddress).to.equal(await mockErc721.getAddress())
        expect(eventLog.args.tokenId).to.equal(1n)
        expect(eventLog.args.permissions).to.equal(C.MOCK_PERMISSIONS)
        expect(hre.ethers.isAddress(eventLog.args.sacdAddress)).to.be.true
      })
    })
  })
})

import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { getAddress, parseGwei, isAddress } from 'viem'

describe.only('SacdFactory', function () {
  async function deployMockERC721() {
    const mockErc721 = await hre.viem.deployContract('MockERC721')
    return { mockErc721 }
  }

  async function deploy() {
    const [owner, user1] = await hre.viem.getWalletClients()

    const sacdTemplate = await hre.viem.deployContract('Sacd')
    const sacdFactory = await hre.viem.deployContract('SacdFactory', [sacdTemplate.address])

    return { sacdTemplate, sacdFactory, owner, user1 }
  }

  describe('constructor', () => {
    it('Should correctly set the SACD template', async () => {
      const { sacdTemplate, sacdFactory } = await loadFixture(deploy)

      expect(await sacdFactory.read.sacdTemplate()).to.equal(getAddress(sacdTemplate.address))
    })
  })

  describe('createSacd', () => {
    it('Test', async () => {
      const { mockErc721 } = await loadFixture(deployMockERC721)
      const { sacdFactory, owner, user1 } = await loadFixture(deploy)

      await sacdFactory.write.createSacd([mockErc721.address, 1n, 123n, owner.account.address, 1234n, ''], {
        account: user1.account,
      })

      const sacdCreatedEvents = await sacdFactory.getEvents.SacdCreated()
      expect(sacdCreatedEvents).to.have.lengthOf(1)
      expect(sacdCreatedEvents[0].args.nftAddress).to.equal(getAddress(mockErc721.address))
      expect(sacdCreatedEvents[0].args.permissions).to.equal(123n)
      expect(isAddress(sacdCreatedEvents[0].args.sacdAddress as string)).to.be.true
      expect(sacdCreatedEvents[0].args.tokenId).to.equal(1n)
    })
  })
})

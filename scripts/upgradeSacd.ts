import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

import { getAddresses, writeAddresses } from '../utils/helpers'

async function getGasPrice(bump: bigint = 20n): Promise<bigint> {
  if (bump < 1n) {
    throw new Error('gas price bump must be >= 1')
  }

  const price = (await ethers.provider.getFeeData()).gasPrice as bigint
  return (price * bump) / 100n + price
}

async function upgradeSacd(signer: HardhatEthersSigner, networkName: string) {
  const gasPrice = await getGasPrice(20n)
  const instances = getAddresses()

  const sacdProxy = instances[networkName].Sacd.proxy

  console.log(`\n----- Upgrading Sacd contract ${sacdProxy} -----\n`)

  const factory = await ethers.getContractFactory('Sacd', signer)

  const impl = await factory.deploy({ gasPrice: gasPrice })
  await impl.waitForDeployment()
  const addressImpl = await impl.getAddress()

  console.log(`Sacd contract implementation deployed to ${addressImpl}`)

  const proxy = await ethers.getContractAt('Sacd', sacdProxy, signer)
  await proxy.upgradeToAndCall(addressImpl, '0x')

  console.log(`Sacd contract was upgraded to ${addressImpl}`)

  instances[networkName].Sacd.implementation = addressImpl
  writeAddresses(instances, networkName)
}

async function main() {
  let [deployer, user1] = await ethers.getSigners()
  let { name } = await ethers.provider.getNetwork()

  if (name === 'localhost') {
    name = 'amoy'
    // 0xCED3c922200559128930180d3f0bfFd4d9f4F123 Prod account
    // 0xC008EF40B0b42AAD7e34879EB024385024f753ea Shared dev account
    // 0xD64b27cA7F7d4447dFa8cb8701497Fb6eE774F6a Deployer create3
    deployer = await ethers.getImpersonatedSigner('0xC008EF40B0b42AAD7e34879EB024385024f753ea')

    await user1.sendTransaction({
      to: deployer.address,
      value: ethers.parseEther('10'),
    })
  }

  await upgradeSacd(deployer, name)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

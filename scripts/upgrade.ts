import * as fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

type AddressesByNetwork = {
  [index: string]: string
}

function getAddresses() {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data', 'addresses.json'), 'utf8'))
}

function writeAddresses(addresses: AddressesByNetwork, networkName: string) {
  console.log('\n----- Writing addresses to file -----')

  const currentAddresses: AddressesByNetwork = addresses
  currentAddresses[networkName] = addresses[networkName]

  fs.writeFileSync(path.resolve(__dirname, 'data', 'addresses.json'), JSON.stringify(currentAddresses, null, 4))

  console.log('----- Addresses written to file -----\n')
}

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
    name = 'polygon'
    // 0xCED3c922200559128930180d3f0bfFd4d9f4F123 Prod account
    // 0xC008EF40B0b42AAD7e34879EB024385024f753ea Shared dev account
    deployer = await ethers.getImpersonatedSigner('0xCED3c922200559128930180d3f0bfFd4d9f4F123')

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

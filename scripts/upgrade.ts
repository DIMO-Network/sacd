import { ethers } from 'hardhat'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

async function getGasPrice(bump: bigint = 20n): Promise<bigint> {
  if (bump < 1n) {
    throw new Error('gas price bump must be >= 1')
  }

  const price = (await ethers.provider.getFeeData()).gasPrice as bigint
  return (price * bump) / 100n + price
}

async function upgradeSacd(signer: HardhatEthersSigner) {
  const gasPrice = await getGasPrice(20n)

  const addressProxy = '0x3c152B5d96769661008Ff404224d6530FCAC766d'

  console.log('\n----- Upgrading Sacd contract -----\n')

  const factory = await ethers.getContractFactory('Sacd', signer)

  const impl = await factory.deploy({ gasPrice: gasPrice })
  await impl.waitForDeployment()
  const addressImpl = await impl.getAddress()

  console.log(`Sacd contract implementation deployed to ${addressImpl}`)

  const proxy = await ethers.getContractAt('Sacd', addressProxy)
  await proxy.upgradeToAndCall(addressImpl, '0x')

  console.log(`Sacd contract was upgraded to ${addressImpl}`)
}

async function main() {
  let [deployer, user1] = await ethers.getSigners()
  let { name } = await ethers.provider.getNetwork()

  if (name === 'localhost') {
    name = 'amoy'
    // 0x62b98e019e0d3e4A1Ad8C786202e09017Bd995e1 Prod account
    // 0xC008EF40B0b42AAD7e34879EB024385024f753ea Shared dev account
    deployer = await ethers.getImpersonatedSigner('0xC008EF40B0b42AAD7e34879EB024385024f753ea')

    await user1.sendTransaction({
      to: deployer.address,
      value: ethers.parseEther('10'),
    })
  }

  await upgradeSacd(deployer)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

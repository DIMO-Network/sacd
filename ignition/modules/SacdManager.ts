import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SacdManagerModule = buildModule('SacdManagerModule', (m) => {
  const sacd = m.contract('ERC721Access')
  const sacdFactory = m.contract('SacdManager', [sacd])

  return { sacdFactory }
})

export default SacdManagerModule

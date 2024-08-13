import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SacdFactoryModule = buildModule('SacdFactoryModule', (m) => {
  const sacd = m.contract('Sacd')
  const sacdFactory = m.contract('SacdFactory', [sacd])

  return { sacdFactory }
})

export default SacdFactoryModule

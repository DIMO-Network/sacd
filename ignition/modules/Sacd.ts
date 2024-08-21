import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SacdModule = buildModule('SacdModule', (m) => {
  const sacdFactory = m.contract('Sacd')

  return { sacdFactory }
})

export default SacdModule

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const ProxyModule = buildModule('ProxyModule', (m) => {
  // Deploy the implementation contract
  const implementation = m.contract('Sacd')
  const templateContractAddress = m.getParameter(
    'templateContractAddress',
    '0x0000000000000000000000000000000000000000'
  )

  // Encode the initialize function call for the contract.
  const initialize = m.encodeFunctionCall(implementation, 'initialize', [templateContractAddress])

  // Deploy the ERC1967 Proxy, pointing to the implementation
  const proxy = m.contract('ERC1967Proxy', [implementation, initialize])

  return { proxy }
})

const SacdModule = buildModule('SacdModule', (m) => {
  // Get the proxy from the previous module.
  const { proxy } = m.useModule(ProxyModule)

  // Create a contract instance using the deployed proxy's address.
  const sacd = m.contractAt('Sacd', proxy)

  return { sacd, proxy }
})

export default SacdModule

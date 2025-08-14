import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const TEMPLATE_BASE_URI = 'https://assets.dimo.xyz/'

const TemplateProxyModule = buildModule('TemplateProxyModule', (m) => {
  // Deploy the implementation contract
  const implementation = m.contract('Template')

  // Encode the initialize function call for the contract
  const initialize = m.encodeFunctionCall(implementation, 'initialize', [TEMPLATE_BASE_URI])

  // Deploy the ERC1967 Proxy, pointing to the implementation
  const proxy = m.contract('ERC1967Proxy', [implementation, initialize])

  return { proxy }
})

const TemplateModule = buildModule('TemplateModule', (m) => {
  // Get the proxy from the previous module.
  const { proxy } = m.useModule(TemplateProxyModule)

  // Create a contract instance using the deployed proxy's address.
  const template = m.contractAt('Template', proxy)

  return { template, proxy }
})

export default TemplateModule

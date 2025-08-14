import { ethers } from 'ethers'

export const TEMPLATE_BASE_URI = 'https://assets.dimo.xyz/'
export const MOCK_TEMPLATE_PERMISSIONS = 3888n // 11 11 00 11 00 00
export const MOCK_PERMISSIONS = 816n // 11 00 11 00 00
export const MOCK_TEMPLATE_CID = 'QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE' // TODO Update when we have a actual example
export const MOCK_TEMPLATE_SOURCE = 'ipfs://' + MOCK_TEMPLATE_CID
export const MOCK_SACD_SOURCE = 'ipfs://QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE'
export const MOCK_PAYMENT_AMOUNT = 10000000000000000000n
export const MOCK_PAYMENT_CURRENCY = ethers.encodeBytes32String('ZZZ').slice(0, 8) // bytes3

import { ethers } from 'ethers'

import { stringToUint256WithHash } from '../utils/helpers'

export const TEMPLATE_BASE_URI = 'https://assets.dimo.xyz/ipfs/'
export const MOCK_TEMPLATE_PERMISSIONS = 3888n // 11 11 00 11 00 00
export const MOCK_TEMPLATE_SOURCE_WITH_ASSET = 'QmYoWDRp6yXc53rZBaWrz56XEaDm7heoDNx6s5ttESiXHX'
export const MOCK_TEMPLATE_SOURCE_WITHOUT_ASSET = 'QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE'
export const MOCK_TEMPLATE_TOKEN_ID_WITH_ASSET = stringToUint256WithHash(MOCK_TEMPLATE_SOURCE_WITH_ASSET)
export const MOCK_TEMPLATE_TOKEN_ID_WITHOUT_ASSET = stringToUint256WithHash(MOCK_TEMPLATE_SOURCE_WITHOUT_ASSET)

export const MOCK_PERMISSIONS = 816n // 11 00 11 00 00
export const MOCK_SACD_SOURCE = 'ipfs://QmYA2fn8cMbVWo4v95RwcwJVyQsNtnEwHerfWR8UNtEwoE'

export const MOCK_PAYMENT_AMOUNT = 10000000000000000000n
export const MOCK_PAYMENT_CURRENCY = ethers.encodeBytes32String('ZZZ').slice(0, 8) // bytes3

export const DEFAULT_ADMIN_ROLE = ethers.ZeroHash
export const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE'))
export const TEMPLATE_MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('TEMPLATE_MANAGER_ROLE'))

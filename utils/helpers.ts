import * as fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'

type AddressesByNetwork = {
  [index: string]: string
}

export function stringToUint256WithHash(str: string): string {
  // Convert string to bytes
  const strBytes = ethers.toUtf8Bytes(str)

  // Hash string
  const strHash = ethers.keccak256(strBytes)

  // Convert to BigInt
  const uint256Value = BigInt(strHash)

  // Return as string
  return uint256Value.toString()
}

export function getAddresses() {
  return JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'scripts', 'data', 'addresses.json'), 'utf8'))
}

export function writeAddresses(addresses: AddressesByNetwork, networkName: string) {
  console.log('\n----- Writing addresses to file -----')

  const currentAddresses: AddressesByNetwork = addresses
  currentAddresses[networkName] = addresses[networkName]

  fs.writeFileSync(
    path.resolve(__dirname, '..', 'scripts', 'data', 'addresses.json'),
    JSON.stringify(currentAddresses, null, 4)
  )

  console.log('----- Addresses written to file -----\n')
}

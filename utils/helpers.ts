import { ethers } from 'ethers'

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

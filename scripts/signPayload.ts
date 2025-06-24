import * as fs from 'fs'
import path from 'path'
import { ethers } from 'hardhat'

interface Payload {
  specversion: string
  time: string
  type: string
  data: { [key: string]: any }
  signature?: `0x${string}`
}

async function signPayload(payload: Payload, privateKey: `0x${string}`): Promise<Payload> {
  try {
    const dataJson = JSON.stringify(payload.data)

    const prefix = `\x19Ethereum Signed Message:\n${dataJson.length}`
    const prefixedMessage = prefix + dataJson

    // Convert to bytes and compute Keccak256 hash
    const messageBytes = ethers.toUtf8Bytes(prefixedMessage)
    const msgHash = ethers.keccak256(messageBytes)

    // Sign the hash directly
    const signingKey = new ethers.SigningKey(privateKey)
    const signature = signingKey.sign(msgHash)
    const fullSignature = signature.r + signature.s.slice(2) + signature.v.toString(16).padStart(2, '0')

    // Add signature
    payload.signature = fullSignature as `0x${string}`

    return payload
  } catch (error) {
    throw new Error(`Failed to sign payload: ${error}`)
  }
}

function verifySignature(payload: Payload, expectedAddress: string): boolean {
  try {
    if (!payload.signature) {
      return false
    }

    const signature = payload.signature

    const dataJson = JSON.stringify(payload.data)

    // Add Ethereum Signed Message prefix (same as signing process)
    const prefix = `\x19Ethereum Signed Message:\n${dataJson.length}`
    const prefixedMessage = prefix + dataJson

    // Convert to bytes and compute Keccak256 hash
    const messageBytes = ethers.toUtf8Bytes(prefixedMessage)
    const msgHash = ethers.keccak256(messageBytes)

    // Recover the signer's address from the signature
    const recoveredAddress = ethers.recoverAddress(msgHash, signature)

    // Verify if expectedAddress matches
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

function readPayloadFromFile(filePath: string): Payload {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const jsonData = JSON.parse(fileContent)

    // Ensure the file content matches our Payload interface structure
    // If the file contains just the data part, wrap it in our Payload structure
    if (!jsonData.data && typeof jsonData === 'object') {
      return {
        specversion: '',
        time: '',
        type: '',
        data: jsonData,
      }
    }

    return jsonData as Payload
  } catch (error) {
    console.error(`Error reading payload from path ${filePath}:`, error)
    throw new Error(`Failed to read payload from file: ${error}`)
  }
}

function saveSignedPayload(payload: Payload, fileName: string): void {
  try {
    const filePath = path.resolve(__dirname, '../data', fileName)
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4))
    console.log(`Signed payload saved to: ${filePath}`)
  } catch (error) {
    console.error(`Error saving signed payload to file:`, error)
  }
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY environment variable is not set')
    process.exit(1)
  }

  // Choose file path to sign
  const fileName = 'sacd.full.example.json'
  const filePath = path.resolve(__dirname, '..', 'data', fileName)

  console.log(`\nReading payload from: ${fileName}`)
  const payload = readPayloadFromFile(filePath)

  // Sign the payload
  console.log('Signing payload...')
  const signedPayload = await signPayload(payload, privateKey)

  // Save the signed payload
  const outputFileName = `signed_${fileName}`
  saveSignedPayload(signedPayload, outputFileName)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

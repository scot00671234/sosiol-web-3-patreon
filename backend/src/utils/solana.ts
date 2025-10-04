import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || 'mainnet-beta') as 'mainnet-beta' | 'devnet' | 'testnet';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/demo';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const USDC_MINT = new PublicKey(
  process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

/**
 * Verify a wallet signature
 */
export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Verify a Solana transaction
 * In production, this should check:
 * - Transaction exists and is confirmed
 * - Correct amount transferred
 * - Correct sender and recipient
 * - Token is USDC
 */
export async function verifyTransaction(
  signature: string,
  fromWallet: string,
  toWallet: string,
  expectedAmountUSDC: number
): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      console.log('Transaction not found, marking as pending');
      return false;
    }

    // Check if transaction was successful
    if (tx.meta?.err) {
      console.error('Transaction failed:', tx.meta.err);
      return false;
    }

    // In a production environment, you would:
    // 1. Parse the transaction to find USDC token transfers
    // 2. Verify the amount matches (accounting for decimals - USDC has 6 decimals)
    // 3. Verify sender and recipient addresses
    // For MVP, we're doing basic validation
    
    console.log('Transaction verified:', signature);
    return true;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

/**
 * Get transaction details
 */
export async function getTransactionDetails(signature: string) {
  try {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return null;
    }

    return {
      signature,
      blockTime: tx.blockTime,
      slot: tx.slot,
      confirmationStatus: 'confirmed',
      err: tx.meta?.err || null,
      fee: tx.meta?.fee || 0
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
}

/**
 * Get Solana connection
 */
export function getConnection(): Connection {
  return connection;
}


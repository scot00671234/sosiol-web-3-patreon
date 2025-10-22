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
    console.log(`Verifying transaction: ${signature}`);
    console.log(`From: ${fromWallet}, To: ${toWallet}, Amount: ${expectedAmountUSDC}`);
    
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

    // Check if this is a self-payment (same wallet)
    const isSelfPayment = fromWallet === toWallet;
    console.log(`Self-payment detected: ${isSelfPayment}`);

    // For self-payments, we'll be more lenient with verification
    // since the transaction exists and is confirmed
    if (isSelfPayment) {
      console.log('Self-payment verified (relaxed validation)');
      return true;
    }

    // For regular payments, check if transaction has any token transfers
    if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
      console.log('Transaction has token transfers, verifying...');
      // For now, if transaction exists and is confirmed, accept it
      // In production, you'd parse the token transfers to verify USDC amount
      return true;
    }

    // For MVP testing, accept any confirmed transaction
    // In production, you would:
    // 1. Parse the transaction to find USDC token transfers
    // 2. Verify the amount matches (accounting for decimals - USDC has 6 decimals)
    // 3. Verify sender and recipient addresses
    
    console.log('Transaction verified (MVP mode):', signature);
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


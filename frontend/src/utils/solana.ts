import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { USDC_MINT, USDC_DECIMALS, SOLANA_RPC_URL } from '../config/constants';

/**
 * Get Solana connection
 */
export function getConnection(): Connection {
  console.log('Using Solana RPC URL:', SOLANA_RPC_URL);
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Convert USDC amount to lamports (accounting for 6 decimals)
 */
export function usdcToLamports(amount: number): number {
  return Math.floor(amount * Math.pow(10, USDC_DECIMALS));
}

/**
 * Convert lamports to USDC
 */
export function lamportsToUsdc(lamports: number): number {
  return lamports / Math.pow(10, USDC_DECIMALS);
}

/**
 * Get or create associated token account
 */
export async function getOrCreateAssociatedTokenAccount(
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  return associatedToken;
}

/**
 * Create a USDC transfer transaction
 */
export async function createUSDCTransferTransaction(
  connection: Connection,
  fromWallet: PublicKey,
  toWallet: PublicKey,
  amountUSDC: number
): Promise<Transaction> {
  const transaction = new Transaction();

  // Get associated token accounts
  const fromTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    fromWallet,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const toTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    toWallet,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Check if recipient token account exists
  let toTokenAccountInfo;
  try {
    toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
  } catch (error) {
    console.warn('Could not check recipient token account, assuming it needs to be created:', error);
    toTokenAccountInfo = null;
  }
  
  if (!toTokenAccountInfo) {
    // Create associated token account for recipient
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromWallet,
        toTokenAccount,
        toWallet,
        USDC_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add transfer instruction
  const amount = usdcToLamports(amountUSDC);
  transaction.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromWallet,
      amount,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // Get recent blockhash
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromWallet;
  } catch (error) {
    console.error('Error getting latest blockhash:', error);
    throw new Error('Failed to get latest blockhash. Please try again.');
  }

  return transaction;
}

/**
 * Get USDC balance for a wallet
 */
export async function getUSDCBalance(
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletAddress,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.uiAmount?.toString() || '0');
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return 0;
  }
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Sign a message with wallet
 */
export async function signMessage(message: string, wallet: any): Promise<string> {
  const encodedMessage = new TextEncoder().encode(message);
  const signature = await wallet.signMessage(encodedMessage);
  return btoa(String.fromCharCode(...signature));
}


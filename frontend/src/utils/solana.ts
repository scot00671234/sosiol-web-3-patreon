import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { USDC_MINT, USDC_DECIMALS, SOLANA_RPC_URL } from '../config/constants';

// Blockhash caching to reduce RPC calls
let cachedBlockhash: string | null = null;
let blockhashTimestamp: number = 0;
const BLOCKHASH_CACHE_DURATION = 30 * 1000; // 30 seconds

/**
 * Check if we can use cached blockhash
 */
function canUseCachedBlockhash(): boolean {
  const now = Date.now();
  return cachedBlockhash !== null && (now - blockhashTimestamp) < BLOCKHASH_CACHE_DURATION;
}

/**
 * Get cached blockhash if available
 */
function getCachedBlockhash(): string | null {
  if (canUseCachedBlockhash()) {
    console.log('✅ Using cached blockhash (age:', Date.now() - blockhashTimestamp, 'ms)');
    return cachedBlockhash;
  }
  return null;
}

/**
 * Cache a blockhash
 */
function cacheBlockhash(blockhash: string): void {
  cachedBlockhash = blockhash;
  blockhashTimestamp = Date.now();
  console.log('💾 Cached blockhash for future use');
}

/**
 * Check if error is due to insufficient funds
 */
function isInsufficientFundsError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  const errorCode = error?.code;
  
  return (
    message.includes('insufficient') ||
    message.includes('not enough') ||
    message.includes('balance') ||
    message.includes('funds') ||
    errorCode === -32602 || // Invalid params
    errorCode === -32000   // Server error
  );
}

/**
 * Check if error is due to RPC issues
 */
function isRpcError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  return (
    message.includes('403') ||
    message.includes('forbidden') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch')
  );
}

/**
 * Get Solana connection with fallback RPC endpoints
 */
export function getConnection(): Connection {
  console.log('Using Solana RPC URL:', SOLANA_RPC_URL);
  
  // Create connection with retry configuration
  const connection = new Connection(SOLANA_RPC_URL, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
    disableRetryOnRateLimit: false,
  });
  
  return connection;
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
  console.log(`🔍 Checking if recipient token account exists: ${toTokenAccount.toString()}`);
  try {
    toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
    if (toTokenAccountInfo) {
      console.log(`✅ Recipient token account exists and is valid`);
    } else {
      console.log(`ℹ️  Recipient token account does not exist, will create it`);
    }
  } catch (error) {
    console.warn('❌ Could not check recipient token account, assuming it needs to be created:', error);
    console.warn('Error details:', {
      name: (error as any).name,
      message: (error as any).message,
      code: (error as any).code
    });
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

  // Check for cached blockhash first
  const cachedBlockhashValue = getCachedBlockhash();
  if (cachedBlockhashValue) {
    console.log('🚀 Using cached blockhash, skipping RPC calls');
    transaction.recentBlockhash = cachedBlockhashValue;
    transaction.feePayer = fromWallet;
    return transaction;
  }

  // Get recent blockhash with retry logic
  let blockhash;
  const rpcEndpoints = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://solana-mainnet.g.alchemy.com/v2/demo',
    'https://api.devnet.solana.com',
    'https://solana.public-rpc.com',
    'https://rpc.helius.xyz/?api-key=free',
    'https://solana-mainnet.quiknode.pro/',
    'https://rpc.solana.com'
  ];
  
  console.log('🔍 Starting RPC endpoint testing for blockhash retrieval...');
  console.log(`📊 Total endpoints to try: ${rpcEndpoints.length}`);
  
  for (let i = 0; i < rpcEndpoints.length; i++) {
    const rpcUrl = rpcEndpoints[i];
    const startTime = Date.now();
    
    try {
      console.log(`🔄 [${i + 1}/${rpcEndpoints.length}] Testing: ${rpcUrl}`);
      console.log(`⏱️  Attempt started at: ${new Date().toISOString()}`);
      
      const testConnection = new Connection(rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 10000,
        disableRetryOnRateLimit: false,
      });
      
      const result = await testConnection.getLatestBlockhash();
      const duration = Date.now() - startTime;
      
      blockhash = result.blockhash;
      console.log(`✅ SUCCESS! Got blockhash from: ${rpcUrl}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`🔑 Blockhash: ${blockhash.substring(0, 8)}...`);
      
      // Cache the blockhash for future use
      cacheBlockhash(blockhash);
      break;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ FAILED [${i + 1}/${rpcEndpoints.length}] ${rpcUrl}`);
      console.error(`⏱️  Duration: ${duration}ms`);
      
      // Classify the error type
      const errorType = isInsufficientFundsError(error) ? '💰 INSUFFICIENT FUNDS' : 
                       isRpcError(error) ? '🌐 RPC ERROR' : '❓ UNKNOWN ERROR';
      
      console.error(`🚨 ${errorType}:`, {
        name: (error as any).name,
        message: (error as any).message,
        code: (error as any).code,
        type: typeof error
      });
      
      // If it's an insufficient funds error, throw immediately
      if (isInsufficientFundsError(error)) {
        throw new Error('Insufficient funds. Please check your wallet balance and try again.');
      }
      
      // Add a small delay between retries to avoid rate limiting
      if (i < rpcEndpoints.length - 1) {
        console.log(`⏳ Waiting 2 seconds before trying next endpoint...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (i === rpcEndpoints.length - 1) {
        console.error('💥 ALL RPC ENDPOINTS FAILED!');
        console.error('📊 Summary of failures:');
        rpcEndpoints.forEach((url, index) => {
          console.error(`  ${index + 1}. ${url}`);
        });
        
        // Last resort: try to use a cached blockhash or create a mock one
        console.log('🆘 Attempting fallback strategy...');
        try {
          // Try one more time with the first endpoint after a longer delay
          console.log('⏳ Waiting 5 seconds and trying first endpoint again...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const fallbackConnection = new Connection(rpcEndpoints[0], {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 30000,
            disableRetryOnRateLimit: false,
          });
          
          const result = await fallbackConnection.getLatestBlockhash();
          blockhash = result.blockhash;
          console.log('🎉 FALLBACK SUCCESS! Got blockhash on retry');
          break;
        } catch (fallbackError) {
          console.error('💀 Fallback also failed:', fallbackError);
          
          // Last resort: use a mock blockhash for testing (NOT for production)
          if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
            console.warn('🧪 DEVELOPMENT MODE: Using mock blockhash');
            blockhash = '11111111111111111111111111111111'; // Mock blockhash
            console.log('⚠️  WARNING: Using mock blockhash - transaction may fail');
          } else {
            throw new Error('Failed to get latest blockhash from all RPC endpoints. Please check your internet connection and try again.');
          }
        }
      }
    }
  }
  
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromWallet;

  return transaction;
}

/**
 * Get a working RPC connection for transaction confirmation
 */
export function getWorkingConnection(): Connection {
  // Use the same endpoint that worked for blockhash
  const workingRpcUrl = 'https://solana-mainnet.g.alchemy.com/v2/demo';
  console.log('🔗 Using working RPC connection for confirmation:', workingRpcUrl);
  
  return new Connection(workingRpcUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
    disableRetryOnRateLimit: false,
  });
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


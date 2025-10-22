import { PublicKey } from '@solana/web3.js';

export const API_URL = import.meta.env.VITE_API_URL || 'https://sosiol.com/api';
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta';
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Debug logging
console.log('Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL,
  API_URL,
  SOLANA_RPC_URL
});
export const USDC_MINT = new PublicKey(import.meta.env.VITE_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// USDC has 6 decimals
export const USDC_DECIMALS = 6;

// Quick tip amounts
export const QUICK_TIP_AMOUNTS = [5, 10, 25, 50, 100];

// App metadata
export const APP_NAME = 'Sosiol';
export const APP_DESCRIPTION = 'Web3 Creator Platform powered by Solana';


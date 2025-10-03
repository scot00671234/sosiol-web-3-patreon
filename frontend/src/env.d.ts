/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_SOLANA_NETWORK?: string
  readonly VITE_SOLANA_RPC_URL?: string
  readonly VITE_USDC_MINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}



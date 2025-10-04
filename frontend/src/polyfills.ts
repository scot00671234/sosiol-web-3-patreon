import { Buffer } from 'buffer';

// Polyfill Buffer for browser - must be done before any Solana imports
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
  console.log('Buffer polyfill loaded');
}

// Polyfill global for browser
if (typeof globalThis.global === 'undefined') {
  globalThis.global = globalThis;
}

// Polyfill process for browser
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = {
    env: {},
    browser: true,
  };
}

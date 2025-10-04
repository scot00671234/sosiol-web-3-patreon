import { Buffer } from 'buffer';

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

// Polyfill process for browser
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = {
    env: {},
    browser: true,
  };
}

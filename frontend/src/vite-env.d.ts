/// <reference types="vite/client" />

import type { Eip1193Provider } from 'ethers';

/** MetaMask and similar wallets expose events on top of EIP-1193 */
export type BrowserEthereumProvider = Eip1193Provider & {
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: BrowserEthereumProvider;
  }
}

export {};

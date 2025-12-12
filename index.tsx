import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix for "Buffer is not defined" error in some browser environments.
// We define a functional polyfill (not just a stub) so that if SDKs use it, 
// they get valid data instead of empty arrays.
if (typeof window !== 'undefined') {
  if (!('Buffer' in window)) {
    (window as any).Buffer = {
      isBuffer: (obj: any) => obj && obj.constructor && obj.constructor.name === 'Buffer',
      from: (data: any, encoding?: string) => {
        try {
          if (Array.isArray(data) || data instanceof Uint8Array) {
            return new Uint8Array(data);
          }
          if (typeof data === 'string') {
            if (encoding === 'base64') {
               const binaryString = window.atob(data);
               const len = binaryString.length;
               const bytes = new Uint8Array(len);
               for (let i = 0; i < len; i++) {
                 bytes[i] = binaryString.charCodeAt(i);
               }
               return bytes;
            }
            // Fallback for utf-8 or unspecified encoding
            return new TextEncoder().encode(data);
          }
          return new Uint8Array(0);
        } catch (e) {
          console.warn("Buffer.from polyfill failed", e);
          return new Uint8Array(0);
        }
      },
      alloc: (size: number) => new Uint8Array(size),
    };
  }
  if (!('global' in window)) {
    (window as any).global = window;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
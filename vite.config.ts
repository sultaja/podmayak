import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Get API key from environment (supports both local .env.local and Vercel env vars)
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  // Log warning if API key is missing (but don't fail build - allow runtime fallback to Firebase)
  if (!apiKey && mode !== 'test') {
    console.warn('⚠️  GEMINI_API_KEY not found in environment. The app will try to fetch it from Firebase at runtime.');
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Inject API key into the bundle (will be undefined if not set, which is OK - Firebase fallback exists)
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

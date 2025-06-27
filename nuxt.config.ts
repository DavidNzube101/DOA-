// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/image', '@nuxt/ui', '@nuxt/fonts'],
  
  // Build configuration for Three.js
  build: {
    transpile: ['three', 'vue-three']
  },
  
  // Runtime config for environment variables
  runtimeConfig: {
    public: {
      // Solana network configuration
      solanaNetwork: process.env.SOLANA_NETWORK || 'devnet',
      // Gorbagana RPC endpoint (now set to the correct endpoint)
      gorbaganaRpcUrl: process.env.GORBAGANA_RPC_URL || 'https://rpc.gorbagana.wtf',
      // Firebase config (we'll add this later)
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
      }
    }
  },
  
  // CSS and styling
  css: ['~/assets/css/main.css'],
  
  // App configuration
  app: {
    head: {
      title: 'Daughters of Aether',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A PvP arena game on Gorbagana testnet' }
      ]
    }
  }
})
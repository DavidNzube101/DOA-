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
      // Environment configuration
      environment: process.env.NODE_ENV || 'development',
      
      // RPC Configuration
      solanaDevnetRpcUrl: process.env.SOLANA_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
      gorbaganaRpcUrl: process.env.GORBAGANA_RPC_URL || 'https://rpc.gorbagana.wtf',
      
      // Program IDs
      developmentProgramId: process.env.DEVELOPMENT_PROGRAM_ID || '5RV8MAYjHoSb16VkqjqN5KGX139MULDR6GHuYhxettKT',
      productionProgramId: process.env.PRODUCTION_PROGRAM_ID || '', // Empty for now
      
      // Server Authority
      serverAuthPublicKey: process.env.SERVER_AUTH_PUBLIC_KEY || '2RNksAgJAjwb5iXqoh6sNZW7Fjabqg7WeE64KywEyC2C',
      serverAuthKeypair: process.env.SERVER_AUTH_KEYPAIR || '[61,249,35,240,89,226,101,89,86,154,227,218,12,139,225,91,224,228,129,221,232,53,12,234,211,193,187,46,255,95,209,195,21,26,57,236,80,176,186,109,41,150,71,84,88,251,65,155,36,143,69,45,25,228,161,8,90,137,6,170,58,22,111,33]',
      
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
        { name: 'description', content: 'A PvP arena game on Solana devnet (development) / Gorbagana (production)' }
      ]
    }
  },

  vite: {
    define: {
      'global': {},
    },
    optimizeDeps: {
      include: ['buffer'],
    },
    resolve: {
      alias: {
        buffer: 'buffer',
      },
    },
  },
})
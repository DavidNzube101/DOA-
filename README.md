# Daughters of Aether – Game UI

This is the frontend for Daughters of Aether, a real-time Web3 PvP arena game built with Nuxt 3, Vue 3, and Three.js.

## Features

- **Wallet Connection:** Connects to Solana wallets (Phantom, Solflare, etc.).
- **Character Selection:** 3D character previews and selection.
- **Staking:** Players stake tokens to enter battles.
- **Matchmaking:** Real-time matchmaking via Socket.IO.
- **Battle Arena:** 3D real-time battles with health, mana, and animations.
- **Battle Resolution:** Victory, defeat, tie, forfeit, and disconnect scenarios with animated modals and sound.
- **Transaction Feedback:** Real-time transaction status, error handling, and user feedback.

## Getting Started

1. **Install dependencies:**
   ```
   pnpm install
   ```
2. **Set environment variables:**  
   Configure RPC URLs, program IDs, and server URLs in `.env` or Vercel dashboard.

3. **Run locally:**
   ```
   pnpm dev
   ```

4. **Build for production:**
   ```
   pnpm build
   pnpm start
   ```

## Deployment

- Deploy to Vercel for serverless hosting.
- Set all required environment variables in Vercel dashboard.

## Tech Stack

- Nuxt 3, Vue 3, Three.js, Socket.IO, Solana web3.js

## Security

- Never expose private keys or secrets in the frontend.
- Always test on devnet before mainnet.

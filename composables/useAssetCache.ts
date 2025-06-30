import { ref } from 'vue'
import { GAME_ASSETS } from '~/assets/assetsList'

const CACHE_NAME = 'doa-game-assets-v1'

export function useAssetCache() {
  const progress = ref(0)
  const totalSize = ref(0)
  const downloadedSize = ref(0)

  // Check if all assets are cached
  async function areAllAssetsCached() {
    const cache = await caches.open(CACHE_NAME)
    const cachedRequests = await cache.keys()
    const cachedUrls = cachedRequests.map(req => new URL(req.url).pathname)
    return GAME_ASSETS.every(asset => cachedUrls.includes(asset))
  }

  // Download and cache all assets, with progress
  async function downloadAndCacheAssets(onProgress) {
    const cache = await caches.open(CACHE_NAME)
    totalSize.value = 0
    downloadedSize.value = 0

    // Get total size (optional, can be skipped for simplicity)
    for (const asset of GAME_ASSETS) {
      const res = await fetch(asset, { method: 'HEAD' })
      totalSize.value += Number(res.headers.get('content-length') || 0)
    }

    for (let i = 0; i < GAME_ASSETS.length; i++) {
      const asset = GAME_ASSETS[i]
      const res = await fetch(asset)
      await cache.put(asset, res.clone())
      downloadedSize.value += Number(res.headers.get('content-length') || 0)
      progress.value = ((i + 1) / GAME_ASSETS.length) * 100
      if (onProgress) onProgress(progress.value)
    }
  }

  return {
    areAllAssetsCached,
    downloadAndCacheAssets,
    progress,
    totalSize,
    downloadedSize
  }
} 
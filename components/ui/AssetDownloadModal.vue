<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>Download Game Assets</h2>
      <p>
        For the best experience, download all game assets now.<br>
        This will make future loads much faster!
      </p>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <p>{{ formattedDownloadedSize }} / {{ formattedTotalSize }}</p>
      <p v-if="progress < 100">Downloading assets... ({{ Math.round(progress) }}%)</p>
      <p v-else>All assets downloaded! You can now play instantly next time.</p>
      <button v-if="progress < 100" disabled>Downloading...</button>
      <button v-else @click="$emit('close')">Continue</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAssetCache } from '~/composables/useAssetCache'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits(['close'])

const { progress, totalSize, downloadedSize, downloadAndCacheAssets } = useAssetCache()

const formattedTotalSize = computed(() => formatBytes(totalSize.value))
const formattedDownloadedSize = computed(() => formatBytes(downloadedSize.value))

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

watch(() => props.visible, async (val) => {
  if (val) {
    await downloadAndCacheAssets()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #181a20;
  color: #fff;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
}
.progress-bar-container {
  width: 100%;
  height: 18px;
  background: #333;
  border-radius: 9px;
  margin: 1rem 0;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00e5ff, #b400ff);
  transition: width 0.3s;
}
button {
  margin-top: 1.5rem;
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 0.5rem;
  background: #00e5ff;
  color: #181a20;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button[disabled] {
  background: #888;
  color: #ccc;
  cursor: not-allowed;
}
</style> 
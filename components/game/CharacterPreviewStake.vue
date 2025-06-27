<template>
  <div class="character-preview-stake">
    <div class="preview-container">
      <div class="character-section">
        <h2 class="section-title">Your Chosen Daughter</h2>
        <div class="character-visual">
          <div class="avatar-large">
            <div v-if="character && !modelLoadError" ref="threePreview" class="three-preview-canvas"></div>
            <Icon v-else name="heroicons:user" class="w-24 h-24" />
          </div>
          <div class="character-info">
            <h3 class="character-name">{{ character?.name }}</h3>
            <p class="character-element">Element: {{ character?.element }}</p>
            <p class="character-description">{{ character?.description }}</p>
          </div>
        </div>
      </div>
      <div class="stake-section">
        <h2 class="section-title">Prepare for Battle</h2>
        <div class="wallet-balance">
          <span>Wallet Balance:</span>
          <span class="balance">{{ walletBalance }} GOR</span>
        </div>
        <div class="stake-input-group">
          <input
            v-model="stakeAmount"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="Enter stake amount in GOR"
            class="stake-input"
          />
          <button class="max-btn" @click="setMaxStake">MAX</button>
        </div>
        <button 
          class="enter-btn"
          :disabled="!canEnterBattle"
          @click="enterBattle"
        >
          Enter Battle
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useSound } from '~/composables/useSound'

const props = defineProps<{
  character: any
  walletBalance: number
}>()

const emit = defineEmits<{
  'enter-battle': [stakeAmount: number]
}>()

// Sound system
const { playClickSound } = useSound()

const stakeAmount = ref('0.1')

const canEnterBattle = computed(() => {
  const amount = parseFloat(stakeAmount.value)
  return amount >= 0.1 && amount <= (props.walletBalance || 0)
})

const setMaxStake = () => {
  playClickSound()
  stakeAmount.value = (props.walletBalance || 0).toString()
}

const enterBattle = () => {
  if (canEnterBattle.value) {
    playClickSound()
    emit('enter-battle', parseFloat(stakeAmount.value))
  }
}

// --- 3D Preview Logic ---
const threePreview = ref<HTMLElement | null>(null)
let previewRenderer: THREE.WebGLRenderer | null = null
let previewScene: THREE.Scene | null = null
let previewCamera: THREE.PerspectiveCamera | null = null
let previewModel: THREE.Object3D | null = null
let previewAnimationId: number | null = null
let previewMixer: THREE.AnimationMixer | null = null
let isDragging = false
let lastX = 0
let modelLoadError = ref(false)

function cleanupPreview() {
  if (previewAnimationId) cancelAnimationFrame(previewAnimationId)
  if (previewRenderer && previewRenderer.domElement && previewRenderer.domElement.parentNode) {
    previewRenderer.domElement.parentNode.removeChild(previewRenderer.domElement)
  }
  previewRenderer = null; previewScene = null; previewCamera = null; previewModel = null; previewMixer = null
}

watch(() => props.character, async (character) => {
  await nextTick()
  cleanupPreview()
  modelLoadError.value = false
  if (!character || !threePreview.value) return

  // Setup Three.js scene
  previewScene = new THREE.Scene()
  previewScene.background = new THREE.Color('#18182f')
  previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  previewCamera.position.set(0, 1.5, 3)
  previewCamera.lookAt(0, 1, 0)
  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  previewRenderer.setSize(260, 260)
  threePreview.value.appendChild(previewRenderer.domElement)

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7)
  previewScene.add(ambient)
  const dir = new THREE.DirectionalLight(0xffffff, 0.7)
  dir.position.set(2, 4, 2)
  previewScene.add(dir)

  // Load idle .glb
  const loader = new GLTFLoader()
  const charName = character.name.toLowerCase()
  loader.load(
    `/models/${character.name}/${charName}_idle.glb`,
    (gltf) => {
      previewModel = gltf.scene
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(previewModel)
      const size = new THREE.Vector3()
      box.getSize(size)
      const center = new THREE.Vector3()
      box.getCenter(center)
      // Center the model at the origin
      previewModel.position.x += (previewModel.position.x - center.x)
      previewModel.position.y += (previewModel.position.y - center.y)
      previewModel.position.z += (previewModel.position.z - center.z)
      // Scale the model to fit the preview
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 1.5 / maxDim
      previewModel.scale.setScalar(scale)
      previewScene!.add(previewModel)
      // Animation
      if (gltf.animations && gltf.animations.length > 0) {
        previewMixer = new THREE.AnimationMixer(previewModel)
        const action = previewMixer.clipAction(gltf.animations[0])
        action.play()
      }
    },
    undefined,
    (error) => {
      modelLoadError.value = true
      console.error('Failed to load model:', error)
    }
  )

  // Mouse drag to rotate
  const canvas = previewRenderer.domElement
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
  })
  window.addEventListener('mousemove', (e) => {
    if (isDragging && previewModel) {
      const delta = e.clientX - lastX
      previewModel.rotation.y += delta * 0.01
      lastX = e.clientX
    }
  })
  window.addEventListener('mouseup', () => {
    isDragging = false
  })

  // Animate
  const animate = () => {
    previewAnimationId = requestAnimationFrame(animate)
    if (previewMixer) previewMixer.update(1/60)
    previewRenderer!.render(previewScene!, previewCamera!)
  }
  animate()
})

onMounted(async () => {
  if (props.character) {
    await nextTick()
    cleanupPreview()
    modelLoadError.value = false
    if (!threePreview.value) return
    previewScene = new THREE.Scene()
    previewScene.background = new THREE.Color('#18182f')
    previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    previewCamera.position.set(0, 1.5, 3)
    previewCamera.lookAt(0, 1, 0)
    previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    previewRenderer.setSize(260, 260)
    threePreview.value.appendChild(previewRenderer.domElement)
    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    previewScene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.7)
    dir.position.set(2, 4, 2)
    previewScene.add(dir)
    const loader = new GLTFLoader()
    const charName = props.character.name.toLowerCase()
    loader.load(
      `/models/${props.character.name}/${charName}_idle.glb`,
      (gltf) => {
        previewModel = gltf.scene
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(previewModel)
        const size = new THREE.Vector3()
        box.getSize(size)
        const center = new THREE.Vector3()
        box.getCenter(center)
        previewModel.position.x += (previewModel.position.x - center.x)
        previewModel.position.y += (previewModel.position.y - center.y)
        previewModel.position.z += (previewModel.position.z - center.z)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 3 / maxDim
        previewModel.scale.setScalar(scale)
        previewScene!.add(previewModel)
        if (gltf.animations && gltf.animations.length > 0) {
          previewMixer = new THREE.AnimationMixer(previewModel)
          const action = previewMixer.clipAction(gltf.animations[0])
          action.play()
        }
      },
      undefined,
      (error) => {
        modelLoadError.value = true
        console.error('Failed to load model:', error)
      }
    )
    const canvas = previewRenderer.domElement
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true
      lastX = e.clientX
    })
    window.addEventListener('mousemove', (e) => {
      if (isDragging && previewModel) {
        const delta = e.clientX - lastX
        previewModel.rotation.y += delta * 0.01
        lastX = e.clientX
      }
    })
    window.addEventListener('mouseup', () => {
      isDragging = false
    })
    const animate = () => {
      previewAnimationId = requestAnimationFrame(animate)
      if (previewMixer) previewMixer.update(1/60)
      previewRenderer!.render(previewScene!, previewCamera!)
    }
    animate()
  }
})
</script>

<style scoped>
.character-preview-stake {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
}
.preview-container {
  max-width: 1100px;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 6rem;
  background: rgba(26, 26, 46, 0.95);
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  padding: 4rem 5rem;
}
.character-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.character-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.avatar-large {
  width: 260px;
  height: 320px;
  background: rgba(99,102,241,0.2);
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  border: 2px solid rgba(99,102,241,0.3);
  margin-bottom: 1rem;
}
.character-info {
  text-align: center;
}
.character-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}
.character-element {
  font-size: 1rem;
  color: var(--accent-color);
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.character-description {
  font-size: 1rem;
  color: var(--text-secondary);
}
.stake-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
.wallet-balance {
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
}
.balance {
  color: var(--success-color);
  font-weight: 700;
  margin-left: 0.5rem;
}
.stake-input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.stake-input {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
  font-size: 1.25rem;
  width: 160px;
}
.max-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.max-btn:hover {
  background: #d97706;
}
.enter-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(99,102,241,0.3);
  transition: all 0.3s ease;
}
.enter-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 900px) {
  .preview-container {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 1rem;
  }
}
.three-preview-canvas {
  width: 240px;
  height: 300px;
  background: #18182f;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(99,102,241,0.15);
  margin: 0 auto;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 
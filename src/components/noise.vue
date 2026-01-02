<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'

interface NoiseProps {
  patternRefreshInterval?: number
  patternAlpha?: number
  mixBlendMode?: string
}

const props = withDefaults(defineProps<NoiseProps>(), {
  patternRefreshInterval: 2,
  patternAlpha: 10,
  mixBlendMode: 'normal',
})

const grainRef = useTemplateRef<HTMLCanvasElement>('grainRef')

let animationId = 0
let frame = 0
const canvasSize = 1024

function resize() {
  const canvas = grainRef.value
  if (!canvas)
    return
  canvas.width = canvasSize
  canvas.height = canvasSize
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
}

let noiseData: ImageData
let noise32: Uint32Array

function initImageData(ctx: CanvasRenderingContext2D) {
  noiseData = ctx.createImageData(canvasSize, canvasSize)
  noise32 = new Uint32Array(noiseData.data.buffer)
}

function drawGrain() {
  const a = props.patternAlpha << 24
  for (let i = 0; i < noise32.length; i++) {
    const v = (Math.random() * 255) | 0
    noise32[i] = a | (v << 16) | (v << 8) | v
  }
}

function loop(ctx: CanvasRenderingContext2D) {
  if (frame % Math.max(1, Math.round(props.patternRefreshInterval)) === 0) {
    drawGrain()
    ctx.putImageData(noiseData, 0, 0)
  }
  frame++
  animationId = requestAnimationFrame(() => loop(ctx))
}

onMounted(() => {
  const canvas = grainRef.value
  if (!canvas)
    return
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx)
    return

  resize()
  initImageData(ctx)
  drawGrain()
  ctx.putImageData(noiseData, 0, 0)
  loop(ctx)

  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas
    ref="grainRef"
    class="h-screen w-screen pointer-events-none left-0 top-0 fixed z-1000"
    :style="`image-rendering: pixelated; mix-blend-mode: ${props.mixBlendMode}`"
  />
</template>

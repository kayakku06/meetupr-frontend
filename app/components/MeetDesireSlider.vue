<template>
  <div class="slider-card">
    <div class="title">会いたい度合い <span class="caret">▴</span></div>

    <div class="inner">
      <div class="icon-left" aria-hidden>
        <svg viewBox="0 0 24 24" class="icon"><path d="M9 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM15 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M12 17c2.5-2 6-2 8 0" stroke-linecap="round"/></svg>
      </div>

      <div class="track-wrap">
        <input
          ref="range"
          class="range"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="internalValue"
          :disabled="disabled"
          @input="onInput"
          @change="onChange"
          :style="progressStyle"
          aria-label="会いたい度合い"
        />

        <div class="ticks">
          <span v-for="m in marks" :key="m" class="tick">
            <span :class="['tick-mark', { filled: m <= internalValue }]"></span>
            <span class="tick-label">{{ m }}</span>
          </span>
        </div>
      </div>

      <div class="icon-right" aria-hidden>
        <svg viewBox="0 0 24 24" class="icon"><path d="M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/><path d="M17 21v-2a4 4 0 0 0-4-4H11a4 4 0 0 0-4 4v2"/></svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 5 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  color: { type: String, default: '#2ab79f' } // 緑
})
const emit = defineEmits(['update:modelValue'])

const internalValue = ref(props.modelValue)
watch(() => props.modelValue, v => (internalValue.value = v))

const marks = computed(() => {
  const list = []
  for (let i = props.min; i <= props.max; i++) list.push(i)
  return list
})

const percent = computed(() => {
  if (props.max === props.min) return 0
  return ((internalValue.value - props.min) / (props.max - props.min)) * 100
})

const progressStyle = computed(() => {
  // 左：緑、右：黒寄りの色（画像に近づける）
  const filled = props.color
  const empty = props.disabled ? '#f0f0f0' : '#1f1f1f'
  // 少し左寄せの余白（thumbの太さを考慮しつつ均して見えるように）
  return {
    background: `linear-gradient(90deg, ${filled} ${percent.value}%, ${empty} ${percent.value}%)`
  }
})

function onInput(e) {
  internalValue.value = Number(e.target.value)
  emit('update:modelValue', internalValue.value)
}
function onChange(e) {
  internalValue.value = Number(e.target.value)
  emit('update:modelValue', internalValue.value)
}
</script>

<style scoped>
.slider-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  max-width: 420px;
  margin: 8px auto;
  box-shadow: 0 2px 0 rgba(0,0,0,0.04);
}
.title {
  text-align: center;
  font-size: 14px;
  color: #5b4b3b;
  margin-bottom: 8px;
}
.title .caret { font-size: 12px; margin-left: 6px; color: #5b4b3b }
.inner {
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 12px;
  border-radius:10px;
  background: transparent;
}
.icon-left, .icon-right { width:34px; height:34px; display:flex; align-items:center; justify-content:center; color:#2ab79f }
.icon { width:20px; height:20px; stroke: currentColor; fill:none; stroke-width:1.2; opacity:0.95 }

/* Track + ticks */
.track-wrap { position:relative; flex:1; padding:8px 0; }
.range {
  -webkit-appearance: none;
  width:100%;
  height:6px;
  border-radius:6px;
  outline:none;
  margin:0;
  background: transparent; /* style で上書き */
  display:block;
}

/* Thumb */
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width:14px;
  height:14px;
  border-radius:50%;
  background: #2ab79f;
  border: 3px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
.range::-moz-range-thumb {
  width:14px;
  height:14px;
  border-radius:50%;
  background:#2ab79f;
  border:3px solid white;
}

/* ticks: spaced evenly below track */
.ticks {
  position: absolute;
  top: 22px;
  left: 8px;
  right: 8px;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  pointer-events:none;
}
.tick { display:flex; flex-direction:column; align-items:center; gap:6px; width:0; }
.tick-mark { width:2px; height:12px; background: #1f1f1f; border-radius:2px; transform: translateY(1px) }
.tick-mark.filled { background: #2ab79f }
.tick-label { font-size:12px; color:#4b3b2b; margin-top:2px }
</style>
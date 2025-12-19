<template>
  <div
    class="mood-container"
    :class="{ minimized: !isExpanded }"
  >

    <div
      v-if="!isExpanded"
      class="minimized-box"
      :style="{ backgroundColor: currentColor }"
      @click="toggleExpand"
      role="button"
      aria-label="開く"
    >
      <svg viewBox="0 0 24 24" class="icon-white-face">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
        <path d="M8 9h.01M16 9h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M7 13.5 Q12 19 17 13.5 Z" fill="white" stroke="none"/>
      </svg>
    </div>

    <div v-else class="slider-card">
      <div class="title" @click="toggleExpand">
        会いたい度 <ChevronUp class="caret" />
      </div>

      <div class="inner">
        <div class="icon-left" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon-face-outline">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 10h.01M15 10h.01" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M10 15c1.3 1 2.7 1 4 0" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="track-wrap">
          <div class="ticks-bg">
            <div v-for="m in marks" :key="m" class="tick-line"></div>
          </div>

          <input
            ref="range"
            class="range"
            type="range"
            :min="min"
            :max="max"
            :step="step"
            :value="internalValue"
            @input="onInput"
            @change="onChange"
            :style="trackStyle"
            aria-label="会いたい度合い"
          />
          
          <div class="tick-labels">
            <span v-for="m in marks" :key="m" class="tick-num">{{ m }}</span>
          </div>
        </div>

        <div class="icon-right" aria-hidden="true">
          <svg viewBox="0 0 24 24" class="icon-face-filled">
            <circle cx="12" cy="12" r="10" fill="#2ab79f" />
            <path d="M8 9h.01M16 9h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 13.5 Q12 19 17 13.5 Z" fill="white" stroke="none"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronUp } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Number, default: 3 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 5 },
  step: { type: Number, default: 1 },
})
const emit = defineEmits(['update:modelValue'])

// --- 状態管理 ---
const internalValue = ref(props.modelValue)
const isExpanded = ref(true) // 開閉状態

// 親コンポーネントからの変更を監視
watch(() => props.modelValue, (v) => {
  internalValue.value = v
})

// --- 計算プロパティ ---

const marks = computed(() => {
  const list = []
  for (let i = props.min; i <= props.max; i++) list.push(i)
  return list
})

// 色の定義 (薄い緑 -> 濃い緑)
const colorMap = {
  1: '#A4CBC7', 
  2: 'rgba(60, 147, 139, 0.60)', // 60% 
  3: 'rgba(60, 147, 139, 0.75)',
  4: 'rgba(60, 147, 139, 0.85)',
  5: 'rgba(60, 147, 139, 1.00)'  // 100% (最も濃い)
}

const currentColor = computed(() => {
  const val = Math.max(props.min, Math.min(props.max, internalValue.value))
  return colorMap[val] || colorMap[5]
})

const percent = computed(() => {
  if (props.max === props.min) return 0
  return ((internalValue.value - props.min) / (props.max - props.min)) * 100
})

const trackStyle = computed(() => {
  const filledColor = '#2ab79f'
  const emptyColor = '#333333'
  
  return {
    background: `linear-gradient(to right, 
      ${filledColor} 0%, 
      ${filledColor} ${percent.value}%, 
      ${emptyColor} ${percent.value}%, 
      ${emptyColor} 100%)`
  }
})

// --- メソッド ---

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function onInput(e) {
  internalValue.value = Number(e.target.value)
  emit('update:modelValue', internalValue.value)
}

</script>

<style scoped>
.mood-container {
  position: fixed;      /* ← ここ重要 */
  right: 16px;
  top: 80px;
  z-index: 50;          /* チャットより前に出す */
  background: transparent;

  /* レイアウトを占有しない */
  width: auto;
  height: auto;
  padding: 0;
}


.mood-container.minimized {
  position: fixed;
  right: 16px;
  top: 80px;
  padding: 0;
  background: transparent;
}


/* ▼ 最小化時のボックス ▼ */
.minimized-box {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-white-face {
  width: 35px;
  height: 35px;
  display: block;   /* ← 重要 */
}

/* ▼ 展開時のカード ▼ */
.slider-card {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  width: 360px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #4a3b32;
  margin-bottom: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative; /* caret を絶対配置できるように */
  height: auto;       /* 高さ固定せず */
  overflow: visible; /* caret がはみ出しても切れないように */
  padding-bottom: 6px; /* 下側に余白を作り caret が切れないよう調整 */
  line-height: 1.2;
}
/* ここが^のサイズとかのCSS */
.caret {
  position: relative;
  font-family: monospace;
  font-weight: bold;
  font-size: 30px;
  /* transform: scaleY(0.8); */
  /* 下方向へ少し移動（値を調整することで微調整可能） */
  display: inline-block; /* transform/位置調整を安定させる */
}

.inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* アイコン類 */
.icon-left, .icon-right {
  width: 32px; 
  height: 32px; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}
.icon-face-outline {
  width: 28px; height: 28px;
  fill: none;
  stroke: #88c2ba;
  stroke-width: 2;
}
.icon-face-filled {
  width: 30px; height: 30px;
}

/* トラック領域 */
.track-wrap {
  position: relative;
  flex: 1;
  height: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ticks-bg {
  position: absolute;
  top: 14px;
  left: 7px;
  right: 7px;
  display: flex;
  justify-content: space-between;
  z-index: 0;
  pointer-events: none;
}
.tick-line {
  width: 2px;
  height: 12px;
  background-color: #333;
  border-radius: 1px;
  transform: translateY(-50%);
}

.range {
  -webkit-appearance: none;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  outline: none;
  margin: 0;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2ab79f;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #2ab79f;
  cursor: pointer;
  margin-top: 0;
  transform: scale(1.2);
}
.range::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #2ab79f;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #2ab79f;
  cursor: pointer;
}

.tick-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
}
.tick-num {
  font-size: 12px;
  color: #555;
  width: 10px;
  text-align: center;
}
</style>
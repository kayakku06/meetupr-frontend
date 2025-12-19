<template>
  <!-- inline: existing layout (非固定)、bottom: 画面下に固定、top-right: 右上に×ボタン -->
  <div>
    <div v-if="position === 'inline'" class="flex gap-2 mt-1.5 justify-between">
      <button type="button"
              class="bg-orange-300 text-white px-3.5 py-2 rounded text-sm cursor-pointer transition w-[100px]"
              @click="$emit('back')">
              {{ backText }}
      </button>
      <button type="button"
              class="bg-orange-300 text-white px-3.5 py-2 rounded text-sm cursor-pointer transition w-[100px]"
              @click="$emit('next')">
              {{ nextText }}
      </button>
    </div>

    <div v-else-if="position === 'bottom'" class="fixed inset-x-0 bottom-0 p-4 bg-transparent">
      <div class="w-full flex justify-between items-center px-4">
        <!-- 戻るボタンと次へボタンを左右端に配置 -->
        <button type="button"
                class="bg-orange-300 text-white px-3.5 py-2 rounded text-sm cursor-pointer transition w-[100px]"
                @click="$emit('back')">
                {{ backText }}
        </button>
        <button type="button"
                class="bg-orange-300 text-white px-3.5 py-2 rounded text-sm cursor-pointer transition w-[100px]"
                @click="$emit('next')">
                {{ nextText }}
        </button>
      </div>
    </div>

    <div v-else-if="position === 'top-right'" class="fixed top-4 right-4">
      <!-- ポジションがtoprightのとき右上固定 -->
      <div class="flex items-center">
        <button
          type="button"
          class="bg-transparent text-white w-10 h-10 flex items-center justify-center text-2xl font-bold leading-none"
          aria-label="閉じる"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Position = 'inline' | 'bottom' | 'top-right'

interface Props {
  backText?: string;
  nextText?: string;
  position?: Position;
}

withDefaults(defineProps<Props>(), {
  backText: '戻る',
  nextText: '次へ',
  position: 'inline',
});

defineEmits<{
  back: [];
  next: [];
  close: [];
}>();
</script>
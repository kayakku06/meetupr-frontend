<template>
  <div class="flex gap-2 mt-1.5 justify-between">
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
</template>

<script setup lang="ts">
interface Props {
  backText?: string;
  nextText?: string;
}

withDefaults(defineProps<Props>(), {
  backText: '戻る',
  nextText: '次へ',
});

defineEmits<{
  back: [];
  next: [];
}>();
</script>
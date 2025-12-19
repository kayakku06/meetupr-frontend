<template>
  <div class="flex flex-col gap-2">
    <!-- 単一選択ヘッダ（multiple=falseのとき） -->
    <button
      v-if="!isMultiple && !panelOnly"
      type="button"
      @click="toggleOpen"
      :disabled="isReadOnly || disabled"
      class="flex justify-between items-center bg-white border-[3px] border-[var(--meetupr-sub)] rounded-md px-3 py-2 text-sm outline-none hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span class="text-amber-900">
        {{ headerPrefix ? headerPrefix + ' ' : '' }}{{ singleLabel || placeholder }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- 複数選択のチップ表示（multiple=trueのとき） -->
    <div v-else-if="!panelOnly" class="flex flex-col gap-2">
      <div class="text-[10px] text-amber-700" v-if="title">{{ title }}<span v-if="required" class="ml-0.5 text-red-500">*</span></div>
      <div class="flex gap-2 flex-wrap mb-1.5">
        <template v-for="(code, i) in arrayValue" :key="code + '-' + i">
          <div
            :class="[
              'flex items-center bg-white border-2 border-[var(--meetupr-sub)] px-2.5 py-1.5 rounded-full text-xs text-amber-900',
              readonlyOrDisabled ? 'opacity-50 cursor-not-allowed' : ''
            ]">
            <span class="select-none">{{ getLabel(code) }}</span>
            <button
              v-if="!readonlyOrDisabled"
              type="button"
              @click="toggle(code)"
              class="ml-2 text-[11px] text-gray-500 hover:text-gray-800"
            >×</button>
          </div>
        </template>
        <span v-if="arrayValue.length === 0" class="text-gray-400 text-sm">{{ placeholder }}</span>
      </div>
      <button
        v-if="!isReadOnly"
        type="button"
        @click="toggleOpen"
        :disabled="disabled"
        class="self-start bg-[var(--meetupr-sub)] text-white px-2.5 py-1.5 rounded text-sm cursor-pointer hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ selectButtonLabel }}
      </button>
    </div>

    <!-- 共通選択パネル -->
  <div v-if="showPanel" class="bg-white p-3 border-[3px] border-[var(--meetupr-sub)] rounded-md">
      <div class="flex gap-4 pb-3 border-b border-[var(--meetupr-sub)] mb-3 text-sm overflow-x-auto flex-nowrap -mx-3 px-3 snap-x">
        <span
          v-for="cat in categories"
          :key="cat.name"
          @click="activeTab = cat.name"
          class="shrink-0 snap-start px-1 cursor-pointer"
          :class="activeTab === cat.name ? 'text-[var(--meetupr-sub)] font-bold border-b-2 border-[var(--meetupr-sub)]' : 'text-gray-600 font-medium'"
        >
          {{ cat.name }}
        </span>
      </div>

      <div
        v-for="cat in categories"
        :key="cat.name"
        v-show="activeTab === cat.name"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="tag in (Array.isArray(cat.tags) ? cat.tags : [])"
          :key="tagKey(tag)"
          type="button"
          @click="onSelect(tagCode(tag))"
          :disabled="disabled"
          :class="isSelected(tagCode(tag))
            ? 'bg-[var(--meetupr-sub)] text-white border border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-sm cursor-pointer'
            : 'bg-white border border-[var(--meetupr-sub)] rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-gray-100'"
        >
          {{ tagLabel(tag) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type TagObj = { code: string; label: string }
type Tag = TagObj | string
type Category = { name: string; tags: Tag[] }

const props = defineProps<{
  title?: string
  placeholder?: string
  categories: Category[]
  multiple?: boolean
  modelValue: string | string[]
  headerPrefix?: string // 例: 'ネイティブ:'
  selectButtonLabel?: string // 複数選択時のボタン文言（デフォルト: '選択'）
  readonly?: boolean // パネル操作無効、表示のみ
  disabled?: boolean // ボタンや選択操作を無効
  panelOnly?: boolean
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | string[]): void
}>()

const isMultiple = computed(() => !!props.multiple)
const selectButtonLabel = computed(() => props.selectButtonLabel ?? '選択')
const isReadOnly = computed(() => !!props.readonly)
const readonlyOrDisabled = computed(() => isReadOnly.value || !!props.disabled)

// パネルの開閉とタブ状態
const open = ref(false)
const activeTab = ref(props.categories?.[0]?.name || '')

function toggleOpen() {
  if (isReadOnly.value || props.disabled) return
  open.value = !open.value
}

const panelOnly = computed(() => !!props.panelOnly)
const showPanel = computed(() => panelOnly.value ? true : open.value)

// 値の正規化
const arrayValue = computed<string[]>(() =>
  Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue ? [props.modelValue] : [])
)
const singleValue = computed<string>(() =>
  Array.isArray(props.modelValue) ? (props.modelValue[0] ?? '') : (props.modelValue || '')
)

// ラベル取得
function getLabel(code: string): string {
  const all: TagObj[] = props.categories.flatMap(c => c.tags).map(t =>
    typeof t === 'string' ? { code: t, label: t } : t
  )
  return all.find(t => t.code === code)?.label || code
}
const singleLabel = computed(() => (singleValue.value ? getLabel(singleValue.value) : undefined))

// 選択状態
function isSelected(code: string): boolean {
  return isMultiple.value ? arrayValue.value.includes(code) : singleValue.value === code
}

// トグルと選択
function toggle(code: string) {
  if (isReadOnly.value || props.disabled) return
  if (!isMultiple.value) {
    emit('update:modelValue', code)
    return
  }
  const set = new Set(arrayValue.value)
  if (set.has(code)) set.delete(code)
  else set.add(code)
  emit('update:modelValue', Array.from(set))
}

function onSelect(code: string) {
  toggle(code)
  if (!isMultiple.value) {
    // 単一選択は選択後自動で閉じる
    open.value = false
  }
}

// タグユーティリティ（string or object対応）
function tagCode(tag: Tag): string {
  return typeof tag === 'string' ? tag : tag.code
}
function tagLabel(tag: Tag): string {
  return typeof tag === 'string' ? tag : tag.label
}
function tagKey(tag: Tag): string {
  return tagCode(tag)
}
</script>

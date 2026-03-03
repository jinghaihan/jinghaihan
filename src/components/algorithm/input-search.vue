<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const valueModel = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const hasValue = computed(() => valueModel.value.length > 0)

function clearValue(): void {
  valueModel.value = ''
}
</script>

<template>
  <div class="relative">
    <i class="i-ri:search-line text-muted-foreground left-2 top-1/2 absolute -translate-y-1/2" />
    <input
      v-model="valueModel"
      type="text"
      :placeholder="placeholder"
      class="text-sm py-1.5 pl-8 pr-8 outline-none border border-border/80 rounded-md bg-transparent w-full transition-colors duration-200 placeholder:text-foreground/40 focus:border-border/55"
    >
    <button
      v-if="hasValue"
      type="button"
      aria-label="清空搜索"
      class="text-foreground/45 transition-colors duration-150 right-2 top-1/2 absolute hover:text-foreground/75 -translate-y-1/2"
      @click="clearValue"
    >
      <i class="i-ri:close-circle-fill text-sm" />
    </button>
  </div>
</template>

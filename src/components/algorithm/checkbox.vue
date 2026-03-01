<script setup lang="ts">
interface Props {
  modelValue: boolean
  id?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  id: undefined,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle(value: boolean, disabled: boolean): void {
  if (disabled)
    return
  emit('update:modelValue', !value)
}
</script>

<template>
  <button
    :id="id"
    :data-state="modelValue ? 'checked' : 'unchecked'"
    :disabled="disabled"
    :aria-checked="modelValue"
    role="checkbox"
    type="button"
    class="peer text-transparent outline-none border border-input rounded-[4px] bg-background shrink-0 size-4 shadow-xs transition-[background-color,border-color,color,box-shadow] duration-200 data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring data-[state=checked]:bg-primary disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-[3px] focus-visible:ring-ring/50"
    @click="toggle(modelValue, disabled)"
  >
    <span class="text-current grid pointer-events-none transition-none place-content-center">
      <i class="i-ri:check-line size-3.5 transition-opacity duration-120" :class="modelValue ? 'opacity-100' : 'opacity-0'" />
    </span>
  </button>
</template>

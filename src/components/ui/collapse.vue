<script setup lang="ts">
interface Props {
  open: boolean
  title?: string
  meta?: string
  dense?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  meta: '',
  dense: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function toggle(): void {
  emit('update:open', !props.open)
}
</script>

<template>
  <section>
    <div
      class="flex w-full select-none items-center"
      :class="dense ? 'px-3 py-1.5' : 'px-3 py-2'"
    >
      <button
        type="button"
        class="text-left flex flex-1 min-w-0 items-center"
        @click="toggle"
      >
        <i class="i-ri:arrow-down-s-line transition-transform duration-220" :class="open ? 'rotate-0' : '-rotate-90'" />
        <span class="ml-2 flex-1 min-w-0 truncate">
          <slot name="title">
            {{ title }}
          </slot>
        </span>
      </button>
      <span v-if="$slots.meta || meta" class="text-xs text-muted-foreground ml-2 shrink-0">
        <slot name="meta">
          {{ meta }}
        </slot>
      </span>
    </div>

    <Transition
      enter-active-class="transition-[max-height,opacity] duration-240 ease-out"
      enter-from-class="max-h-0 op0"
      enter-to-class="max-h-[960px] op100"
      leave-active-class="transition-[max-height,opacity] duration-180 ease-in"
      leave-from-class="max-h-[960px] op100"
      leave-to-class="max-h-0 op0"
    >
      <div
        v-if="open"
        class="overflow-hidden"
        :class="dense ? 'pl-4 pr-2 pb-2' : 'pl-4 pb-3'"
      >
        <slot />
      </div>
    </Transition>
  </section>
</template>

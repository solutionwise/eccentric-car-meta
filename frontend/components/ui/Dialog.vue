<template>
  <DialogRoot v-bind="$attrs">
    <slot />
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot } from 'radix-vue'

interface DialogProps {
  defaultOpen?: boolean
  open?: boolean
  modal?: boolean
}

defineProps<DialogProps>()

defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

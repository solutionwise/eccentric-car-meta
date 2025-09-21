<template>
  <SeparatorRoot
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      $attrs.class
    )"
    :orientation="orientation"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { SeparatorRoot } from 'radix-vue'
import { cn } from '~/lib/utils'

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: 'horizontal',
  decorative: true,
})
</script>

<template>
  <button
    :class="['inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', 
      variantClass, 
      sizeClass, 
      $attrs.class]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}>()

const variantClass = computed(() => {
  switch (props.variant) {
    case 'destructive':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'outline':
      return 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-900'
    case 'secondary':
      return 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    case 'ghost':
      return 'bg-transparent hover:bg-gray-100 text-gray-900'
    case 'link':
      return 'text-blue-600 underline-offset-4 hover:underline bg-transparent'
    case 'default':
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-9 rounded-md px-3'
    case 'lg':
      return 'h-11 rounded-md px-8'
    case 'icon':
      return 'h-10 w-10 p-0'
    case 'default':
    default:
      return 'h-10 px-4 py-2'
  }
})
</script>

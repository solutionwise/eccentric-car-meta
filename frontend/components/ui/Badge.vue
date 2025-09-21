<template>
  <div :class="badgeClass" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const props = defineProps<Props>()

const badgeClass = computed(() => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  
  switch (props.variant) {
    case 'secondary':
      return `${baseClasses} border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200`
    case 'destructive':
      return `${baseClasses} border-transparent bg-red-600 text-white hover:bg-red-700`
    case 'outline':
      return `${baseClasses} text-gray-900 border-gray-300`
    case 'default':
    default:
      return `${baseClasses} border-transparent bg-blue-600 text-white hover:bg-blue-700`
  }
})
</script>

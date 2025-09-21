<template>
  <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-1">
    <span
      v-for="tag in tags"
      :key="tag"
      class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-gray-100 text-gray-700"
    >
      {{ tag }}
    </span>
  </div>
  <div v-else class="text-xs text-gray-400">
    No tags
  </div>
</template>

<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})
</script>

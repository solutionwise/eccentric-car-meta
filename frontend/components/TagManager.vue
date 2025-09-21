<template>
  <div class="space-y-3">
    <!-- Tags Input Component -->
    <TagsInput
      v-model="localTags"
      placeholder="Add a tag..."
      :disabled="disabled || loading"
      @tag:add="handleTagAdd"
      @tag:remove="handleTagRemove"
      :validate-tag="validateTag"
      :max-tags="maxTags"
      duplicate-tag-behavior="prevent"
      trim
    />
    
    <!-- Loading State -->
    <div v-if="loading" class="text-sm text-gray-500">
      {{ loadingMessage }}
    </div>
    
    <!-- Error State -->
    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TagsInput from "@/components/ui/tags-input.vue"

// Props
const props = defineProps({
  imageId: {
    type: [String, Number],
    required: true
  },
  initialTags: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxTags: {
    type: Number,
    default: undefined
  }
})

// Emits
const emit = defineEmits(['tags-updated'])

// Reactive data
const localTags = ref([...props.initialTags])
const loading = ref(false)
const loadingMessage = ref('')
const error = ref('')

// API composable
const { apiCall } = useApi()

// Watch for prop changes
watch(() => props.initialTags, (newTags) => {
  localTags.value = [...newTags]
}, { deep: true })

// Tag validation function
const validateTag = (tag) => {
  if (!tag || tag.trim().length === 0) {
    return 'Tag cannot be empty'
  }
  if (tag.length > 50) {
    return 'Tag cannot be longer than 50 characters'
  }
  // Check for special characters that might cause issues
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
    return 'Tag can only contain letters, numbers, spaces, hyphens, and underscores'
  }
  return true
}

// Handle tag addition
const handleTagAdd = async (tag) => {
  if (props.disabled || loading.value) return
  
  loading.value = true
  loadingMessage.value = 'Adding tag...'
  error.value = ''
  
  try {
    const response = await apiCall(`/api/images/${props.imageId}/tags`, {
      method: 'POST',
      body: { tag }
    })
    
    localTags.value = response.tags || []
    emit('tags-updated', localTags.value)
  } catch (err) {
    error.value = err.data?.error || 'Failed to add tag'
    console.error('Add tag error:', err)
    // Revert the local change
    localTags.value = [...props.initialTags]
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}

// Handle tag removal
const handleTagRemove = async (tag, index) => {
  if (props.disabled || loading.value) return
  
  loading.value = true
  loadingMessage.value = 'Removing tag...'
  error.value = ''
  
  try {
    const response = await apiCall(`/api/images/${props.imageId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE'
    })
    
    localTags.value = response.tags || []
    emit('tags-updated', localTags.value)
  } catch (err) {
    error.value = err.data?.error || 'Failed to remove tag'
    console.error('Remove tag error:', err)
    // Revert the local change
    localTags.value = [...props.initialTags]
  } finally {
    loading.value = false
    loadingMessage.value = ''
  }
}
</script>
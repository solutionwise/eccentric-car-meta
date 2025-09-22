<template>
  <div>
    <!-- Clickable slot content -->
    <div @click="openModal" class="cursor-pointer">
      <slot />
    </div>

    <!-- Modal -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeModal"
    >
      <div 
        class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl" 
        @click.stop
      >
        <div class="flex h-full">
          <!-- Left side - Full car image -->
          <div class="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <img
              :src="file_path"
              :alt="file_name"
              class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>

          <!-- Right side - Car information -->
          <div class="w-96 bg-white p-6 overflow-y-auto">
            <!-- Header -->
            <div class="flex justify-end items-start mb-6">
              <!-- <h2 class="text-2xl font-bold text-gray-900 pr-4">{{ file_name }}</h2> -->
              <button 
                @click="closeModal" 
                class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Car Information -->
            <div class="space-y-6">
              <!-- File Information -->
              <!-- <div class="border-b border-gray-200 pb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">File Information</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Filename:</span>
                    <span class="text-gray-900 font-medium">{{ file_name }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Path:</span>
                    <span class="text-gray-900 font-mono text-xs break-all">{{ file_path }}</span>
                  </div>
                </div>
              </div> -->

              <!-- Tags Section -->
              <div class="border-b border-gray-200 pb-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                
                <!-- Editable Tags (when allowEdit is true) -->
                <div v-if="allowEdit && imageId">
                  <TagManager
                    :image-id="imageId"
                    :initial-tags="localTags"
                    @tags-updated="handleTagsUpdated"
                  />
                </div>
                
                <!-- Read-only Tags (when allowEdit is false or no imageId) -->
                <div v-else>
                  <div v-if="localTags && localTags.length > 0" class="flex flex-wrap gap-2">
                    <Badge 
                      v-for="tag in localTags" 
                      :key="tag" 
                      variant="secondary"
                      class="text-xs"
                    >
                      {{ tag }}
                    </Badge>
                  </div>
                  <p v-else class="text-gray-500 text-sm italic">No tags available</p>
                </div>
              </div>

              <!-- Additional Information -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Type:</span>
                    <span class="text-gray-900">Automotive Image</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <Badge variant="default" class="text-xs">Processed</Badge>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-4 border-t border-gray-200">
                <div class="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="downloadImage"
                    class="flex-1"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    @click="copyImageUrl"
                    class="flex-1"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Badge from '~/components/ui/badge.vue'
import Button from '~/components/ui/button.vue'
import TagManager from '~/components/TagManager.vue'

// Props
const props = defineProps({
  file_path: {
    type: String,
    required: true
  },
  file_name: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  allowEdit: {
    type: Boolean,
    default: false
  },
  imageId: {
    type: [String, Number],
    required: false
  }
})

// Reactive state
const isOpen = ref(false)
const localTags = ref([...props.tags])

// Emits
const emit = defineEmits(['tags-updated'])

// Computed
// const imageUrl = computed(() => {
//   const apiBaseUrl = useRuntimeConfig().public.apiBase
//   return `${apiBaseUrl}/uploads/${props.file_name}`
// })

// Methods
const openModal = () => {
  isOpen.value = true
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isOpen.value = false
  // Restore body scroll
  document.body.style.overflow = 'auto'
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = imageUrl.value
  link.download = props.file_name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyImageUrl = async () => {
  try {
    await navigator.clipboard.writeText(imageUrl.value)
    // You could add a toast notification here
    console.log('Image URL copied to clipboard')
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const handleTagsUpdated = (updatedTags) => {
  localTags.value = updatedTags
  emit('tags-updated', updatedTags)
}

// Watch for prop changes
watch(() => props.tags, (newTags) => {
  localTags.value = [...newTags]
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
</script>

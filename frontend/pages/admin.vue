<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Admin Panel</h1>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
            <button @click="logout" class="text-gray-600 hover:text-gray-900">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Image Management</h2>
        
        <!-- Upload Section -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 v-if="!uploading" class="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
          <div v-if="!uploading" class="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="mt-4">
                <button
                  @click="$refs.fileInput.click()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Select Images
                </button>
                <p class="mt-2 text-sm text-gray-500">or drag and drop images here (up to 100 images)</p>
              </div>
            </div>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{{ uploadedCount }} / {{ totalFiles }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
              <!-- <Progress class="h-2 rounded-full bg-blue-600 w-full" v-model="uploadProgress" /> -->
            </div> 
          </div>
        </div>

        <!-- Images List -->
        <div class="bg-white rounded-lg shadow-sm border">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900">All Images</h3>
          </div>
          <div class="p-6">
            <div v-if="images.length === 0" class="text-center py-8 text-gray-500">
              No images uploaded yet.
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div
                v-for="image in images"
                :key="image.id"
                class="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
              <div class="relative">
                <CarImageModal
                  :file_path="getImageUrl(image.filename)"
                  :file_name="image.filename"
                  :tags="image.tags || []"
                  :image-id="image.id"
                  :allow-edit="true"
                  @tags-updated="handleTagsUpdated"
                >
                  <img
                    :src="getImageUrl(image.filename)"
                    :alt="image.filename"
                    class="w-full h-48 object-cover"
                  />
                </CarImageModal>
                <div class="group">
                  <button
                    @dblclick="deleteImage(image.id)"
                    class="absolute top-2 right-2 p-1 text-red-600 border border-red-600 rounded-full hover:text-white hover:bg-red-800 transition-colors"
                    title="Double-click to delete"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                  <div
                    class="absolute right-2 top-10 z-10 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style="white-space: nowrap;"
                  >
                    Double click to delete
                  </div>
                </div>
              </div>
                <div class="p-4">
                  <h4 class="font-medium text-gray-900 truncate">{{ image.filename }}</h4>
                  <p class="text-sm text-gray-600">Uploaded: {{ new Date(image.created_at).toLocaleDateString() }}</p>
                  
                  <!-- Tag Manager -->
                  <div class="mt-3">
                    <TagManager
                      :image-id="image.id"
                      :initial-tags="image.tags || []"
                      @tags-updated="(updatedTags) => updateImageTags(image.id, updatedTags)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TagManager from '~/components/TagManager.vue'
import CarImageModal from '~/components/CarImageModal.vue'

// Reactive data
const images = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedCount = ref(0)
const totalFiles = ref(0)

// API composable
const { apiCall } = useApi()

// Methods
const loadImages = async () => {
  try {
    const response = await apiCall('/api/images')
    images.value = response.images || []
  } catch (error) {
    console.error('Error loading images:', error)
  }
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  await uploadImages(files)
}

const uploadImages = async (files) => {
  uploading.value = true
  uploadProgress.value = 0
  uploadedCount.value = 0
  totalFiles.value = files.length

  try {
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append('image', files[i])
      
      await apiCall('/api/upload', {
        method: 'POST',
        body: formData
      })

      uploadedCount.value++
      uploadProgress.value = ((i + 1) / files.length) * 100
    }

    // Reload images after upload
    await loadImages()
  } catch (error) {
    console.error('Upload error:', error)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
    uploadedCount.value = 0
    totalFiles.value = 0
  }
}

const deleteImage = async (imageId) => {
  // if (!confirm('Are you sure you want to delete this image?')) return

  try {
    await apiCall(`/api/images/${imageId}`, {
      method: 'DELETE'
    })
    await loadImages()
  } catch (error) {
    console.error('Delete error:', error)
  }
}

const updateImageTags = (imageId, updatedTags) => {
  const image = images.value.find(img => img.id === imageId)
  if (image) {
    image.tags = updatedTags
  }
}

const handleTagsUpdated = (updatedTags) => {
  // This will be called from CarImageModal when tags are updated
  // The TagManager component already handles the API calls
  console.log('Tags updated:', updatedTags)
}

const getImageUrl = (filename) => {
  const apiBaseUrl = useRuntimeConfig().public.apiBase
  return `${apiBaseUrl}/uploads/${filename}`
}

const logout = async () => {
  try {
    const { $auth } = useNuxtApp()
    $auth.removeToken()
    await navigateTo('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Check authentication and load images on mount
onMounted(async () => {
  try {
    const { $auth } = useNuxtApp()
    const token = $auth.getToken()
    
    if (!token) {
      await navigateTo('/login')
      return
    }
    
    await apiCall('/api/auth/verify')
    await loadImages()
  } catch (error) {
    await navigateTo('/login')
  }
})
</script>
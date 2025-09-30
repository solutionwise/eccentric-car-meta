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
          <h3 v-if="!uploading && !csvUploading" class="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
          
          <!-- Upload Tabs -->
          <div v-if="!uploading && !csvUploading" class="mb-6">
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8">
                <button
                  @click="uploadMode = 'images'"
                  :class="[
                    uploadMode === 'images' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  Upload Images
                </button>
                <button
                  @click="uploadMode = 'csv'"
                  :class="[
                    uploadMode === 'csv' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  ]"
                >
                  CSV Import
                </button>
              </nav>
            </div>
          </div>

          <!-- Image Upload Tab -->
          <div v-if="uploadMode === 'images' && !uploading" class="border-2 border-dashed border-gray-300 rounded-lg p-6">
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

          <!-- CSV Upload Tab -->
          <div v-if="uploadMode === 'csv' && !csvUploading" class="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              ref="csvInput"
              type="file"
              accept=".csv"
              @change="handleCsvSelect"
              class="hidden"
            />
            <div class="text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div class="mt-4">
                <button
                  @click="$refs.csvInput.click()"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Select CSV File
                </button>
                <p class="mt-2 text-sm text-gray-500">Upload a CSV file with image paths and tags</p>
              </div>
              
              <!-- CSV Format Info -->
              <div class="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                <h4 class="text-sm font-medium text-gray-900 mb-2">CSV Format:</h4>
                <p class="text-xs text-gray-600 mb-2">Required columns: <code class="bg-gray-200 px-1 rounded">image_path</code>, <code class="bg-gray-200 px-1 rounded">tags</code></p>
                <p class="text-xs text-gray-600 mb-2">Example:</p>
                <pre class="text-xs bg-white p-2 rounded border overflow-x-auto">image_path,tags
/path/to/image1.jpg,red,sedan,BMW
/path/to/image2.jpg,blue,SUV,leather</pre>
              </div>

              <!-- Auto-tagging Option -->
              <div class="mt-4 flex items-center justify-center">
                <input
                  id="enableAutoTagging"
                  v-model="enableAutoTagging"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="enableAutoTagging" class="ml-2 text-sm text-gray-700">
                  Enable Auto-tagging for untagged images
                </label>
              </div>
            </div>
          </div>
          
          <!-- Upload Progress -->
          <div v-if="uploading" class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading Images...</span>
              <span>{{ uploadedCount }} / {{ totalFiles }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
            </div> 
          </div>

          <!-- CSV Upload Progress -->
          <div v-if="csvUploading" class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Processing CSV Import...</span>
              <div class="flex items-center space-x-4">
                <span v-if="jobTotalItems > 0">{{ jobProcessedItems }} / {{ jobTotalItems }} items</span>
                <span>{{ jobProgress }}%</span>
                <span class="px-2 py-1 text-xs rounded-full" :class="{
                  'bg-yellow-100 text-yellow-800': jobStatus === 'pending',
                  'bg-blue-100 text-blue-800': jobStatus === 'running',
                  'bg-green-100 text-green-800': jobStatus === 'completed',
                  'bg-red-100 text-red-800': jobStatus === 'failed',
                  'bg-gray-100 text-gray-800': jobStatus === 'cancelled'
                }">
                  {{ jobStatus.toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full transition-all duration-300" :style="{ width: jobProgress + '%' }"></div>
            </div>
            
            <!-- Cancel Button -->
            <div v-if="jobStatus === 'running' || jobStatus === 'pending'" class="mt-2">
              <button
                @click="cancelJob"
                class="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancel Upload
              </button>
            </div>

            <!-- Job Results -->
            <div v-if="jobStatus === 'completed' || jobStatus === 'failed' || jobStatus === 'cancelled'" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">Import Results</h4>
                <button
                  @click="clearJobResults"
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              
              <!-- Summary -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-lg font-semibold text-green-600">{{ jobResults.length }}</div>
                  <div class="text-xs text-gray-600">Imported</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-yellow-600">{{ jobSkipped.length }}</div>
                  <div class="text-xs text-gray-600">Skipped</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-red-600">{{ jobErrors.length }}</div>
                  <div class="text-xs text-gray-600">Failed</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-blue-600">{{ jobTotalItems }}</div>
                  <div class="text-xs text-gray-600">Total</div>
                </div>
              </div>

              <!-- Errors -->
              <div v-if="jobErrors.length > 0" class="mt-4">
                <p class="text-sm font-medium text-red-600 mb-2">Errors ({{ jobErrors.length }}):</p>
                <div class="max-h-32 overflow-y-auto">
                  <div v-for="error in jobErrors.slice(0, 10)" :key="error.row" class="text-xs text-red-600 mb-1 p-2 bg-red-50 rounded">
                    <span class="font-medium">Row {{ error.row }}:</span> {{ error.error }}
                    <span v-if="error.reason" class="text-gray-500">({{ error.reason }})</span>
                  </div>
                  <div v-if="jobErrors.length > 10" class="text-xs text-gray-500 mt-2">
                    ... and {{ jobErrors.length - 10 }} more errors
                  </div>
                </div>
              </div>

              <!-- Skipped Items -->
              <div v-if="jobSkipped.length > 0" class="mt-4">
                <p class="text-sm font-medium text-yellow-600 mb-2">Skipped ({{ jobSkipped.length }}):</p>
                <div class="max-h-32 overflow-y-auto">
                  <div v-for="skipped in jobSkipped.slice(0, 5)" :key="skipped.row" class="text-xs text-yellow-600 mb-1 p-2 bg-yellow-50 rounded">
                    <span class="font-medium">Row {{ skipped.row }}:</span> {{ skipped.message }}
                  </div>
                  <div v-if="jobSkipped.length > 5" class="text-xs text-gray-500 mt-2">
                    ... and {{ jobSkipped.length - 5 }} more skipped items
                  </div>
                </div>
              </div>
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
                  :file_name="image.original_name"
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
                  <h4 class="font-medium text-gray-900 truncate">{{ image.original_name }}</h4>
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
import { ref, onMounted, onUnmounted } from 'vue'
import TagManager from '~/components/TagManager.vue'
import CarImageModal from '~/components/CarImageModal.vue'

// Reactive data
const images = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadedCount = ref(0)
const totalFiles = ref(0)
const uploadMode = ref('images')
const csvUploading = ref(false)
const csvProgress = ref(0)
const csvResult = ref(null)
const enableAutoTagging = ref(false)
const currentJobId = ref(null)
const jobStatus = ref('')
const jobProgress = ref(0)
const jobTotalItems = ref(0)
const jobProcessedItems = ref(0)
const jobResults = ref([])
const jobErrors = ref([])
const jobSkipped = ref([])
const progressInterval = ref(null)

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

const handleCsvSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  await uploadCsv(file)
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

const uploadCsv = async (file) => {
  csvUploading.value = true
  csvProgress.value = 0
  csvResult.value = null
  currentJobId.value = null
  jobStatus.value = ''
  jobProgress.value = 0
  jobTotalItems.value = 0
  jobProcessedItems.value = 0
  jobResults.value = []
  jobErrors.value = []
  jobSkipped.value = []

  try {
    const formData = new FormData()
    formData.append('csvFile', file)
    formData.append('enableAutoTagging', enableAutoTagging.value.toString())
    
    const response = await apiCall('/api/upload/csv-import', {
      method: 'POST',
      body: formData
    })

    // Get job ID from response
    currentJobId.value = response.jobId
    jobStatus.value = response.status || 'pending'
    
    // Start polling for progress
    startProgressPolling()

  } catch (error) {
    console.error('CSV upload error:', error)
    csvResult.value = {
      message: 'CSV import failed: ' + error.message,
      errors: []
    }
    csvUploading.value = false
  }
}

const startProgressPolling = () => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
  }
  
  progressInterval.value = setInterval(async () => {
    if (!currentJobId.value) return
    
    try {
      const response = await apiCall(`/api/upload/progress/${currentJobId.value}`)
      
      jobStatus.value = response.status
      jobProgress.value = response.progress || 0
      jobTotalItems.value = response.totalItems || 0
      jobProcessedItems.value = response.processedItems || 0
      jobResults.value = response.results || []
      jobErrors.value = response.errors || []
      jobSkipped.value = response.skipped || []
      
      // Check if job is completed
      if (response.status === 'completed' || response.status === 'failed' || response.status === 'cancelled') {
        clearInterval(progressInterval.value)
        progressInterval.value = null
        
        // Reload images after successful completion
        if (response.status === 'completed') {
          await loadImages()
        }
        
        // Keep the progress display for a few seconds to show results
        setTimeout(() => {
          csvUploading.value = false
        }, 5000)
      }
    } catch (error) {
      console.error('Error polling progress:', error)
      // Stop polling on error
      clearInterval(progressInterval.value)
      progressInterval.value = null
      csvUploading.value = false
    }
  }, 1000) // Poll every second
}

const cancelJob = async () => {
  if (!currentJobId.value) return
  
  try {
    await apiCall(`/api/upload/cancel/${currentJobId.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'User requested cancellation'
      })
    })
    
    // Stop polling
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
    
    jobStatus.value = 'cancelled'
    
    // Hide progress after a delay
    setTimeout(() => {
      csvUploading.value = false
    }, 3000)
  } catch (error) {
    console.error('Error cancelling job:', error)
  }
}

const clearJobResults = () => {
  csvUploading.value = false
  csvProgress.value = 0
  csvResult.value = null
  currentJobId.value = null
  jobStatus.value = ''
  jobProgress.value = 0
  jobTotalItems.value = 0
  jobProcessedItems.value = 0
  jobResults.value = []
  jobErrors.value = []
  jobSkipped.value = []
  
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
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

// Cleanup on unmount
onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
})
</script>
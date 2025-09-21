<template>
  <div class="min-h-screen bg-gradient-to-br from-background to-muted/20">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between">
        <div class="flex items-center space-x-2">
          <NuxtLink to="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">EC</span>
            </div>
            <span class="font-semibold">Admin Panel</span>
          </NuxtLink>
        </div>
        <div class="flex items-center space-x-2">
          <Button variant="outline" size="sm" @click="$router.push('/')">
            Back to Search
          </Button>
          <DarkModeToggle />
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div class="space-y-8">
        <!-- Toast Notifications -->
        <div class="fixed top-4 right-4 z-50 space-y-2">
          <Toast :toasts="toasts" @remove="removeToast" />
        </div>

        <!-- Header -->
        <div class="text-center space-y-4">
          <div class="space-y-2">
            <h1 class="text-4xl font-bold tracking-tight">
              Admin Panel
            </h1>
            <p class="text-xl text-muted-foreground">
              Upload and manage automotive images for the search system
            </p>
          </div>
        </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-primary rounded-full"></div>
            <div class="text-2xl font-bold">{{ stats.totalImages }}</div>
          </div>
          <p class="text-sm text-muted-foreground">Total Images</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <div class="text-2xl font-bold">{{ stats.totalSizeMB }} MB</div>
          </div>
          <p class="text-sm text-muted-foreground">Total Size</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div class="text-2xl font-bold">{{ stats.weaviateImages }}</div>
          </div>
          <p class="text-sm text-muted-foreground">Indexed Images</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div class="text-2xl font-bold">{{ stats.tagsCount }}</div>
          </div>
          <p class="text-sm text-muted-foreground">Unique Tags</p>
        </CardContent>
      </Card>
    </div>

    <!-- Upload Section -->
    <Card>
      <CardHeader>
        <h2 class="text-2xl font-semibold tracking-tight">Upload Images</h2>
        <p class="text-muted-foreground">Upload single or multiple automotive images with automatic tagging</p>
      </CardHeader>
      <CardContent class="space-y-8">
      
        <!-- Single File Upload -->
        <div class="space-y-4">
          <div class="space-y-2">
            <h3 class="text-lg font-medium">Single Image Upload</h3>
            <p class="text-sm text-muted-foreground">Upload one image with custom tags</p>
          </div>
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            ]"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />
            
            <div v-if="!selectedFile" class="space-y-4">
              <div class="text-muted-foreground">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="space-y-1">
                <p class="text-lg font-medium">Drop an image here</p>
                <p class="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button variant="outline">
                Choose File
              </Button>
            </div>

            <div v-else class="space-y-6">
              <div class="flex items-center justify-center space-x-4 p-4 bg-muted/50 rounded-lg">
                <img :src="previewUrl" alt="Preview" class="w-20 h-20 object-cover rounded-lg border" />
                <div class="text-left space-y-1">
                  <p class="font-medium">{{ selectedFile.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
              
              <!-- Tags Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  v-model="tagsInput"
                  type="text"
                  placeholder="red, sports car, convertible"
                />
                <p class="text-xs text-muted-foreground">Add custom tags to help with search and organization</p>
              </div>

              <div class="flex space-x-3 justify-center">
                <Button
                  @click="uploadSingleFile"
                  :disabled="isUploading"
                >
                  {{ isUploading ? 'Uploading...' : 'Upload' }}
                </Button>
                <Button
                  @click="clearSelection"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Multiple File Upload -->
        <div class="space-y-4">
          <div class="space-y-2">
            <h3 class="text-lg font-medium">Multiple Images Upload</h3>
            <p class="text-sm text-muted-foreground">Upload multiple images with automatic AI tagging</p>
          </div>
          <div
            @drop="handleMultipleDrop"
            @dragover.prevent
            @dragenter.prevent
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
              dragOverMultiple ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            ]"
            @click="$refs.multipleFileInput.click()"
          >
            <input
              ref="multipleFileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleMultipleFileSelect"
              class="hidden"
            />
            
            <div v-if="selectedFiles.length === 0" class="space-y-4">
              <div class="text-muted-foreground">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="space-y-1">
                <p class="text-lg font-medium">Drop multiple images here</p>
                <p class="text-sm text-muted-foreground">or click to browse</p>
              </div>
              <Button variant="outline">
                Choose Files
              </Button>
            </div>

            <div v-else class="space-y-6">
              <div class="text-left space-y-3">
                <div class="flex items-center justify-between">
                  <p class="font-medium">{{ selectedFiles.length }} files selected</p>
                  <Badge variant="secondary">{{ selectedFiles.length }} images</Badge>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                  <div v-for="(file, index) in selectedFiles" :key="index" class="relative group">
                    <img :src="getFilePreview(file)" alt="Preview" class="w-full h-20 object-cover rounded border" />
                    <button
                      @click.stop="removeFile(index)"
                      class="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex space-x-3 justify-center">
                <Button
                  @click="uploadMultipleFiles"
                  :disabled="isUploading"
                >
                  {{ isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files` }}
                </Button>
                <Button
                  @click="clearMultipleSelection"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Image Management -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Image Management</h2>
            <p class="text-muted-foreground">Manage and organize your uploaded images</p>
          </div>
          <Button
            @click="loadImages"
            variant="outline"
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        <!-- Images Grid -->
        <div v-if="images.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card
            v-for="image in images"
            :key="image.id"
            class="group hover:shadow-lg transition-all duration-200"
          >
            <CardContent class="p-4 space-y-4">
              <div class="relative overflow-hidden rounded-lg">
                <img
                  :src="getImageUrl(image)"
                  :alt="image.original_name"
                  class="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
              </div>
              
              <div class="space-y-3">
                <h3 class="font-medium truncate">
                  {{ image.original_name }}
                </h3>
                
                <!-- Tags Display -->
                <div class="flex flex-wrap gap-1 items-center">
                  <Badge
                    v-for="tag in image.tags"
                    :key="tag"
                    :variant="isTagPendingRemoval(image.id, tag) ? 'destructive' : 'secondary'"
                    class="group/tag relative cursor-pointer"
                    @click="handleTagClick(image.id, tag)"
                    :title="isTagPendingRemoval(image.id, tag) ? 'Click again to remove' : 'Click to remove tag'"
                  >
                    {{ tag }}
                    <button
                      @click.stop="removeTag(image.id, tag)"
                      class="ml-1 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </Badge>
                  
                  <!-- Add Tag Button -->
                  <Button
                    v-if="!showTagInputs[image.id]"
                    @click="showAddTagInput(image.id)"
                    variant="outline"
                    size="sm"
                    class="h-6 px-2 text-xs"
                  >
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add
                  </Button>
                </div>
                
                <!-- Tag Input (shown when plus button is clicked) -->
                <div v-if="showTagInputs[image.id]" class="space-y-2">
                  <div class="flex gap-2 items-center">
                    <Input
                      v-model="newTagInputs[image.id]"
                      @keyup.enter="addMultipleTags(image.id)"
                      @keyup.escape="cancelAddTags(image.id)"
                      type="text"
                      placeholder="Add tags (comma separated)..."
                      class="text-xs h-8"
                      ref="tagInput"
                    />
                    <Button
                      @click="addMultipleTags(image.id)"
                      size="sm"
                      :disabled="!newTagInputs[image.id] || newTagInputs[image.id].trim().length === 0"
                    >
                      Add
                    </Button>
                    <Button
                      @click="cancelAddTags(image.id)"
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end pt-2">
                  <Button
                    @click="handleImageDeleteClick(image.id)"
                    :variant="isImagePendingDeletion(image.id) ? 'destructive' : 'outline'"
                    size="sm"
                    :class="isImagePendingDeletion(image.id) ? 'animate-pulse' : ''"
                    :title="isImagePendingDeletion(image.id) ? 'Click again to confirm deletion' : 'Click to delete image'"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div v-else class="text-center py-12">
          <div class="text-muted-foreground mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-2">No images uploaded yet</h3>
          <p class="text-muted-foreground">Upload some images to get started with the automotive search system.</p>
        </div>
        </CardContent>
      </Card>

      </div>
    </main>
  </div>
</template>

<script setup>
import { nextTick } from 'vue'

// Import shadcn/ui components
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import CardHeader from '~/components/ui/CardHeader.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Input from '~/components/ui/Input.vue'
import Badge from '~/components/ui/Badge.vue'
import Toast from '~/components/ui/Toast.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'

// Protect this route with authentication
definePageMeta({
  middleware: 'auth'
})

// Reactive data
const stats = ref({
  totalImages: 0,
  totalSizeMB: '0',
  weaviateImages: 0,
  tagsCount: 0
})

const selectedFile = ref(null)
const selectedFiles = ref([])
const tagsInput = ref('')
const isUploading = ref(false)
const dragOver = ref(false)
const dragOverMultiple = ref(false)
const images = ref([])
const newTagInputs = ref({})
const showTagInputs = ref({})
const toasts = ref([])
const pendingTagRemovals = ref({})
const pendingImageDeletions = ref({})

// API configuration
const { apiCall } = useApi()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// File input refs
const fileInput = ref(null)
const multipleFileInput = ref(null)

// Computed
const previewUrl = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value)
  }
  return null
})

// Methods
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Toast notification methods
const showToast = (message, type = 'success', title = '') => {
  const id = Date.now() + Math.random()
  const toast = {
    id,
    title,
    message,
    type,
    show: true
  }
  
  toasts.value.push(toast)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index !== -1) {
    toasts.value[index].show = false
    setTimeout(() => {
      toasts.value.splice(index, 1)
    }, 300)
  }
}

// Tag removal feedback methods
const isTagPendingRemoval = (imageId, tag) => {
  const key = `${imageId}-${tag}`
  return pendingTagRemovals.value[key] || false
}

const handleTagClick = (imageId, tag) => {
  const key = `${imageId}-${tag}`
  
  if (pendingTagRemovals.value[key]) {
    // Second click - proceed with removal
    removeTag(imageId, tag)
    delete pendingTagRemovals.value[key]
  } else {
    // First click - mark as pending removal
    pendingTagRemovals.value[key] = true
    
    // Auto-clear pending state after 3 seconds
    setTimeout(() => {
      if (pendingTagRemovals.value[key]) {
        delete pendingTagRemovals.value[key]
      }
    }, 3000)
  }
}

// Image deletion feedback methods
const isImagePendingDeletion = (imageId) => {
  return pendingImageDeletions.value[imageId] || false
}

const handleImageDeleteClick = (imageId) => {
  if (pendingImageDeletions.value[imageId]) {
    // Second click - proceed with deletion
    deleteImage(imageId)
    delete pendingImageDeletions.value[imageId]
  } else {
    // First click - mark as pending deletion
    pendingImageDeletions.value[imageId] = true
    
    // Auto-clear pending state after 5 seconds
    setTimeout(() => {
      if (pendingImageDeletions.value[imageId]) {
        delete pendingImageDeletions.value[imageId]
      }
    }, 5000)
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  dragOver.value = false
  
  const files = e.dataTransfer.files
  if (files.length > 0) {
    selectedFile.value = files[0]
  }
}

const handleMultipleDrop = (e) => {
  e.preventDefault()
  dragOverMultiple.value = false
  
  const files = Array.from(e.dataTransfer.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleMultipleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  selectedFiles.value = [...selectedFiles.value, ...files]
}

const getFilePreview = (file) => {
  return URL.createObjectURL(file)
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const clearSelection = () => {
  selectedFile.value = null
  tagsInput.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const clearMultipleSelection = () => {
  selectedFiles.value = []
  if (multipleFileInput.value) {
    multipleFileInput.value.value = ''
  }
}

const uploadSingleFile = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('image', selectedFile.value)
  formData.append('tags', JSON.stringify(tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag)))

  try {
    const response = await apiCall(`${apiBase}/upload/single`, {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      showToast('Image uploaded successfully!', 'success')
      clearSelection()
      loadStats()
      loadImages()
    }
  } catch (error) {
    console.error('Upload error:', error)
    showToast('Upload failed. Please try again.', 'error')
  } finally {
    isUploading.value = false
  }
}

const uploadMultipleFiles = async () => {
  if (selectedFiles.value.length === 0) return

  isUploading.value = true
  showToast(`Uploading ${selectedFiles.value.length} images...`, 'info')
  
  const formData = new FormData()
  selectedFiles.value.forEach((file, index) => {
    formData.append('images', file)
  })

  try {
    const response = await apiCall(`${apiBase}/upload/multiple`, {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      showToast(`Successfully uploaded ${response.uploaded} images!`, 'success')
      clearMultipleSelection()
      loadStats()
      loadImages()
    }
  } catch (error) {
    console.error('Upload error:', error)
    showToast('Upload failed. Please try again.', 'error')
  } finally {
    isUploading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await apiCall(`${apiBase}/images/stats/overview`)
    stats.value = response
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadImages = async () => {
  try {
    console.log('Loading images from:', `${apiBase}/images?limit=20`)
    const response = await apiCall(`${apiBase}/images?limit=20`)
    console.log('Images response:', response)
    images.value = response.images || []
    console.log('Images loaded:', images.value.length)
  } catch (error) {
    console.error('Error loading images:', error)
  }
}

const getImageUrl = (image) => {
  console.log('apiBase:', apiBase)
  console.log('image object:', image)
  const url = `${apiBase.replace('/api', '')}/uploads/${image.filename}`
  console.log('Generated image URL:', url)
  return url
}

const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src)
  console.error('Error details:', event)
  event.target.src = '/placeholder-image.svg'
}

const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src)
}

const editImage = (image) => {
  // TODO: Implement image editing modal
  showToast('Edit functionality coming soon!', 'success')
}

const deleteImage = async (id) => {
  try {
    const response = await apiCall(`${apiBase}/images/${id}`, {
      method: 'DELETE'
    })

    if (response.success) {
      // Remove image from local array immediately
      const imageIndex = images.value.findIndex(img => img.id === id)
      if (imageIndex !== -1) {
        images.value.splice(imageIndex, 1)
      }
      
      // Clear any pending deletion state
      delete pendingImageDeletions.value[id]
      
      showToast('Image deleted successfully!', 'success')
      loadStats()
    }
  } catch (error) {
    console.error('Delete error:', error)
    // Clear pending state on error
    delete pendingImageDeletions.value[id]
    showToast('Delete failed. Please try again.', 'error')
  }
}

const addTag = async (imageId) => {
  const tag = newTagInputs.value[imageId]?.trim()
  if (!tag) return

  try {
    const response = await apiCall(`${apiBase}/images/${imageId}/tags`, {
      method: 'POST',
      body: { tag }
    })

    if (response.success) {
      // Update the image in the local array
      const imageIndex = images.value.findIndex(img => img.id === imageId)
      if (imageIndex !== -1) {
        images.value[imageIndex].tags = response.tags
      }
      
      // Clear the input
      newTagInputs.value[imageId] = ''
      
      // Show success message
      showToast('Tag added successfully!', 'success')
    }
  } catch (error) {
    console.error('Add tag error:', error)
    showToast(error.data?.error || 'Failed to add tag. Please try again.', 'error')
  }
}

const addMultipleTags = async (imageId) => {
  const tagsInput = newTagInputs.value[imageId]?.trim()
  if (!tagsInput) return

  // Split by comma and clean up tags
  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  if (tags.length === 0) return

  try {
    // Add tags one by one to handle duplicates gracefully
    let addedCount = 0
    let duplicateCount = 0

    for (const tag of tags) {
      try {
        const response = await apiCall(`${apiBase}/images/${imageId}/tags`, {
          method: 'POST',
          body: { tag }
        })
        
        if (response.success) {
          addedCount++
          // Update the image in the local array
          const imageIndex = images.value.findIndex(img => img.id === imageId)
          if (imageIndex !== -1) {
            images.value[imageIndex].tags = response.tags
          }
        }
      } catch (error) {
        if (error.data?.error?.includes('already exists')) {
          duplicateCount++
        } else {
          console.error('Add tag error:', error)
        }
      }
    }

    // Clear the input and hide the input field
    newTagInputs.value[imageId] = ''
    showTagInputs.value[imageId] = false

    // Show success message
    let message = `Successfully added ${addedCount} tag${addedCount !== 1 ? 's' : ''}`
    if (duplicateCount > 0) {
      message += ` (${duplicateCount} duplicate${duplicateCount !== 1 ? 's' : ''} skipped)`
    }
    showToast(message, 'success')

  } catch (error) {
    console.error('Add multiple tags error:', error)
    showToast('Failed to add some tags. Please try again.', 'error')
  }
}

const cancelAddTags = (imageId) => {
  newTagInputs.value[imageId] = ''
  showTagInputs.value[imageId] = false
}

const showAddTagInput = async (imageId) => {
  showTagInputs.value[imageId] = true
  newTagInputs.value[imageId] = ''
  
  // Focus the input field after the DOM updates
  await nextTick()
  const input = document.querySelector(`input[placeholder="Add tags (comma separated)..."]`)
  if (input) {
    input.focus()
  }
}

const removeTag = async (imageId, tag) => {
  const key = `${imageId}-${tag}`
  
  try {
    const response = await apiCall(`${apiBase}/images/${imageId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE'
    })

    if (response.success) {
      // Update the image in the local array
      const imageIndex = images.value.findIndex(img => img.id === imageId)
      if (imageIndex !== -1) {
        images.value[imageIndex].tags = response.tags
      }
      
      // Clear pending state
      delete pendingTagRemovals.value[key]
      
      // Show success message
      showToast('Tag removed successfully!', 'success')
    }
  } catch (error) {
    console.error('Remove tag error:', error)
    // Clear pending state on error
    delete pendingTagRemovals.value[key]
    showToast(error.data?.error || 'Failed to remove tag. Please try again.', 'error')
  }
}


// Drag and drop event handlers
const handleDragEnter = () => {
  dragOver.value = true
}

const handleDragLeave = () => {
  dragOver.value = false
}

const handleDragEnterMultiple = () => {
  dragOverMultiple.value = true
}

const handleDragLeaveMultiple = () => {
  dragOverMultiple.value = false
}

// Load data on mount
onMounted(() => {
  loadStats()
  loadImages()
})
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Eccentric Car Meta</h1>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin">
              <Button variant="ghost">Admin</Button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search Section -->
      <div class="mb-8">
        <div class="max-w-2xl mx-auto">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Search Images</h2>
          <div class="flex space-x-4">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="e.g., red sports car, vintage convertible, luxury sedan..."
              class="flex-1"
              @keyup.enter="searchImages"
            />
            <Button
              @click="searchImages"
              :disabled="loading || !searchQuery.trim()"
            >
              {{ loading ? 'Searching...' : 'Search' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Search Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div v-if="results.length > 0" class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <CarImageModal
            v-for="result in results"
            :key="result.id"
            :file_path="getImageUrl(result.filename)"
            :file_name="result.filename"
            :tags="result.tags || []"
            :image-id="result.id"
            :allow-edit="false"
          >
            <Card class="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
              <img
                :src="getImageUrl(result.filename)"
                :alt="result.filename"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <h4 class="font-medium text-foreground truncate">{{ result.filename }}</h4>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-sm text-muted-foreground">Similarity:</p>
                  <Badge variant="secondary">{{ (result.similarity * 100).toFixed(1) }}%</Badge>
                </div>
                
                <!-- Tags Display -->
                <div class="mt-3">
                  <TagDisplay :tags="result.tags || []" />
                </div>
              </div>
            </Card>
          </CarImageModal>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!loading && results.length === 0 && hasSearched && !error" class="text-center py-12">
        <p class="text-gray-500">No images found matching your search.</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CarImageModal from '~/components/CarImageModal.vue'
import TagDisplay from '~/components/TagDisplay.vue'
import Button from '~/components/ui/button.vue'
import Input from '~/components/ui/input.vue'
import Badge from '~/components/ui/badge.vue'
import Card from '~/components/ui/card.vue'

// Reactive data
const searchQuery = ref('')
const results = ref([])
const loading = ref(false)
const hasSearched = ref(false)
const error = ref('')

// API composable
const { apiCall } = useApi()

// Methods
const searchImages = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  hasSearched.value = true
  error.value = ''
  
  try {
    const response = await apiCall('/api/search', {
      method: 'POST',
      body: {
        query: searchQuery.value,
        limit: 20,
        minSimilarity: 0.3
      }
    })
    results.value = response.results || []
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.data?.error || 'Failed to search images. Please try again.'
    results.value = []
  } finally {
    loading.value = false
  }
}

const getImageUrl = (filename) => {
  const apiBaseUrl = useRuntimeConfig().public.apiBase
  return `${apiBaseUrl}/uploads/${filename}`
}

// Page is accessible without authentication for search functionality
onMounted(async () => {
  // No authentication check needed - search is now public
})
</script>

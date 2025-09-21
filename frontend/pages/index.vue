<template>
  <div class="min-h-screen bg-gradient-to-br from-background to-muted/20">
    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-sm">EC</span>
          </div>
          <h1 class="font-semibold">Eccentric Car Meta</h1>
        </div>
        <DarkModeToggle />
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <div class="space-y-12">
        <!-- Hero Section -->
        <div class="text-center space-y-6">
          <div class="space-y-4">
            <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Find Your Perfect Car
            </h1>
            <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Search through automotive images using natural language. Describe what you're looking for and find it instantly with AI-powered search.
            </p>
          </div>
        </div>

        <!-- Search Interface -->
        <SearchInterface
          v-model="searchQuery"
          :is-searching="isSearching"
          @search="performSearch"
        />

        <!-- Search Results -->
        <SearchResults
          :results="searchResults"
          :enhanced-query="enhancedQuery"
          :original-query="searchQuery"
          :has-searched="hasSearched"
          :is-loading="isSearching"
          @image-click="openImageModal"
          @example-search="handleExampleSearch"
        />

        <!-- Image Modal -->
        <ImageModal
          v-if="selectedImage"
          :image="selectedImage"
          @close="closeImageModal"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Import components
import SearchInterface from '~/components/SearchInterface.vue'
import SearchResults from '~/components/SearchResults.vue'
import ImageModal from '~/components/ImageModal.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const enhancedQuery = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const selectedImage = ref(null)

// API configuration
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Perform search
const performSearch = async (query: string) => {
  if (!query.trim() || isSearching.value) return

  isSearching.value = true
  hasSearched.value = true

  try {
    const response = await $fetch(`${apiBase}/search`, {
      method: 'POST',
      body: {
        query: query.trim(),
        limit: 20
      }
    })

    searchResults.value = response.results || []
    enhancedQuery.value = response.enhancedQuery || ''
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
    enhancedQuery.value = ''
    
    // Show error message
    alert('Search failed. Please try again.')
  } finally {
    isSearching.value = false
  }
}

// Handle example search
const handleExampleSearch = (query: string) => {
  searchQuery.value = query
  performSearch(query)
}

// Open image modal
const openImageModal = (image: any) => {
  selectedImage.value = image
}

// Close image modal
const closeImageModal = () => {
  selectedImage.value = null
}

// SEO
useHead({
  title: 'Eccentric Car Meta - AI-Powered Automotive Search',
  meta: [
    {
      name: 'description',
      content: 'Search through automotive images using natural language with our AI-powered platform. Find cars by description, features, and visual characteristics.'
    }
  ]
})
</script>

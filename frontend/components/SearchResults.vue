<template>
  <div v-if="results.length > 0" class="space-y-8">
    <!-- Results Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight">
          Search Results
        </h2>
        <p class="text-muted-foreground">
          {{ results.length }} result{{ results.length !== 1 ? 's' : '' }} found
        </p>
      </div>
    </div>

    <!-- Enhanced Query Display -->
    <Card v-if="enhancedQuery && enhancedQuery !== originalQuery" class="border-primary/20 bg-primary/5">
      <CardContent class="p-4">
        <div class="text-sm">
          <span class="font-medium text-primary">Enhanced search:</span>
          <span class="text-primary/80 ml-2">"{{ enhancedQuery }}"</span>
        </div>
      </CardContent>
    </Card>

    <!-- Results Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card
        v-for="(result, index) in results"
        :key="result.id || result.weaviateId"
        @click="$emit('image-click', result)"
        class="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 zoom-in-95"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <CardContent class="p-0">
          <div class="relative overflow-hidden rounded-t-lg">
            <img
              :src="getImageUrl(result)"
              :alt="result.originalName"
              @error="handleImageError"
              loading="lazy"
              class="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <!-- Similarity Badge -->
            <Badge
              v-if="result.similarity"
              class="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground border"
            >
              {{ Math.round(result.similarity * 100) }}% match
            </Badge>
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
              >
                <Eye class="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
          
          <div class="p-4 space-y-3">
            <h3 class="font-medium truncate group-hover:text-primary transition-colors">
              {{ result.originalName }}
            </h3>
            
            <!-- Tags -->
            <div v-if="result.tags && result.tags.length > 0" class="flex flex-wrap gap-1">
              <Badge
                v-for="tag in result.tags.slice(0, 3)"
                :key="tag"
                variant="secondary"
                class="text-xs"
              >
                {{ tag }}
              </Badge>
              <Badge
                v-if="result.tags.length > 3"
                variant="outline"
                class="text-xs"
              >
                +{{ result.tags.length - 3 }} more
              </Badge>
            </div>

            <!-- Metadata -->
            <div v-if="result.metadata" class="flex items-center justify-between text-xs text-muted-foreground">
              <span>{{ result.metadata.width }}×{{ result.metadata.height }}</span>
              <span>{{ formatFileSize(result.metadata.fileSize) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- No Results State -->
  <Card v-else-if="hasSearched && !isLoading" class="max-w-2xl mx-auto">
    <CardContent class="text-center py-12">
      <div class="text-muted-foreground mb-6">
        <Search class="w-16 h-16 mx-auto" />
      </div>
      <h3 class="text-xl font-semibold mb-2">No results found</h3>
      <p class="text-muted-foreground mb-6">
        Try different keywords or check the admin panel to upload more images.
      </p>
      <div class="text-sm text-muted-foreground">
        <p class="font-medium mb-3">Example searches:</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-left max-w-md mx-auto">
          <Badge variant="outline" class="justify-start cursor-pointer hover:bg-accent" @click="$emit('example-search', 'red sports car')">"red sports car"</Badge>
          <Badge variant="outline" class="justify-start cursor-pointer hover:bg-accent" @click="$emit('example-search', 'luxury black sedan')">"luxury black sedan"</Badge>
          <Badge variant="outline" class="justify-start cursor-pointer hover:bg-accent" @click="$emit('example-search', 'family SUV with sunroof')">"family SUV with sunroof"</Badge>
          <Badge variant="outline" class="justify-start cursor-pointer hover:bg-accent" @click="$emit('example-search', 'BMW convertible')">"BMW convertible"</Badge>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Loading State -->
  <Card v-if="isLoading" class="max-w-md mx-auto">
    <CardContent class="text-center py-12">
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-muted-foreground">Searching through images...</p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Search, Eye } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'

// Props
interface Props {
  results: any[]
  enhancedQuery?: string
  originalQuery?: string
  hasSearched?: boolean
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  results: () => [],
  enhancedQuery: '',
  originalQuery: '',
  hasSearched: false,
  isLoading: false,
})

// Emits
defineEmits<{
  'image-click': [image: any]
  'example-search': [query: string]
}>()

// API configuration
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Methods
const getImageUrl = (result: any) => {
  if (result.filePath) {
    return `${apiBase.replace('/api', '')}/uploads/${result.filename}`
  }
  return '/placeholder-image.jpg'
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/placeholder-image.jpg'
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return 'Unknown'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

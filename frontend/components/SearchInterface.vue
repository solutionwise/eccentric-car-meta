<template>
  <Card class="max-w-3xl mx-auto search-interface">
    <CardContent class="p-8">
      <div class="space-y-6">
        <!-- Search Input with suggestions -->
        <div class="relative">
          <div class="relative">
            <Input
              v-model="searchQuery"
              @keyup.enter="performSearch"
              @input="onSearchInput"
              @focus="showSuggestions = true"
              type="text"
              placeholder="Try: 'red sports car with sunroof' or 'luxury black sedan'"
              class="text-lg pr-12 h-14"
              :disabled="isSearching"
            />
            <Button
              @click="performSearch"
              :disabled="!searchQuery.trim() || isSearching"
              size="icon"
              class="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Search v-if="!isSearching" class="w-5 h-5" />
              <div v-else class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            </Button>
          </div>

          <!-- Search Suggestions -->
          <Card 
            v-if="showSuggestions && suggestions.length > 0" 
            class="absolute top-full left-0 right-0 mt-2 z-10 max-h-60 overflow-y-auto border-muted"
          >
            <CardContent class="p-0">
              <div
                v-for="(suggestion, index) in suggestions"
                :key="suggestion"
                @click="selectSuggestion(suggestion)"
                @mouseenter="highlightedIndex = index"
                :class="cn(
                  'px-4 py-2 cursor-pointer border-b last:border-b-0 transition-colors',
                  highlightedIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                )"
              >
                <div class="flex items-center space-x-2">
                  <Clock class="w-4 h-4 text-muted-foreground" />
                  <span>{{ suggestion }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Quick Search Tags -->
        <div class="space-y-3">
          <p class="text-sm text-muted-foreground">Quick searches:</p>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="tag in quickSearchTags"
              :key="tag"
              variant="outline"
              class="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              @click="selectQuickSearch(tag)"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>

        <!-- Search Button -->
        <div class="text-center">
          <Button
            @click="performSearch"
            :disabled="!searchQuery.trim() || isSearching"
            size="lg"
            class="px-8"
          >
            <Search class="w-4 h-4 mr-2" />
            {{ isSearching ? 'Searching...' : 'Search Images' }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Search, Clock } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Input from '~/components/ui/Input.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'

// Props
interface Props {
  modelValue?: string
  isSearching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  isSearching: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [query: string]
}>()

// Reactive data
const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const suggestions = ref<string[]>([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)

// Quick search tags
const quickSearchTags = [
  'red sports car',
  'luxury black sedan',
  'family SUV',
  'BMW convertible',
  'white pickup truck',
  'vintage classic car'
]

// API configuration
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Methods
const onSearchInput = async () => {
  if (searchQuery.value.length < 2) {
    showSuggestions.value = false
    return
  }

  try {
    const response = await $fetch(`${apiBase}/search/suggestions?q=${encodeURIComponent(searchQuery.value)}`)
    suggestions.value = response.suggestions || []
    showSuggestions.value = suggestions.value.length > 0
    highlightedIndex.value = -1
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    showSuggestions.value = false
  }
}

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  performSearch()
}

const selectQuickSearch = (tag: string) => {
  searchQuery.value = tag
  performSearch()
}

const performSearch = () => {
  if (!searchQuery.value.trim() || props.isSearching) return
  
  showSuggestions.value = false
  emit('search', searchQuery.value.trim())
}

// Keyboard navigation for suggestions
const handleKeyDown = (e: KeyboardEvent) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectSuggestion(suggestions.value[highlightedIndex.value])
      } else {
        performSearch()
      }
      break
    case 'Escape':
      showSuggestions.value = false
      highlightedIndex.value = -1
      break
  }
}

// Hide suggestions when clicking outside
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', (e) => {
    if (!e.target?.closest('.search-interface')) {
      showSuggestions.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

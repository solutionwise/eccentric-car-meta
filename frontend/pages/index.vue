<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Eccentric Car Meta</h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink to="/admin">
              <Button variant="ghost" class="hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Admin
              </Button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Search Section -->
      <div class="mb-12">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
            Discover Amazing Cars
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Search through our collection using natural language. Find cars by color, style, brand, or any description you can imagine.
          </p>
        </div>

        <!-- Advanced Search Interface -->
        <div class="max-w-4xl mx-auto">
          <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <!-- Main Search Bar -->
            <div class="relative mb-6">
              <div class="flex items-center space-x-4">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <Input
                    v-model="searchQuery"
                    type="text"
                    placeholder="e.g., red sports car, vintage convertible, luxury sedan, blue BMW..."
                    class="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/80 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    @keyup.enter="searchImages"
                    @input="handleSearchInput"
                    ref="searchInput"
                    :disabled="loading"
                  />
                  <!-- Search suggestions dropdown -->
                  <div v-if="showSuggestions && suggestions.length > 0 && !loading" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    <div v-for="(suggestion, index) in suggestions" :key="index" 
                         @click="selectSuggestion(suggestion)"
                         class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                      <div class="flex items-center space-x-3">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <span class="text-gray-700">{{ suggestion }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  @click="searchImages"
                  :disabled="loading || !searchQuery.trim()"
                  class="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  {{ loading ? 'Searching...' : 'Search' }}
                </Button>
              </div>
            </div>

            <!-- Advanced Filters -->
            <!-- <div class="border-t border-gray-200 pt-6"> -->
              <!-- <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                <button @click="showAdvancedFilters = !showAdvancedFilters" 
                        class="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                  <span>{{ showAdvancedFilters ? 'Hide' : 'Show' }} Filters</span>
                  <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showAdvancedFilters }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div> -->
              
              <!-- <div v-if="showAdvancedFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4"> -->
                <!-- Similarity Threshold -->
                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Similarity Threshold</label>
                  <div class="flex items-center space-x-3">
                    <input 
                      v-model="filters.minSimilarity" 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.1" 
                      class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span class="text-sm font-medium text-gray-600 w-12">{{ (filters.minSimilarity * 100).toFixed(0) }}%</span>
                  </div> -->
                <!-- </div> -->

                <!-- Tag Filter -->
                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <div class="relative">
                    <input 
                      v-model="tagFilter" 
                      type="text" 
                      placeholder="Enter tag name..."
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      @input="filterTags"
                    />
                    <div v-if="filteredTags.length > 0" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-40 overflow-y-auto">
                      <div v-for="tag in filteredTags" :key="tag" 
                           @click="toggleTagFilter(tag)"
                           class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                        {{ tag }}
                      </div>
                    </div>
                  </div>
                </div> -->

                <!-- Sort Options -->
                <!-- <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Sort Results</label>
                  <select v-model="filters.sortBy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="similarity">By Similarity</option>
                    <option value="date">By Date</option>
                    <option value="filename">By Filename</option>
                  </select>
                </div> -->
              <!-- </div> -->

              <!-- Selected Tag Filters -->
              <!-- <div v-if="selectedTagFilters.length > 0" class="mt-4">
                <div class="flex flex-wrap gap-2">
                  <span class="text-sm text-gray-600">Active filters:</span>
                  <div v-for="tag in selectedTagFilters" :key="tag" 
                       class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {{ tag }}
                    <button @click="removeTagFilter(tag)" class="ml-2 text-blue-600 hover:text-blue-800">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div> -->
            <!-- </div> -->

            <!-- Recent Searches -->
            <div v-if="recentSearches.length > 0" class="mt-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Recent Searches</h4>
              <div class="flex flex-wrap gap-2">
                <button v-for="(search, index) in recentSearches.slice(0, 5)" :key="index"
                        @click="selectRecentSearch(search)"
                        class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors">
                  {{ search }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Loader Overlay -->
      <div v-if="loading" class="mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 max-w-2xl mx-auto text-center">
          <div class="flex flex-col items-center space-y-4">
            <div class="relative">
              <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Searching for images...</h3>
              <p class="text-gray-600">Finding the best matches for "{{ searchQuery }}"</p>
            </div>
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
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-gray-900">Search Results</h3>
            <p class="text-gray-600 mt-1">{{ results.length }} image{{ results.length !== 1 ? 's' : '' }} found</p>
          </div>
          <div class="flex items-center space-x-4">
            <!-- View Toggle -->
            <div class="flex items-center bg-gray-100 rounded-lg p-1">
              <button @click="viewMode = 'grid'" 
                      :class="['px-3 py-1 rounded-md text-sm font-medium transition-colors', 
                              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
              </button>
              <button @click="viewMode = 'list'" 
                      :class="['px-3 py-1 rounded-md text-sm font-medium transition-colors', 
                              viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <CarImageModal
            v-for="result in sortedResults"
            :key="result.id"
            :file_path="getImageUrl(result.filename)"
            :file_name="result.filename"
            :tags="result.tags || []"
            :image-id="result.id"
            :allow-edit="false"
          >
            <Card class="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm border border-white/20">
              <div class="relative">
                <img
                  :src="getImageUrl(result.filename)"
                  :alt="result.filename"
                  class="w-full h-48 object-cover"
                />
                <!-- Similarity Badge -->
                <div class="absolute top-3 right-3">
                  <div class="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
                       :class="getSimilarityColor(result.similarity)">
                    {{ (result.similarity * 100).toFixed(0) }}%
                  </div>
                </div>
              </div>
              <div class="p-4">
                <!-- <h4 class="font-semibold text-gray-900 truncate mb-2">{{ result.filename }}</h4> -->
                
                <!-- Tags Display -->
                <div class="mb-3">
                  <TagDisplay :tags="result.tags || []" />
                </div>

                <!-- Metadata -->
                <div class="text-xs text-gray-500">
                  <div class="flex items-center justify-between">
                    <!-- <span>{{ new Date(result.created_at).toLocaleDateString() }}</span> -->
                    <span class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      {{ result.tags?.length || 0 }} tags
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </CarImageModal>
        </div>

        <!-- List View -->
        <div v-else class="space-y-4">
          <div v-for="result in sortedResults" :key="result.id" 
               class="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:shadow-lg transition-all duration-200">
            <div class="flex items-center space-x-4">
              <div class="relative flex-shrink-0">
                <img
                  :src="getImageUrl(result.filename)"
                  :alt="result.filename"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <div class="absolute -top-2 -right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold"
                     :class="getSimilarityColor(result.similarity)">
                  {{ (result.similarity * 100).toFixed(0) }}%
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-lg font-semibold text-gray-900 truncate">{{ result.filename }}</h4>
                <div class="mt-2">
                  <TagDisplay :tags="result.tags || []" />
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  Uploaded {{ new Date(result.created_at).toLocaleDateString() }} • {{ result.tags?.length || 0 }} tags
                </div>
              </div>
              <div class="flex-shrink-0">
                <CarImageModal
                  :file_path="getImageUrl(result.filename)"
                  :file_name="result.filename"
                  :tags="result.tags || []"
                  :image-id="result.id"
                  :allow-edit="false"
                >
                  <Button variant="outline" size="sm">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View
                  </Button>
                </CarImageModal>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination/Load More -->
        <div v-if="results.length > 0" class="mt-8 flex justify-center">
          <div v-if="hasMoreResults" class="text-center">
            <Button 
              @click="loadMoreResults" 
              :disabled="loadingMore"
              variant="outline" 
              size="lg"
              class="px-8 py-3"
            >
              <svg v-if="loadingMore" class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
              {{ loadingMore ? 'Loading more...' : 'Load More Results' }}
            </Button>
            <p class="text-sm text-gray-500 mt-2">
              Showing {{ results.length }} of {{ totalPages * resultsPerPage }} results
            </p>
          </div>
          <div v-else class="text-center">
            <p class="text-gray-500">You've reached the end of the results</p>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!loading && results.length === 0 && hasSearched && !error" class="text-center py-16">
        <div class="max-w-lg mx-auto">
          <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3">No Results Found</h3>
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <p class="text-gray-700 font-medium">Search query:</p>
            <p class="text-lg text-gray-900 font-semibold mt-1">"{{ searchQuery }}"</p>
          </div>
          <p class="text-gray-600 mb-6">We couldn't find any images matching your search. Try adjusting your search terms or filters.</p>
          <div class="space-y-3">
            <p class="text-sm font-medium text-gray-700">Suggestions to improve your search:</p>
            <ul class="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Try different keywords or synonyms
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Use more general terms (e.g., "car" instead of "red sports car")
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                Check your spelling and try again
              </li>
              <li class="flex items-start">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                Browse recent searches for inspiration
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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
const showAdvancedFilters = ref(false)
const viewMode = ref('grid')
const showSuggestions = ref(false)
const suggestions = ref([])
const recentSearches = ref([])
const allTags = ref([])
const tagFilter = ref('')
const filteredTags = ref([])
const selectedTagFilters = ref([])

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const hasMoreResults = ref(false)
const loadingMore = ref(false)
const resultsPerPage = ref(20)

// Search filters
const filters = ref({
  minSimilarity: 0.3,
  sortBy: 'similarity'
})

// Refs
const searchInput = ref(null)

// API composable
const { apiCall } = useApi()

// Computed properties
const sortedResults = computed(() => {
  if (!results.value.length) return []
  
  let sorted = [...results.value]
  
  switch (filters.value.sortBy) {
    case 'similarity':
      sorted.sort((a, b) => b.similarity - a.similarity)
      break
    case 'date':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      break
    case 'filename':
      sorted.sort((a, b) => a.filename.localeCompare(b.filename))
      break
  }
  
  return sorted
})

// Methods
const searchImages = async (page = 1, append = false) => {
  if (!searchQuery.value.trim()) return
  
  if (page === 1) {
    loading.value = true
    hasSearched.value = true
    error.value = ''
    showSuggestions.value = false
    currentPage.value = 1
    results.value = []
  } else {
    loadingMore.value = true
  }
  
  // Add to recent searches only for new searches
  if (page === 1) {
    addToRecentSearches(searchQuery.value)
  }
  
  try {
    const searchBody = {
      query: searchQuery.value,
      limit: resultsPerPage.value,
      offset: (page - 1) * resultsPerPage.value,
      minSimilarity: filters.value.minSimilarity
    }
    
    // Add tag filters if any
    if (selectedTagFilters.value.length > 0) {
      searchBody.tags = selectedTagFilters.value
    }
    
    const response = await apiCall('/api/search', {
      method: 'POST',
      body: searchBody
    })
    
    const newResults = response.results || []
    const totalResults = response.total || newResults.length
    
    if (append) {
      results.value = [...results.value, ...newResults]
    } else {
      results.value = newResults
    }
    
    currentPage.value = page
    totalPages.value = Math.ceil(totalResults / resultsPerPage.value)
    hasMoreResults.value = page < totalPages.value
    
  } catch (err) {
    console.error('Search error:', err)
    error.value = err.data?.error || 'Failed to search images. Please try again.'
    if (!append) {
      results.value = []
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreResults = async () => {
  if (hasMoreResults.value && !loadingMore.value) {
    await searchImages(currentPage.value + 1, true)
  }
}

const handleSearchInput = () => {
  if (searchQuery.value.length > 2) {
    generateSuggestions()
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

const generateSuggestions = () => {
  const query = searchQuery.value.toLowerCase()
  const commonSearches = [
    'red sports car',
    'vintage convertible',
    'luxury sedan',
    'blue BMW',
    'black Mercedes',
    'white Tesla',
    'yellow Ferrari',
    'green Porsche',
    'classic muscle car',
    'modern SUV',
    'electric vehicle',
    'racing car',
    'convertible top',
    'leather interior',
    'chrome wheels'
  ]
  
  suggestions.value = commonSearches
    .filter(search => search.includes(query) && search !== query)
    .slice(0, 5)
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  showSuggestions.value = false
  searchImages()
}

const addToRecentSearches = (search) => {
  if (!search.trim()) return
  
  // Remove if already exists
  recentSearches.value = recentSearches.value.filter(s => s !== search)
  
  // Add to beginning
  recentSearches.value.unshift(search)
  
  // Keep only last 10
  recentSearches.value = recentSearches.value.slice(0, 10)
  
  // Save to localStorage
  if (process.client) {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
  }
}

const selectRecentSearch = (search) => {
  searchQuery.value = search
  searchImages()
}

const filterTags = () => {
  if (!tagFilter.value.trim()) {
    filteredTags.value = []
    return
  }
  
  const query = tagFilter.value.toLowerCase()
  filteredTags.value = allTags.value
    .filter(tag => tag.toLowerCase().includes(query))
    .slice(0, 10)
}

const toggleTagFilter = (tag) => {
  if (selectedTagFilters.value.includes(tag)) {
    removeTagFilter(tag)
  } else {
    selectedTagFilters.value.push(tag)
  }
  tagFilter.value = ''
  filteredTags.value = []
}

const removeTagFilter = (tag) => {
  selectedTagFilters.value = selectedTagFilters.value.filter(t => t !== tag)
}

const getSimilarityColor = (similarity) => {
  if (similarity >= 0.8) return 'text-green-600'
  if (similarity >= 0.6) return 'text-yellow-600'
  return 'text-red-600'
}

const getImageUrl = (filename) => {
  const apiBaseUrl = useRuntimeConfig().public.apiBase
  return `${apiBaseUrl}/uploads/${filename}`
}

const loadAllTags = async () => {
  try {
    const response = await apiCall('/api/tags')
    allTags.value = response.tags || []
  } catch (error) {
    console.error('Error loading tags:', error)
  }
}

const loadRecentSearches = () => {
  if (process.client) {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        recentSearches.value = JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing recent searches:', error)
      }
    }
  }
}

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Ctrl/Cmd + K to focus search
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
  
  // Escape to close suggestions
  if (event.key === 'Escape') {
    showSuggestions.value = false
  }
}

// Page is accessible without authentication for search functionality
onMounted(async () => {
  // No authentication check needed - search is now public
  loadRecentSearches()
  await loadAllTags()
  
  // Add keyboard event listener
  if (process.client) {
    document.addEventListener('keydown', handleKeydown)
  }
})

// Cleanup
onUnmounted(() => {
  if (process.client) {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

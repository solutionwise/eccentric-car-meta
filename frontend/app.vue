<template>
  <div class="min-h-screen bg-background">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <span class="text-primary-foreground font-bold text-lg">🚗</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold tracking-tight">Eccentric Car Meta</span>
                <span class="text-xs text-muted-foreground -mt-1">AI-Powered Search</span>
              </div>
            </NuxtLink>
          </div>
          
          <div class="flex items-center space-x-2">
            <NuxtLink 
              to="/" 
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              :class="{ 'bg-accent text-accent-foreground': $route.path === '/' }"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </NuxtLink>
            
            <!-- Admin link - only show if authenticated -->
            <NuxtLink 
              v-if="isAuthenticated"
              to="/admin" 
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              :class="{ 'bg-accent text-accent-foreground': $route.path === '/admin' }"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </NuxtLink>
            
            <!-- Login/Logout buttons -->
            <template v-if="isAuthenticated">
              <button
                @click="handleLogout"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                to="/login" 
                class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                :class="{ 'bg-accent text-accent-foreground': $route.path === '/login' }"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t bg-background mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center space-y-4">
          <div class="flex items-center justify-center space-x-3">
            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-primary-foreground font-bold text-sm">🚗</span>
            </div>
            <span class="text-lg font-semibold">Eccentric Car Meta</span>
          </div>
          <p class="text-muted-foreground text-sm">
            AI-powered automotive image search using natural language queries
          </p>
          <p class="text-xs text-muted-foreground">
            Built with Nuxt.js, Node.js, and OpenAI CLIP
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Global app setup
useHead({
  title: 'Eccentric Car Meta - Automotive Image Search',
  meta: [
    { name: 'description', content: 'AI-powered automotive image search using natural language queries' }
  ]
})

// Authentication state
const isAuthenticated = ref(false)

// Check authentication status
const checkAuth = () => {
  if (process.client) {
    try {
      const { $auth } = useNuxtApp()
      if ($auth && typeof $auth.isAuthenticated === 'function') {
        isAuthenticated.value = $auth.isAuthenticated()
      }
    } catch (error) {
      console.warn('Auth plugin not available:', error)
      isAuthenticated.value = false
    }
  }
}

// Handle logout
const handleLogout = () => {
  if (process.client) {
    try {
      const { $auth } = useNuxtApp()
      if ($auth && typeof $auth.logout === 'function') {
        $auth.logout()
      }
    } catch (error) {
      console.warn('Auth plugin not available for logout:', error)
    }
  }
  isAuthenticated.value = false
}

// Watch for route changes to update auth state
watch(() => useRoute().path, () => {
  checkAuth()
}, { immediate: true })

// Check auth on mount
onMounted(() => {
  checkAuth()
})
</script>

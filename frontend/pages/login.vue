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
            <span class="font-semibold">Eccentric Car Meta</span>
          </NuxtLink>
        </div>
        <DarkModeToggle />
      </div>
    </header>

    <main class="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card class="w-full max-w-md">
        <CardContent class="p-8">
          <div class="space-y-6">
            <!-- Header -->
            <div class="text-center space-y-2">
              <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                <Lock class="h-6 w-6 text-primary" />
              </div>
              <h1 class="text-2xl font-bold tracking-tight">Admin Login</h1>
              <p class="text-muted-foreground">
                Sign in to access the admin panel
              </p>
            </div>

            <!-- Login Form -->
            <form class="space-y-4" @submit.prevent="handleLogin">
              <div class="space-y-4">
                <div class="space-y-2">
                  <label for="username" class="text-sm font-medium">Username</label>
                  <Input
                    id="username"
                    v-model="form.username"
                    type="text"
                    placeholder="Enter your username"
                    :disabled="isLoading"
                    required
                  />
                </div>
                <div class="space-y-2">
                  <label for="password" class="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    v-model="form.password"
                    type="password"
                    placeholder="Enter your password"
                    :disabled="isLoading"
                    required
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <div class="flex items-center space-x-2">
                  <AlertCircle class="h-4 w-4 text-destructive" />
                  <p class="text-sm text-destructive">{{ error }}</p>
                </div>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                :disabled="isLoading || !form.username || !form.password"
                class="w-full"
              >
                <Loader2 v-if="isLoading" class="h-4 w-4 mr-2 animate-spin" />
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </Button>
            </form>

            <!-- Back Link -->
            <div class="text-center">
              <Button variant="ghost" size="sm" @click="$router.push('/')">
                <ArrowLeft class="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Lock, AlertCircle, Loader2, ArrowLeft } from 'lucide-vue-next'
import Card from '~/components/ui/Card.vue'
import CardContent from '~/components/ui/CardContent.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import DarkModeToggle from '~/components/DarkModeToggle.vue'

// Redirect if already authenticated
// Check if user is already logged in
onMounted(() => {
  if (process.client) {
    try {
      const { $auth } = useNuxtApp()
      if ($auth && typeof $auth.isAuthenticated === 'function' && $auth.isAuthenticated()) {
        navigateTo('/admin')
      }
    } catch (error) {
      console.warn('Auth plugin not available:', error)
    }
  }
})

// Reactive form data
const form = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')

// API configuration
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Handle login
const handleLogin = async () => {
  if (!form.value.username || !form.value.password) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      body: {
        username: form.value.username,
        password: form.value.password
      }
    })
    
    if (response.success) {
      // Store the token
      if (process.client) {
        try {
          const { $auth } = useNuxtApp()
          if ($auth && typeof $auth.setToken === 'function') {
            $auth.setToken(response.token)
          }
        } catch (error) {
          console.warn('Auth plugin not available for token storage:', error)
        }
      }
      
      // Redirect to admin panel
      await navigateTo('/admin')
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.data?.error || 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}

// Set page title
useHead({
  title: 'Admin Login - Eccentric Car Meta'
})
</script>

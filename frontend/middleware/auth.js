export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.client) {
    try {
      const { $auth } = useNuxtApp()
      
      // Check if user is authenticated
      if (!$auth || typeof $auth.isAuthenticated !== 'function' || !$auth.isAuthenticated()) {
        return navigateTo('/login')
      }
    } catch (error) {
      console.warn('Auth middleware error:', error)
      return navigateTo('/login')
    }
  }
})

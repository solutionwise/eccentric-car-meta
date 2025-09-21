export const useApi = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const apiCall = async (url, options = {}) => {
    let token = null
    
    // Get token safely
    if (process.client) {
      try {
        const { $auth } = useNuxtApp()
        if ($auth && typeof $auth.getToken === 'function') {
          token = $auth.getToken()
        }
      } catch (error) {
        console.warn('Auth plugin not available for API call:', error)
      }
    }
    
    const headers = {
      ...options.headers
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    // Construct full URL for direct API calls
    const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`

    return await $fetch(fullUrl, {
      ...options,
      headers
    })
  }

  return {
    apiCall
  }
}

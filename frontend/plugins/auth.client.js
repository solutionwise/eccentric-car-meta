export default defineNuxtPlugin(() => {
  // Only run on client side
  if (!process.client) {
    return {
      provide: {
        auth: {
          setToken: () => {},
          getToken: () => null,
          removeToken: () => {},
          isAuthenticated: () => false,
          logout: () => {}
        }
      }
    }
  }

  const auth = {
    // Token management
    setToken(token) {
      try {
        localStorage.setItem('admin_token', token)
      } catch (error) {
        console.warn('Failed to store token:', error)
      }
    },
    
    getToken() {
      try {
        return localStorage.getItem('admin_token')
      } catch (error) {
        console.warn('Failed to get token:', error)
        return null
      }
    },
    
    removeToken() {
      try {
        localStorage.removeItem('admin_token')
      } catch (error) {
        console.warn('Failed to remove token:', error)
      }
    },
    
    // Authentication status
    isAuthenticated() {
      const token = this.getToken()
      if (!token) return false
      
      try {
        // Check if token is expired (basic JWT decode)
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        return payload.exp > now
      } catch (error) {
        // If token is invalid, remove it
        this.removeToken()
        return false
      }
    },
    
    // Logout
    logout() {
      this.removeToken()
      try {
        navigateTo('/login')
      } catch (error) {
        console.warn('Failed to navigate to login:', error)
        // Fallback to window.location if navigateTo fails
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
  }
  
  return {
    provide: {
      auth
    }
  }
})

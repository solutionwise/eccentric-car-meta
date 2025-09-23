// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      global: true
    }
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3001',
      appName: process.env.APP_NAME || 'Eccentric Car Finder',
      appDescription: process.env.APP_DESCRIPTION || 'AI-powered automotive image search using natural language queries'
    }
  },
  app: {
    head: {
      title: process.env.APP_NAME || 'Eccentric Car Finder - Automotive Image Search',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: process.env.APP_DESCRIPTION || 'AI-powered automotive image search using natural language queries' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  // Disable CSP for development to allow cross-origin images
  nitro: {
    experimental: {
      wasm: true
    }
  }
})

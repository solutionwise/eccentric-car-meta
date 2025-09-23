# Environment Variables Usage

This document explains how to use environment variables in the frontend application.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your environment.

## Available Environment Variables

- `API_BASE_URL`: The base URL for the backend API (default: http://localhost:3001)
- `APP_NAME`: The application name (default: Eccentric Car Finder)
- `APP_DESCRIPTION`: The application description for SEO
- `NODE_ENV`: The environment mode (development/production)

## Using Environment Variables in Components

### Method 1: Using useRuntimeConfig() (Recommended)

```vue
<template>
  <div>
    <h1>{{ config.public.appName }}</h1>
    <p>{{ config.public.appDescription }}</p>
    <p>API Base: {{ config.public.apiBase }}</p>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
```

### Method 2: Using process.env (Server-side only)

```vue
<script setup>
// This only works on the server side
const apiUrl = process.env.API_BASE_URL
</script>
```

### Method 3: In API calls (already implemented)

The `useApi` composable automatically uses the `API_BASE_URL` from the environment:

```vue
<script setup>
const { apiCall } = useApi()

// This will use the API_BASE_URL from .env
const data = await apiCall('/api/images')
</script>
```

## Adding New Environment Variables

1. Add the variable to `.env.example`:
   ```
   NEW_VARIABLE=default_value
   ```

2. Add it to `nuxt.config.ts` in the `runtimeConfig.public` section:
   ```typescript
   runtimeConfig: {
     public: {
       // ... existing variables
       newVariable: process.env.NEW_VARIABLE || 'default_value'
     }
   }
   ```

3. Use it in your components:
   ```vue
   <script setup>
   const config = useRuntimeConfig()
   const newValue = config.public.newVariable
   </script>
   ```

## Security Notes

- Variables in `runtimeConfig.public` are exposed to the client-side
- Never put sensitive data (API keys, secrets) in public runtime config
- Use `runtimeConfig` (without public) for server-side only variables
- The `.env` file is already in `.gitignore` to prevent committing secrets

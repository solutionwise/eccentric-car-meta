<template>
  <Button
    @click="toggleDarkMode"
    variant="ghost"
    size="icon"
    class="w-9 h-9"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Sun
      v-if="isDark"
      class="h-[1.2rem] w-[1.2rem] transition-all"
    />
    <Moon
      v-else
      class="h-[1.2rem] w-[1.2rem] transition-all"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div
    v-for="toast in toasts"
    :key="toast.id"
    :class="cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
      toastVariants({ variant: toast.type }),
      $attrs.class
    )"
    :style="{ transform: `translateX(${toast.show ? '0' : '100%'})` }"
  >
    <div class="grid gap-1">
      <div class="text-sm font-semibold">{{ toast.title }}</div>
      <div class="text-sm opacity-90">{{ toast.message }}</div>
    </div>
    <button
      @click="removeToast(toast.id)"
      class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'
import { X } from 'lucide-vue-next'

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-200 bg-green-50 text-green-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface Toast {
  id: string | number
  title?: string
  message: string
  type: 'default' | 'destructive' | 'success' | 'info'
  show: boolean
}

interface Props {
  toasts: Toast[]
}

defineProps<Props>()

const emit = defineEmits<{
  remove: [id: string | number]
}>()

const removeToast = (id: string | number) => {
  emit('remove', id)
}
</script>

<template>
  <Dialog :open="true" @update:open="handleClose">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-auto">
      <DialogHeader>
        <DialogTitle>{{ image.originalName }}</DialogTitle>
      </DialogHeader>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Image -->
        <div class="space-y-4">
          <div class="relative">
            <img
              :src="getImageUrl(image)"
              :alt="image.originalName"
              class="w-full h-auto rounded-lg shadow-lg"
              @error="handleImageError"
            />
            <Badge
              v-if="image.similarity"
              class="absolute top-4 right-4 bg-black/70 text-white"
            >
              {{ Math.round(image.similarity * 100) }}% match
            </Badge>
          </div>
        </div>

        <!-- Details -->
        <div class="space-y-6">
          <!-- Basic Info -->
          <div>
            <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Image Details
            </h4>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm text-muted-foreground">Filename:</dt>
                <dd class="text-sm font-medium">{{ image.filename }}</dd>
              </div>
              <div v-if="image.metadata" class="flex justify-between">
                <dt class="text-sm text-muted-foreground">Size:</dt>
                <dd class="text-sm">{{ image.metadata.width }} × {{ image.metadata.height }}</dd>
              </div>
              <div v-if="image.metadata" class="flex justify-between">
                <dt class="text-sm text-muted-foreground">File Size:</dt>
                <dd class="text-sm">{{ formatFileSize(image.metadata.fileSize) }}</dd>
              </div>
              <div v-if="image.metadata" class="flex justify-between">
                <dt class="text-sm text-muted-foreground">Type:</dt>
                <dd class="text-sm">{{ image.metadata.mimeType }}</dd>
              </div>
            </dl>
          </div>

          <!-- Tags -->
          <div v-if="image.tags && image.tags.length > 0">
            <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Tags
            </h4>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="tag in image.tags"
                :key="tag"
                variant="secondary"
              >
                {{ tag }}
              </Badge>
            </div>
          </div>

          <!-- Search Info -->
          <div v-if="image.similarity">
            <h4 class="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Search Information
            </h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-sm text-muted-foreground">Similarity Score:</dt>
                <dd class="text-sm font-medium">
                  {{ Math.round(image.similarity * 100) }}%
                </dd>
              </div>
              <div v-if="image.distance" class="flex justify-between">
                <dt class="text-sm text-muted-foreground">Distance:</dt>
                <dd class="text-sm">{{ image.distance.toFixed(4) }}</dd>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <Separator />
          <div class="flex space-x-3">
            <Button
              @click="downloadImage"
              class="flex-1"
            >
              <Download class="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              @click="copyImageUrl"
              variant="secondary"
              class="flex-1"
            >
              <Link class="w-4 h-4 mr-2" />
              Copy URL
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { Download, Link } from 'lucide-vue-next'
import Dialog from '~/components/ui/Dialog.vue'
import DialogContent from '~/components/ui/DialogContent.vue'
import DialogHeader from '~/components/ui/DialogHeader.vue'
import DialogTitle from '~/components/ui/DialogTitle.vue'
import Button from '~/components/ui/Button.vue'
import Badge from '~/components/ui/Badge.vue'
import Separator from '~/components/ui/Separator.vue'

// Props
const props = defineProps({
  image: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['close'])

// API configuration
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

// Methods
const handleClose = (open) => {
  if (!open) {
    emit('close')
  }
}

const getImageUrl = (image) => {
  if (image.filePath) {
    return `${apiBase.replace('/api', '')}/uploads/${image.filename}`
  }
  return '/placeholder-image.jpg'
}

const handleImageError = (event) => {
  event.target.src = '/placeholder-image.jpg'
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown'
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadImage = () => {
  const link = document.createElement('a')
  link.href = getImageUrl(props.image)
  link.target = '_blank'
  link.download = props.image.originalName || props.image.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyImageUrl = async () => {
  try {
    await navigator.clipboard.writeText(getImageUrl(props.image))
    // You could add a toast notification here
    alert('Image URL copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy URL:', error)
    alert('Failed to copy URL to clipboard')
  }
}

// Note: Escape key handling is now managed by the Dialog component
</script>

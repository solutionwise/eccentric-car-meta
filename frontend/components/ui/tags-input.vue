<template>
  <div
    ref="containerRef"
    class="flex flex-wrap gap-1 border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md min-h-[40px]"
    :class="containerClass"
    @click="focusInput"
  >
    <!-- Existing Tags -->
    <div
      v-for="(tag, index) in modelValue"
      :key="`${tag}-${index}`"
      class="inline-flex items-center gap-1 rounded-md border border-transparent bg-gray-100 px-2 py-1 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    >
      <span>{{ capitalizeWords(tag) }}</span>
      <button
        type="button"
        class="ml-1 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-300"
        @click.stop="removeTag(index)"
        :disabled="disabled"
      >
        <svg
          class="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
    
    <!-- Input Field -->
    <input
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="flex-1 bg-transparent outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 min-w-[120px]"
      :placeholder="placeholder"
      :disabled="disabled"
      @keydown="handleKeydown"
      @blur="handleBlur"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Add a tag...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  containerClass: {
    type: String,
    default: ''
  },
  maxTags: {
    type: Number,
    default: undefined
  },
  validateTag: {
    type: Function,
    default: () => true
  },
  addOnBlur: {
    type: Boolean,
    default: true
  },
  duplicateTagBehavior: {
    type: String,
    default: 'prevent', // 'prevent', 'allow', 'update'
    validator: (value) => ['prevent', 'allow', 'update'].includes(value)
  },
  trim: {
    type: Boolean,
    default: true
  },
  caseSensitive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'tag:add', 'tag:remove', 'tag:update'])

const containerRef = ref()
const inputRef = ref()
const inputValue = ref('')

const focusInput = () => {
  inputRef.value?.focus()
}

const capitalizeWords = (str) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

const addTag = (tag) => {
  if (props.disabled) return

  let processedTag = props.trim ? tag.trim() : tag
  if (!processedTag) return

  if (!props.caseSensitive) {
    processedTag = processedTag.toLowerCase()
  }

  // Validate tag
  const validation = props.validateTag(processedTag)
  if (validation !== true) {
    console.warn(typeof validation === 'string' ? validation : 'Invalid tag')
    return
  }

  // Check max tags
  if (props.maxTags && props.modelValue.length >= props.maxTags) {
    return
  }

  // Handle duplicates
  const existingIndex = props.modelValue.findIndex(
    existingTag => props.caseSensitive 
      ? existingTag === processedTag 
      : existingTag.toLowerCase() === processedTag
  )

  if (existingIndex !== -1) {
    if (props.duplicateTagBehavior === 'prevent') {
      return
    } else if (props.duplicateTagBehavior === 'update') {
      const newTags = [...props.modelValue]
      newTags[existingIndex] = processedTag
      emit('update:modelValue', newTags)
      emit('tag:update', processedTag, existingIndex)
      return
    }
  }

  // Add new tag
  const newTags = [...props.modelValue, processedTag]
  emit('update:modelValue', newTags)
  emit('tag:add', processedTag)
}

const removeTag = (index) => {
  if (props.disabled) return

  const tag = props.modelValue[index]
  const newTags = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newTags)
  emit('tag:remove', tag, index)
}

const handleKeydown = (event) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (inputValue.value) {
        addTag(inputValue.value)
        inputValue.value = ''
      }
      break
    case 'Backspace':
      if (!inputValue.value && props.modelValue.length > 0) {
        removeTag(props.modelValue.length - 1)
      }
      break
    case 'Escape':
      inputValue.value = ''
      inputRef.value?.blur()
      break
  }
}

const handleBlur = () => {
  if (props.addOnBlur && inputValue.value) {
    addTag(inputValue.value)
    inputValue.value = ''
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, () => {
  // Sync with external changes if needed
}, { deep: true })
</script>
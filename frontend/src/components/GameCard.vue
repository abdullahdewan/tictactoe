<template>
  <div
    class="glass-card rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
    :class="[
      disabled ? 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : '',
      colorClasses
    ]"
    @click="!disabled && $emit('click')"
  >
    <!-- Icon -->
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-transform duration-300 group-hover:scale-110" :class="iconBgClass">
      <svg v-if="icon === 'plus'" class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
      </svg>
      <svg v-else-if="icon === 'arrow-right'" class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
      </svg>
    </div>

    <!-- Content -->
    <h3 class="text-2xl font-bold mb-3 text-slate-800 dark:text-white">{{ title }}</h3>
    <p class="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{{ description }}</p>

    <!-- Extra Slot -->
    <slot name="extra"></slot>

    <!-- Action Button -->
    <div class="mt-6" @click="props.action">
      <div 
        class="w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-200 group-hover:shadow-lg"
        :class="buttonClasses"
      >
        {{ buttonText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  description: string
  icon: 'plus' | 'arrow-right'
  color: 'primary' | 'emerald'
  disabled?: boolean
  buttonText?: string
  action?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  buttonText: 'Continue'
})

defineEmits<{
  click: []
}>()

const colorClasses = computed(() => {
  if (props.disabled) return ''
  
  return props.color === 'primary' 
    ? 'hover:border-primary-200 dark:hover:border-primary-700' 
    : 'hover:border-emerald-200 dark:hover:border-emerald-700'
})

const iconBgClass = computed(() => {
  return props.color === 'primary'
    ? 'bg-gradient-to-br from-primary-500 to-primary-600'
    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
})

const buttonClasses = computed(() => {
  if (props.disabled) {
    return 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
  }
  
  return props.color === 'primary'
    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700'
    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
})
</script>
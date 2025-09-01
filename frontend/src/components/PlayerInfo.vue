<template>
  <div 
    class="glass-card rounded-2xl p-6 transition-all duration-300"
    :class="{
      'ring-2 ring-primary-500 shadow-lg shadow-primary-200/50 dark:shadow-primary-900/30': isActive,
      'ring-2 ring-emerald-500 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30': isActive && !isCurrentUser
    }"
  >
    <!-- Player Avatar and Info -->
    <div class="flex items-center gap-4 mb-4">
      <div class="relative">
        <img 
          :src="player.avatar" 
          :alt="player.name"
          class="w-16 h-16 rounded-full border-3 border-white shadow-lg"
        >
        <!-- Active Indicator -->
        <div 
          v-if="isActive"
          class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center animate-pulse"
        >
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
      
      <div class="flex-1">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white">{{ player.name }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ isCurrentUser ? 'You' : 'Opponent' }}
        </p>
      </div>
    </div>

    <!-- Symbol Display -->
    <div class="text-center">
      <div 
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl font-bold transition-all duration-300"
        :class="symbolClasses"
      >
        {{ symbol }}
      </div>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Playing as {{ symbol }}</p>
    </div>

    <!-- Status -->
    <div class="mt-4 text-center">
      <span 
        v-if="isActive"
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
        :class="statusClasses"
      >
        <div class="w-2 h-2 rounded-full animate-pulse" :class="statusDotClass"></div>
        Turn Active
      </span>
      <span 
        v-else
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700"
      >
        Waiting
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User, Player } from '../stores/gameStore'

interface Props {
  player: User
  symbol: Player
  isActive: boolean
  isCurrentUser: boolean
}

const props = defineProps<Props>()

const symbolClasses = computed(() => {
  const base = 'border-2 transition-all duration-300'
  
  if (props.isActive) {
    return props.symbol === 'X'
      ? `${base} bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-600 dark:text-primary-400 shadow-lg`
      : `${base} bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg`
  }
  
  return `${base} bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300`
})

const statusClasses = computed(() => {
  return props.symbol === 'X'
    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-600'
    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600'
})

const statusDotClass = computed(() => {
  return props.symbol === 'X'
    ? 'bg-primary-500'
    : 'bg-emerald-500'
})
</script>
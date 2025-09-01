<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-scale-in">
    <div class="glass-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-subtle">
      <!-- Result Icon -->
      <div class="mb-6">
        <div 
          v-if="result?.winner === 'draw'"
          class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div 
          v-else-if="isWin"
          class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center mb-4"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div 
          v-else
          class="w-20 h-20 bg-gradient-to-br from-red-400 to-red-500 rounded-full mx-auto flex items-center justify-center mb-4"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>

      <!-- Result Text -->
      <h2 class="text-3xl font-bold mb-2 text-slate-800 dark:text-white">
        {{ resultTitle }}
      </h2>
      <p class="text-slate-600 dark:text-slate-300 mb-8 text-lg">
        {{ resultMessage }}
      </p>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="$emit('play-again')"
          class="py-3 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          Play Again
        </button>
        <button
          @click="$emit('back-to-lobby')"
          class="py-3 px-6 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import type { GameResult } from '../stores/gameStore'

interface Props {
  result: GameResult | null
}

const props = defineProps<Props>()

defineEmits<{
  'play-again': []
  'back-to-lobby': []
}>()

const gameStore = useGameStore()

const isWin = computed(() => {
  if (!props.result || props.result.winner === 'draw') return false
  return props.result.winner === gameStore.mySymbol
})

const resultTitle = computed(() => {
  if (!props.result) return ''
  
  if (props.result.winner === 'draw') return 'Draw! 🤝'
  return isWin.value ? 'You Win! 🎉' : 'You Lose 😔'
})

const resultMessage = computed(() => {
  if (!props.result) return ''
  
  if (props.result.winner === 'draw') return 'Great game! Try again?'
  return isWin.value ? 'Excellent strategy!' : 'Better luck next time!'
})
</script>
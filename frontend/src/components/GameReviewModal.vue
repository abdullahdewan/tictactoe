<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Game Review</h2>

      <div class="grid grid-cols-3 gap-2 aspect-square max-w-xs mx-auto mb-6">
        <div
          v-for="(cell, index) in reviewBoard"
          :key="index"
          class="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center text-4xl font-bold transition-colors"
          :class="{
            'text-primary-500': cell === 'X',
            'text-emerald-500': cell === 'O',
            'winning-cell': isWinningCell(index)
          }"
        >
          {{ cell }}
        </div>
      </div>

      <div class="flex justify-center gap-4">
        <button @click="replayAnimation" :disabled="isReplaying" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50">
          {{ isReplaying ? 'Replaying...' : 'Replay Animation' }}
        </button>
        <button @click="$emit('close')" class="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.winning-cell {
  animation: glow 1.5s infinite alternate;
}

@keyframes glow {
  from {
    background-color: rgba(250, 204, 21, 0.5);
    box-shadow: 0 0 5px #facc15, 0 0 10px #facc15, 0 0 15px #facc15;
  }
  to {
    background-color: rgba(250, 204, 21, 0.7);
    box-shadow: 0 0 10px #fde047, 0 0 20px #fde047, 0 0 30px #fde047;
  }
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RecentGame } from '@/stores/gameStore'

const props = defineProps<{
  show: boolean
  game: RecentGame | null
}>()

defineEmits(['close'])

const reviewBoard = ref<(string | null)[]>(Array(9).fill(null))
const isReplaying = ref(false)
const highlightedLine = ref<number[] | undefined>([])

watch(() => props.show, (newVal) => {
  if (newVal && props.game) {
    // When the modal is shown, display the final board state initially
    reviewBoard.value = [...props.game.board]
    highlightedLine.value = props.game.winningLine
  } else {
    highlightedLine.value = []
  }
})

const isWinningCell = (index: number) => {
  return highlightedLine.value?.includes(index)
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const replayAnimation = async () => {
  if (!props.game || isReplaying.value) return

  isReplaying.value = true
  reviewBoard.value = Array(9).fill(null)
  highlightedLine.value = []

  for (const move of props.game.moves) {
    await sleep(400) // Slightly faster animation
    reviewBoard.value[move.position] = move.symbol
  }

  await sleep(300)
  highlightedLine.value = props.game.winningLine

  isReplaying.value = false
}
</script>

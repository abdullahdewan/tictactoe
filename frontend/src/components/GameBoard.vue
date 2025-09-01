<template>
  <div class="inline-block glass-card rounded-3xl p-6 shadow-2xl">
    <div class="grid grid-cols-3 gap-3">
      <div
        v-for="(cell, index) in gameStore.board"
        :key="index"
        class="game-cell"
        :class="{ 
          'disabled': cell !== null || !gameStore.isMyTurn || gameStore.gameState !== 'playing',
          'winning-cell': isWinningCell(index)
        }"
        @click="handleCellClick(index)"
        @mouseenter="handleCellHover(index, true)"
        @mouseleave="handleCellHover(index, false)"
      >
        <!-- Existing Symbol -->
        <div
          v-if="cell"
          class="animate-bounce-subtle"
          :class="cell === 'X' ? 'text-primary-600' : 'text-emerald-500'"
        >
          {{ cell }}
        </div>
        
        <!-- Hover Preview -->
        <div
          v-else-if="hoveredCell === index && canPlaceSymbol"
          class="opacity-30 transition-opacity duration-200"
          :class="gameStore.mySymbol === 'X' ? 'text-primary-600' : 'text-emerald-500'"
        >
          {{ gameStore.mySymbol }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()

const hoveredCell = ref<number | null>(null)

const canPlaceSymbol = computed(() => 
  gameStore.isMyTurn && gameStore.gameState === 'playing'
)

const handleCellClick = (index: number) => {
  if (!canPlaceSymbol.value || gameStore.board[index]) return
  
  gameStore.makeMove(index)
}

const handleCellHover = (index: number, isHovering: boolean) => {
  if (!canPlaceSymbol.value || gameStore.board[index]) {
    hoveredCell.value = null
    return
  }
  
  hoveredCell.value = isHovering ? index : null
}

const isWinningCell = (index: number): boolean => {
  return gameStore.gameResult?.winningLine?.includes(index) || false
}

</script>

<style scoped>
.winning-cell {
  @apply bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-800 dark:to-yellow-700 border-yellow-400 dark:border-yellow-500 animate-pulse;
}
</style>
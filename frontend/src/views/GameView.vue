<template>
  <div class="min-h-screen p-4 sm:p-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-8">
      <button
        @click="handleBackToLobby"
        class="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        Back to Lobby
      </button>

      <div class="flex items-center gap-4">
        <div class="text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">Room</p>
          <code
            class="text-lg font-mono font-bold text-slate-800 dark:text-white"
          >
            {{ gameStore.roomCode }}
          </code>
        </div>
      </div>
    </header>

    <!-- Game Area -->
    <div class="max-w-4xl mx-auto">
      <!-- Player Info -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <PlayerInfo
          v-if="gameStore.currentUser"
          :player="gameStore.currentUser"
          :symbol="gameStore.mySymbol"
          :is-active="gameStore.isMyTurn"
          :is-current-user="true"
        />
        <PlayerInfo
          v-if="gameStore.opponent"
          :player="gameStore.opponent"
          :symbol="gameStore.opponentSymbol"
          :is-active="!gameStore.isMyTurn && gameStore.gameState === 'playing'"
          :is-current-user="false"
        />
        <div v-else class="glass-card rounded-2xl p-6 text-center">
          <div
            class="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
          <p class="text-slate-500 dark:text-slate-400">
            Waiting for opponent...
          </p>
        </div>
      </div>

      <!-- Game Board -->
      <div class="flex justify-center mb-8">
        <GameBoard />
      </div>

      <!-- Turn Indicator -->
      <div class="text-center mb-8" v-if="gameStore.gameState === 'playing'">
        <p class="text-lg text-slate-600 dark:text-slate-300">
          <span
            v-if="gameStore.isMyTurn"
            class="text-primary-600 font-semibold"
          >
            Your Turn
          </span>
          <span v-else class="text-emerald-600 font-semibold">
            Opponent's Turn
          </span>
        </p>
      </div>
    </div>

    <!-- Game Result Modal -->
    <GameModal
      v-if="gameStore.gameState === 'completed'"
      :result="gameStore.gameResult"
      @play-again="handlePlayAgain"
      @back-to-lobby="handleBackToLobby"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import { useNotificationStore } from '../stores/notificationStore'
import GameBoard from '../components/GameBoard.vue'
import PlayerInfo from '../components/PlayerInfo.vue'
import GameModal from '../components/GameModal.vue'

const router = useRouter()
const gameStore = useGameStore()
const notificationStore = useNotificationStore()

// Simulate opponent joining when hosting
onMounted(() => {})

const handlePlayAgain = () => {
  gameStore.playAgain()
}

const handleBackToLobby = () => {
  gameStore.backToLobby()
  router.push('/lobby')
}

// Watch for game state changes
watch(
  () => gameStore.gameState,
  newState => {
    if (newState === 'playing') {
      notificationStore.showInfo('Game started! Good luck!')
    }
  },
)
</script>

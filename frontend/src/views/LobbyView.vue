<template>
  <div class="min-h-screen p-4 sm:p-8">
    <!-- Header -->
    <header class="flex justify-between items-center mb-12">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-3 0v3"></path>
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Game Lobby</h1>
      </div>

      <!-- User Profile -->
      <div v-if="gameStore.currentUser" class="flex items-center gap-3">
        <img 
          :src="gameStore.currentUser.avatar" 
          :alt="gameStore.currentUser.name"
          class="w-12 h-12 rounded-full border-2 border-white shadow-lg"
        >
        <div class="hidden sm:block">
          <p class="font-semibold text-slate-800 dark:text-white">{{ gameStore.currentUser.name }}</p>
          <button 
            @click="handleLogout"
            class="text-sm text-slate-500 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>

    <!-- Game Options -->
    <div class="max-w-4xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8">
        <!-- Create Game Card -->
        <GameCard
          title="Create Game"
          description="Start a new game and invite friends"
          icon="plus"
          color="primary"
          :disabled="isCreatingGame"
          :buttonText="isCreatingGame ? 'Creating...' : 'Create'"
          :action="handleCreateGame"
        >
          <template #extra>
            <div v-if="gameStore.gameState === 'waiting'" class="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p class="text-sm text-primary-700 dark:text-primary-300 mb-2">Room Code:</p>
              <div class="flex items-center gap-2">
                <code class="text-xl font-mono font-bold text-primary-800 dark:text-primary-200 bg-white dark:bg-slate-700 px-3 py-1 rounded-lg">
                  {{ gameStore.roomCode }}
                </code>
                <button
                  @click="copyRoomCode"
                  class="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <!-- Leave from game -->
                <button
                  @click="gameStore.leaveGame()"
                  class="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-primary-600 dark:text-primary-400 mt-2">
                Waiting for opponent to join...
              </p>
            </div>
          </template>
        </GameCard>

        <!-- Join Game Card -->
        <GameCard
          title="Join Game"
          description="Enter a room code to join existing game"
          icon="arrow-right"
          color="emerald"
          :disabled="!joinCode || gameStore.isJoiningGame"
          :buttonText="gameStore.isJoiningGame ? 'Joining...' : 'Join'"
          :action="handleJoinGame"
        >
          <template #extra>
            <div class="mt-4">
              <input
                v-model="joinCode"
                type="text"
                placeholder="Enter room code"
                class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-lg font-mono uppercase bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                maxlength="6"
              >
            </div>
          </template>
        </GameCard>
      </div>

      <!-- Recent Games (Placeholder) -->
      <div class="mt-16">
        <h2 class="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Games</h2>
        <div class="glass-card rounded-2xl p-8 text-center">
          <svg class="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <p class="text-slate-500 dark:text-slate-400">No recent games yet</p>
          <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Start your first game above!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useNotificationStore } from '../stores/notificationStore'
import GameCard from '../components/GameCard.vue'

const gameStore = useGameStore()
const notificationStore = useNotificationStore()

const joinCode = ref('')
const isCreatingGame = ref(false)

const handleCreateGame = async () => {
  isCreatingGame.value = true
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
  
  gameStore.createGame()
  
  isCreatingGame.value = false
}

const handleJoinGame = async () => {
  if (!joinCode.value.trim()) return
  
  gameStore.isJoiningGame = true
  await new Promise(resolve => setTimeout(resolve, 800)) // Simulate network call
  
  gameStore.joinGame(joinCode.value)

  gameStore.isJoiningGame = false
}

const copyRoomCode = async () => {
  try {
    await navigator.clipboard.writeText(gameStore.roomCode)
    notificationStore.showSuccess('Room code copied to clipboard!')
  } catch {
    notificationStore.showError('Failed to copy room code')
  }
}

const handleLogout = () => {
  gameStore.logout()
}
</script>
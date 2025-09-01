<template>
  <div id="app" class="min-h-screen">
    <router-view />
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import axios from '@/composables/axios'
import { useGameStore } from '@/stores/gameStore'
import NotificationToast from '@/components/NotificationToast.vue'

const gameStore = useGameStore()

onMounted(async () => {
  try {
    const response = await axios.get('/api/user/me')
    if (!gameStore.currentUser) {
      if (response.data.id) {
        gameStore.loginUser(response.data)
      }
    } else if (gameStore.currentUser.id !== response.data?.id) {
      gameStore.logout()
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    gameStore.logout()
  }
  setInterval(() => {
    if (true) return
    console.log('Checking game status...')
    if (!gameStore.roomCode) return
    if (gameStore.gameState == 'playing') return

    gameStore.checkGameStatus()
  }, 15000) // Check every 15 seconds
  gameStore.checkGameStatus()
})
</script>

<style>
html {
  scroll-behavior: smooth;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  html {
    color-scheme: dark;
  }
}
</style>

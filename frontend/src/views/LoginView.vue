<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <!-- Background Animation -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-emerald-50 to-primary-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div class="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>

    <!-- Login Card -->
    <div class="glass-card rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 relative z-10 animate-scale-in">
      <!-- Logo/Title -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-3 0v3"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          TicTacToe
        </h1>
        <p class="text-slate-600 dark:text-slate-300 text-lg">
          Modern. Clean. Elegant.
        </p>
      </div>

      <!-- Login Button -->
      <button
        @click="handleGoogleLogin"
        :disabled="isLoading"
        class="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4 flex items-center justify-center gap-4 text-slate-700 dark:text-slate-200 font-semibold text-lg transition-all duration-300 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-100/50 dark:hover:border-primary-600 dark:hover:shadow-primary-900/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <svg v-if="!isLoading" class="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <div v-else class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span>{{ isLoading ? 'Signing in...' : 'Continue with Google' }}</span>
      </button>

      <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Join thousands of players worldwide
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)

const handleGoogleLogin = async () => {
  isLoading.value = true
  
  // Simulate Google OAuth flow
  window.location.href = '/api/google/login'

  isLoading.value = false
}
</script>
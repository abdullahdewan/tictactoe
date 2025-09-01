<template>
  <div class="fixed top-4 right-4 z-50 space-y-3">
    <transition-group
      name="toast"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="notification in notificationStore.notifications"
        :key="notification.id"
        class="glass-card rounded-2xl p-4 max-w-sm shadow-2xl flex items-center gap-3"
        :class="toastClasses(notification.type)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <svg v-if="notification.type === 'success'" class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <svg v-else-if="notification.type === 'error'" class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-else-if="notification.type === 'warning'" class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <svg v-else class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>

        <!-- Message -->
        <p class="flex-1 text-slate-800 dark:text-white font-medium">
          {{ notification.message }}
        </p>

        <!-- Close Button -->
        <button
          @click="notificationStore.removeNotification(notification.id)"
          class="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../stores/notificationStore'

const notificationStore = useNotificationStore()

const toastClasses = (type: string) => {
  const base = 'border-l-4'
  
  switch (type) {
    case 'success':
      return `${base} border-emerald-500 bg-emerald-50/90 dark:bg-emerald-900/20`
    case 'error':
      return `${base} border-red-500 bg-red-50/90 dark:bg-red-900/20`
    case 'warning':
      return `${base} border-yellow-500 bg-yellow-50/90 dark:bg-yellow-900/20`
    default:
      return `${base} border-blue-500 bg-blue-50/90 dark:bg-blue-900/20`
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
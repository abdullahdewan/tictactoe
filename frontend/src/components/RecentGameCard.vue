<template>
  <div class="glass-card rounded-2xl p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <img :src="myPlayer.user_id.avatar" :alt="myPlayer.user_id.name" class="w-10 h-10 rounded-full border-2 border-primary-500" />
        <div>
          <p class="font-bold text-slate-800 dark:text-white">{{ myPlayer.user_id.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">(You)</p>
        </div>
      </div>
      <div class="text-sm font-bold text-slate-400 dark:text-slate-500">vs.</div>
      <div class="flex items-center gap-3">
        <img :src="opponent.user_id.avatar" :alt="opponent.user_id.name" class="w-10 h-10 rounded-full" />
        <div>
          <p class="font-bold text-slate-800 dark:text-white">{{ opponent.user_id.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">(Opponent)</p>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-200 dark:border-slate-700 my-2"></div>
    <div class="flex items-center justify-between">
      <div>
        <p
          class="font-bold text-lg"
          :class="{
            'text-emerald-500': game.result === 'win',
            'text-red-500': game.result === 'loss',
            'text-slate-500': game.result === 'draw',
          }"
        >
          {{ game.result.charAt(0).toUpperCase() + game.result.slice(1) }}
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ timeAgo }}</p>
      </div>
      <button @click="$emit('review')" class="btn-secondary">
        Review Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore, type RecentGame } from '@/stores/gameStore'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps<{
  game: RecentGame
}>()

defineEmits(['review'])

const gameStore = useGameStore()

const opponent = computed(() => {
  return props.game.players.find(p => p.user_id.id !== gameStore.currentUser?.id)!
})

const myPlayer = computed(() => {
  return props.game.players.find(p => p.user_id.id === gameStore.currentUser?.id)!
})

const timeAgo = computed(() => {
  if (!props.game || !props.game.updatedAt) {
    return 'Unknown'
  }
  return formatDistanceToNow(new Date(props.game.updatedAt), { addSuffix: true })
})
</script>

<template>
  <div class="glass-card rounded-2xl p-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <img
        :src="opponent?.avatar"
        :alt="opponent?.name"
        class="w-12 h-12 rounded-full"
      />
      <div>
        <p class="font-bold text-slate-800 dark:text-white">
          {{ opponent?.name }}
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ timeAgo }}</p>
      </div>
    </div>
    <div class="text-right">
      <p
        class="font-bold text-lg"
        :class="{
          'text-emerald-500': gameResult === 'win',
          'text-red-500': gameResult === 'loss',
          'text-slate-500': gameResult === 'draw',
        }"
      >
        {{ gameResult.charAt(0)?.toUpperCase() + gameResult?.slice(1) || '' }}
      </p>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        You played as {{ mySymbol }}
      </p>
      <button
        @click="$emit('review')"
        class="text-sm text-primary-500 hover:underline mt-1"
      >
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
  if (!props.game || !props.game.players) {
    return null
  }
  const opponentPlayer = props.game.players.find(
    p => p.user_id && p.user_id.id !== gameStore.currentUser?.id,
  )
  return opponentPlayer?.user_id
})

const myPlayer = computed(() => {
  if (!props.game || !props.game.players) {
    return null
  }
  return props.game.players.find(
    p => p.user_id && p.user_id.id === gameStore.currentUser?.id,
  )
})

const mySymbol = computed(() => myPlayer.value?.symbol)

const gameResult = computed(() => props.game.result)

const timeAgo = computed(() => {
  if (!props.game || !props.game.updatedAt) {
    return 'Unknown'
  }
  return formatDistanceToNow(new Date(props.game.updatedAt), {
    addSuffix: true,
  })
})
</script>

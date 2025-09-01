import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import LoginView from '@/views/LoginView.vue'
import LobbyView from '@/views/LobbyView.vue'
import GameView from '@/views/GameView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView,
    },
    {
      path: '/game',
      name: 'game',
      component: GameView,
    },
    {
      path: '/:catchAll(.*)',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  console.log('Navigating from:', from)
  const gameStore = useGameStore()
  if (to.name !== 'login' && !gameStore.currentUser) {
    next({ name: 'login' })
  } else if (to.name === 'login' && gameStore.currentUser) {
    next({ name: 'lobby' })
  } else {
    next()
  }
})

export default router

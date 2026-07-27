<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AuthHeader from '@/components/AuthHeader.vue'

const route = useRoute()

const isAuthPage = computed(() => {
  return route.meta.authPage === true
})
</script>

<template>
  <!-- 로그인·회원가입 화면의 헤더 -->
  <AuthHeader v-if="isAuthPage" />

  <!-- 로그인한 뒤 사용하는 일반 화면의 헤더 -->
  <AppHeader v-else />

  <!-- 로그인·회원가입 화면 -->
  <RouterView v-if="isAuthPage" />

  <!-- 홈, 여행 기록, 초대 관리, 마이페이지 등의 일반 화면 -->
  <div v-else class="app-shell">
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
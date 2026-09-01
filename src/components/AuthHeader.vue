<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import travelStoryLogo from '@/assets/images/travel-story-logo.png'

const route = useRoute()

const isLoginPage = computed(() => route.name === 'login')
const isSignUpPage = computed(() => route.name === 'signup')
</script>

<template>
  <header class="auth-header">
    <RouterLink
      class="auth-header-brand"
      to="/login"
      aria-label="Travel Story 로그인 화면"
    >
      <img
        :src="travelStoryLogo"
        alt="Travel Story"
        class="brand-logo"
      />
    </RouterLink>

    <nav class="auth-header-actions" aria-label="로그인 및 회원가입">
      <RouterLink
        class="login-link"
        :class="{ active: isLoginPage }"
        to="/login"
      >
        로그인
      </RouterLink>

      <RouterLink
        class="signup-link"
        :class="{ active: isSignUpPage }"
        to="/signup"
      >
        회원가입
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.auth-header {
  display: flex;
  height: 72px;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  border-bottom: 1px solid var(--tmr-border);
  background: var(--tmr-surface);
}

.auth-header-brand {
  display: flex;
  align-items: center;
}

.brand-logo {
  width: 150px;
  height: auto;
  object-fit: contain;
}

.auth-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-header-actions a {
  display: flex;
  min-width: 78px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  font-size: 12px;
  font-weight: 700;
}

.login-link {
  border: 1px solid transparent;
  color: var(--tmr-text-sub);
}

.login-link:hover,
.login-link.active {
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.signup-link {
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.signup-link:hover,
.signup-link.active {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

@media (max-width: 760px) {
  .auth-header {
    height: 58px;
    justify-content: center;
    padding: 0 17px;
  }

  .brand-logo {
    width: 135px;
  }

  .auth-header-actions {
    display: none;
  }
}
</style>
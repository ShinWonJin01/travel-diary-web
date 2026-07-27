<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const isLoginPage = computed(() => {
  return route.name === 'login'
})

const isSignUpPage = computed(() => {
  return route.name === 'signup'
})
</script>

<template>
  <header class="auth-header">
    <RouterLink
      class="auth-header-brand"
      to="/login"
      aria-label="공동 여행기록장 로그인 화면"
    >
      <span class="brand-symbol">
        <span></span>
        <span></span>
      </span>

      <strong>공동 여행기록장</strong>
    </RouterLink>

    <nav
      class="auth-header-actions"
      aria-label="로그인 및 회원가입"
    >
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
  border-bottom: 1px solid #e6ebf1;
  background: #ffffff;
}

.auth-header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6381a5;
}

.auth-header-brand strong {
  font-size: 17px;
  font-weight: 700;
}

.brand-symbol {
  display: flex;
  width: 28px;
  flex-direction: column;
  gap: 3px;
}

.brand-symbol span {
  display: block;
  height: 9px;
  border-radius: 10px;
  background: #cad8e7;
}

.brand-symbol span:last-child {
  width: 20px;
  background: #708cae;
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
  color: #5e6b7b;
}

.login-link:hover,
.login-link.active {
  color: #315de8;
  background: #f0f4ff;
}

.signup-link {
  border: 1px solid #4e6688;
  color: #ffffff;
  background: #4e6688;
}

.signup-link:hover,
.signup-link.active {
  border-color: #315de8;
  background: #315de8;
}

@media (max-width: 760px) {
  .auth-header {
    height: 58px;
    justify-content: center;
    padding: 0 17px;
  }

  .auth-header-brand {
    gap: 10px;
  }

  .auth-header-brand strong {
    font-size: 15px;
  }

  .brand-symbol {
    width: 24px;
  }

  .brand-symbol span {
    height: 8px;
  }

  .brand-symbol span:last-child {
    width: 17px;
  }

  .auth-header-actions {
    display: none;
  }
}
</style>
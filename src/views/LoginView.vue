<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import { login } from '@/api/auth'
import { ApiError } from '@/api/http'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberLogin = ref(false)
const showPassword = ref(false)
const formError = ref('')
const isSubmitting = ref(false)

const isRegistered = computed(() => {
  return route.query.registered === 'true'
})

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const handleLogin = async () => {
  formError.value = ''

  const trimmedEmail = email.value.trim()

  if (!trimmedEmail) {
    formError.value = '이메일을 입력해 주세요.'
    return
  }

  if (!isValidEmail(trimmedEmail)) {
    formError.value = '올바른 이메일 형식을 입력해 주세요.'
    return
  }

  if (!password.value) {
    formError.value = '비밀번호를 입력해 주세요.'
    return
  }

  try {
    isSubmitting.value = true

    await login(
      {
        email: trimmedEmail,
        password: password.value,
      },
      rememberLogin.value,
    )

    await router.replace('/')
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      formError.value = error.message
      return
    }

    formError.value =
      '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}

const showPasswordNotice = () => {
  formError.value =
    '비밀번호 찾기는 회원 인증 API를 연결할 때 구현할 예정입니다.'
}
</script>

<template>
  <AuthShell
    title="로그인"
    description="로그인하고 친구들과 함께 여행 기록을 시작해 보세요."
  >
    <p v-if="isRegistered" class="auth-success">
      회원가입이 완료되었습니다. 로그인해 주세요.
    </p>

    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="auth-field">
        <label for="login-email">이메일</label>

        <input
          id="login-email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="example@email.com"
        />
      </div>

      <div class="auth-field">
        <label for="login-password">비밀번호</label>

        <div class="auth-input-wrap">
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="비밀번호를 입력해 주세요."
          />

          <button
            class="auth-password-toggle"
            type="button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '숨기기' : '보기' }}
          </button>
        </div>
      </div>

      <div class="auth-options">
        <label class="auth-checkbox">
          <input v-model="rememberLogin" type="checkbox" />
          <span>로그인 상태 유지</span>
        </label>

        <button
          class="auth-text-button"
          type="button"
          @click="showPasswordNotice"
        >
          비밀번호를 잊으셨나요?
        </button>
      </div>

      <p v-if="formError" class="auth-error">
        {{ formError }}
      </p>

      <button 
        class="auth-submit"
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '로그인 중...' : '로그인' }}
      </button>
    </form>

    <p class="auth-switch">
      아직 계정이 없으신가요?
      <RouterLink to="/signup">
        회원가입
      </RouterLink>
    </p>
  </AuthShell>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import { signup } from '@/api/auth'
import { ApiError } from '@/api/http'

const router = useRouter()

const name = ref('')
const nickname = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const formError = ref('')
const isSubmitting = ref(false)

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const handleSignUp = async () => {
  formError.value = ''

  const trimmedName = name.value.trim()
  const trimmedNickname = nickname.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedName) {
    formError.value = '이름을 입력해 주세요.'
    return
  }

  if (!trimmedNickname) {
    formError.value = '닉네임을 입력해 주세요.'
    return
  }

  if (trimmedNickname.length < 2) {
    formError.value = '닉네임은 2자 이상 입력해 주세요.'
    return
  }

  if (!trimmedEmail) {
    formError.value = '이메일을 입력해 주세요.'
    return
  }

  if (!isValidEmail(trimmedEmail)) {
    formError.value = '올바른 이메일 형식을 입력해 주세요.'
    return
  }

  if (password.value.length < 8) {
    formError.value = '비밀번호는 8자 이상 입력해 주세요.'
    return
  }

  if (password.value !== passwordConfirm.value) {
    formError.value = '비밀번호가 서로 일치하지 않습니다.'
    return
  }

  try {
    isSubmitting.value = true

    await signup({
      name: trimmedName,
      email: trimmedEmail,
      password: password.value,
      nickname: trimmedNickname,
    })

    await router.replace({
      name: 'login',
      query: {
        registered: 'true',
      },
    })
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
</script>

<template>
  <AuthShell
    title="회원가입"
    description="계정을 만들고 소중한 여행 기록을 함께 남겨보세요."
  >
    <form class="auth-form" @submit.prevent="handleSignUp">
      <div class="auth-field-row">
        <div class="auth-field">
          <label for="signup-name">이름</label>

          <input
            id="signup-name"
            v-model="name"
            type="text"
            autocomplete="name"
            maxlength="50"
            placeholder="이름"
          />
        </div>

        <div class="auth-field">
          <label for="signup-nickname">닉네임</label>

          <input
            id="signup-nickname"
            v-model="nickname"
            type="text"
            autocomplete="nickname"
            maxlength="20"
            placeholder="사용할 닉네임"
          />
        </div>
      </div>

      <div class="auth-field">
        <label for="signup-email">이메일</label>

        <input
          id="signup-email"
          v-model="email"
          type="email"
          autocomplete="email"
          maxlength="100"
          placeholder="example@email.com"
        />

        <p class="auth-helper">
          로그인과 여행 초대에 사용할 이메일입니다.
        </p>
      </div>

      <div class="auth-field">
        <label for="signup-password">비밀번호</label>

        <div class="auth-input-wrap">
          <input
            id="signup-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="30"
            placeholder="8자 이상 입력해 주세요."
          />

          <button
            class="auth-password-toggle"
            type="button"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '숨기기' : '보기' }}
          </button>
        </div>

        <p class="auth-helper">
          영문, 숫자, 특수문자를 조합하는 것을 권장합니다.
        </p>
      </div>

      <div class="auth-field">
        <label for="signup-password-confirm">
          비밀번호 확인
        </label>

        <div class="auth-input-wrap">
          <input
            id="signup-password-confirm"
            v-model="passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="30"
            placeholder="비밀번호를 다시 입력해 주세요."
          />

          <button
            class="auth-password-toggle"
            type="button"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            {{ showPasswordConfirm ? '숨기기' : '보기' }}
          </button>
        </div>
      </div>

      <p v-if="formError" class="auth-error">
        {{ formError }}
      </p>

      <button
        class="auth-submit"
        type="submit"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? '가입 중...' : '회원가입' }}
      </button>
    </form>

    <p class="auth-switch">
      이미 계정이 있으신가요?
      <RouterLink to="/login">
        로그인
      </RouterLink>
    </p>
  </AuthShell>
</template>
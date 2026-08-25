<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthShell from '@/components/AuthShell.vue'
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode,
} from '@/api/auth'
import { ApiError } from '@/api/http'

type ResetStep = 1 | 2 | 3

const router = useRouter()

const step = ref<ResetStep>(1)

const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const showNewPassword = ref(false)
const showNewPasswordConfirm = ref(false)

const formError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const setApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    formError.value = error.message
    return
  }

  formError.value =
    '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
}

const handleRequestCode = async () => {
  formError.value = ''
  successMessage.value = ''

  const trimmedEmail = email.value.trim()

  if (!trimmedEmail) {
    formError.value = '이메일을 입력해 주세요.'
    return
  }

  if (!isValidEmail(trimmedEmail)) {
    formError.value = '올바른 이메일 형식을 입력해 주세요.'
    return
  }

  try {
    isSubmitting.value = true

    await requestPasswordReset({
      email: trimmedEmail,
    })

    email.value = trimmedEmail
    step.value = 2

    successMessage.value =
      '가입된 이메일인 경우 인증번호를 전송했습니다.'
  } catch (error: unknown) {
    setApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleVerifyCode = async () => {
  formError.value = ''
  successMessage.value = ''

  const trimmedCode = verificationCode.value.trim()

  if (!/^\d{6}$/.test(trimmedCode)) {
    formError.value = '6자리 인증번호를 입력해 주세요.'
    return
  }

  try {
    isSubmitting.value = true

    await verifyPasswordResetCode({
      email: email.value,
      verificationCode: trimmedCode,
    })

    verificationCode.value = trimmedCode
    step.value = 3

    successMessage.value =
      '인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.'
  } catch (error: unknown) {
    setApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleConfirmPassword = async () => {
  formError.value = ''
  successMessage.value = ''

  if (
    newPassword.value.length < 8 ||
    newPassword.value.length > 30
  ) {
    formError.value =
      '비밀번호는 8자 이상 30자 이하로 입력해 주세요.'
    return
  }

  if (
    newPassword.value !==
    newPasswordConfirm.value
  ) {
    formError.value =
      '새 비밀번호가 서로 일치하지 않습니다.'
    return
  }

  try {
    isSubmitting.value = true

    await confirmPasswordReset({
      email: email.value,
      verificationCode: verificationCode.value,
      newPassword: newPassword.value,
    })

    await router.replace({
      name: 'login',
      query: {
        passwordReset: 'true',
      },
    })
  } catch (error: unknown) {
    setApiError(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleResendCode = async () => {
  formError.value = ''
  successMessage.value = ''

  try {
    isSubmitting.value = true

    await requestPasswordReset({
      email: email.value,
    })

    verificationCode.value = ''

    successMessage.value =
      '인증번호를 다시 전송했습니다.'
  } catch (error: unknown) {
    setApiError(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthShell
    title="비밀번호 찾기"
    description="가입한 이메일을 인증하고 새 비밀번호를 설정해 주세요."
  >
    <form
      v-if="step === 1"
      class="auth-form"
      @submit.prevent="handleRequestCode"
    >
      <div class="auth-field">
        <label for="reset-email">
          이메일
        </label>

        <input
          id="reset-email"
          v-model="email"
          type="email"
          autocomplete="email"
          maxlength="100"
          placeholder="example@email.com"
        />

        <p class="auth-helper">
          가입한 이메일로 6자리 인증번호를 보내드립니다.
        </p>
      </div>

      <p
        v-if="formError"
        class="auth-error"
      >
        {{ formError }}
      </p>

      <button
        class="auth-submit"
        type="submit"
        :disabled="isSubmitting"
      >
        {{
          isSubmitting
            ? '전송 중...'
            : '인증번호 받기'
        }}
      </button>
    </form>

    <form
      v-else-if="step === 2"
      class="auth-form"
      @submit.prevent="handleVerifyCode"
    >
      <div class="auth-field">
        <label for="reset-code">
          인증번호
        </label>

        <input
          id="reset-code"
          v-model="verificationCode"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          placeholder="6자리 인증번호"
        />

        <p class="auth-helper">
          {{ email }}로 전송된 인증번호를 입력해 주세요.
          인증번호는 5분 동안 유효합니다.
        </p>
      </div>

      <p
        v-if="successMessage"
        class="auth-success"
      >
        {{ successMessage }}
      </p>

      <p
        v-if="formError"
        class="auth-error"
      >
        {{ formError }}
      </p>

      <button
        class="auth-submit"
        type="submit"
        :disabled="isSubmitting"
      >
        {{
          isSubmitting
            ? '확인 중...'
            : '인증번호 확인'
        }}
      </button>

      <button
        class="auth-text-button"
        type="button"
        :disabled="isSubmitting"
        @click="handleResendCode"
      >
        인증번호 다시 받기
      </button>
    </form>

    <form
      v-else
      class="auth-form"
      @submit.prevent="handleConfirmPassword"
    >
      <p
        v-if="successMessage"
        class="auth-success"
      >
        {{ successMessage }}
      </p>

      <div class="auth-field">
        <label for="reset-new-password">
          새 비밀번호
        </label>

        <div class="auth-input-wrap">
          <input
            id="reset-new-password"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            autocomplete="new-password"
            maxlength="30"
            placeholder="8자 이상 입력해 주세요."
          />

          <button
            class="auth-password-toggle"
            type="button"
            @click="showNewPassword = !showNewPassword"
          >
            {{ showNewPassword ? '숨기기' : '보기' }}
          </button>
        </div>

        <p class="auth-helper">
          영문, 숫자, 특수문자를 조합하는 것을 권장합니다.
        </p>
      </div>

      <div class="auth-field">
        <label for="reset-new-password-confirm">
          새 비밀번호 확인
        </label>

        <div class="auth-input-wrap">
          <input
            id="reset-new-password-confirm"
            v-model="newPasswordConfirm"
            :type="
              showNewPasswordConfirm
                ? 'text'
                : 'password'
            "
            autocomplete="new-password"
            maxlength="30"
            placeholder="새 비밀번호를 다시 입력해 주세요."
          />

          <button
            class="auth-password-toggle"
            type="button"
            @click="
              showNewPasswordConfirm =
                !showNewPasswordConfirm
            "
          >
            {{
              showNewPasswordConfirm
                ? '숨기기'
                : '보기'
            }}
          </button>
        </div>
      </div>

      <p
        v-if="formError"
        class="auth-error"
      >
        {{ formError }}
      </p>

      <button
        class="auth-submit"
        type="submit"
        :disabled="isSubmitting"
      >
        {{
          isSubmitting
            ? '변경 중...'
            : '비밀번호 변경'
        }}
      </button>
    </form>

    <p class="auth-switch">
      비밀번호가 기억나셨나요?
      <RouterLink to="/login">
        로그인
      </RouterLink>
    </p>
  </AuthShell>
</template>

<style scoped>
.auth-form > .auth-success {
  margin-bottom: 18px;
}
</style>
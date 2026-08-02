<script setup lang="ts">
import { ref } from 'vue'

import { changePassword } from '@/api/auth'
import { ApiError } from '@/api/http'

/* =========================
   부모에게 보내는 이벤트
========================= */

const emit = defineEmits<{
  close: []
}>()

/* =========================
   비밀번호 변경 상태
========================= */

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const passwordErrorMessage = ref('')
const isChangingPassword = ref(false)

/* =========================
   입력값 초기화
========================= */

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  passwordErrorMessage.value = ''
}

/* =========================
   모달 닫기
========================= */

const closePasswordModal = () => {
  if (isChangingPassword.value) {
    return
  }

  resetPasswordForm()
  emit('close')
}

/* =========================
   비밀번호 변경
========================= */

const submitPasswordChange = async () => {
  passwordErrorMessage.value = ''

  if (!currentPassword.value) {
    passwordErrorMessage.value =
      '현재 비밀번호를 입력해 주세요.'
    return
  }

  if (!newPassword.value) {
    passwordErrorMessage.value =
      '새 비밀번호를 입력해 주세요.'
    return
  }

  if (newPassword.value.length < 8 || newPassword.value.length > 30) {
    passwordErrorMessage.value =
      '새 비밀번호는 8자 이상 30자 이하로 입력해 주세요.'
    return
  }

  if (currentPassword.value === newPassword.value) {
    passwordErrorMessage.value =
      '새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.'
    return
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    passwordErrorMessage.value =
      '새 비밀번호가 일치하지 않습니다.'
    return
  }

  isChangingPassword.value = true

  try {
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    })

    resetPasswordForm()
    emit('close')

    window.alert('비밀번호가 변경되었습니다.')
  } catch (error: unknown) {
    passwordErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '비밀번호를 변경하지 못했습니다.'
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<template>
  <div
    class="password-modal-backdrop"
    @click.self="closePasswordModal"
  >
    <section
      class="password-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <header class="password-modal-header">
        <div>
          <p>PASSWORD</p>
          <h2 id="password-modal-title">
            비밀번호 변경
          </h2>
        </div>

        <button
          class="password-modal-close"
          type="button"
          aria-label="비밀번호 변경 창 닫기"
          @click="closePasswordModal"
        >
          ×
        </button>
      </header>

      <form
        class="password-form"
        @submit.prevent="submitPasswordChange"
      >
        <!-- 현재 비밀번호 -->
        <div class="password-field">
          <label for="current-password">
            현재 비밀번호
          </label>

          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            placeholder="현재 비밀번호"
            :disabled="isChangingPassword"
          />
        </div>

        <!-- 새 비밀번호 -->
        <div class="password-field">
          <label for="new-password">
            새 비밀번호
          </label>

          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="8자 이상 30자 이하"
            :disabled="isChangingPassword"
          />
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="password-field">
          <label for="new-password-confirm">
            새 비밀번호 확인
          </label>

          <input
            id="new-password-confirm"
            v-model="newPasswordConfirm"
            type="password"
            autocomplete="new-password"
            placeholder="새 비밀번호를 다시 입력"
            :disabled="isChangingPassword"
          />
        </div>

        <!-- 오류 메시지 -->
        <p
          v-if="passwordErrorMessage"
          class="password-error-message"
        >
          {{ passwordErrorMessage }}
        </p>

        <!-- 버튼 -->
        <div class="password-modal-actions">
          <button
            class="password-cancel-button"
            type="button"
            :disabled="isChangingPassword"
            @click="closePasswordModal"
          >
            취소
          </button>

          <button
            class="password-submit-button"
            type="submit"
            :disabled="isChangingPassword"
          >
            {{
              isChangingPassword
                ? '변경 중...'
                : '비밀번호 변경'
            }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.password-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.password-modal {
  width: min(440px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
}

.password-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.password-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #4566e8;
}

.password-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222934;
}

.password-modal-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: #747e8c;
  background: #f3f5f8;
  cursor: pointer;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.password-field label {
  font-size: 11px;
  font-weight: 700;
  color: #495362;
}

.password-field input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid #dce2ea;
  border-radius: 9px;
  outline: none;
  box-sizing: border-box;
  font-size: 12px;
  color: #2c3440;
  background: #ffffff;
}

.password-field input:focus {
  border-color: #5878e9;
  box-shadow: 0 0 0 3px rgba(88, 120, 233, 0.11);
}

.password-field input:disabled {
  background: #f5f6f8;
  cursor: not-allowed;
}

.password-error-message {
  margin: -3px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: #c74658;
}

.password-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.password-cancel-button,
.password-submit-button {
  height: 40px;
  padding: 0 15px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.password-cancel-button {
  border: 1px solid #dce2ea;
  color: #66717f;
  background: #ffffff;
}

.password-submit-button {
  border: 0;
  color: #ffffff;
  background: #3565ef;
}

.password-submit-button:hover {
  background: #2958df;
}

.password-cancel-button:disabled,
.password-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* =========================
   모바일
========================= */

@media (max-width: 760px) {
  .password-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .password-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius: 18px 18px 0 0;
  }

  .password-modal-header h2 {
    font-size: 17px;
  }

  .password-form {
    gap: 14px;
    margin-top: 20px;
  }

  .password-field input {
    height: 42px;
  }

  .password-modal-actions {
    margin-top: 6px;
  }

  .password-cancel-button,
  .password-submit-button {
    flex: 1;
    height: 42px;
  }
}
</style>
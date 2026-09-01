<script setup lang="ts">
import { ref } from 'vue'

import { changePassword } from '@/api/auth'
import { ApiError } from '@/api/http'

const emit = defineEmits<{
  close: []
}>()

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const passwordErrorMessage = ref('')
const isChangingPassword = ref(false)

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  passwordErrorMessage.value = ''
}

const closePasswordModal = () => {
  if (isChangingPassword.value) return

  resetPasswordForm()
  emit('close')
}

const submitPasswordChange = async () => {
  passwordErrorMessage.value = ''

  if (!currentPassword.value) {
    passwordErrorMessage.value = '현재 비밀번호를 입력해 주세요.'
    return
  }

  if (!newPassword.value) {
    passwordErrorMessage.value = '새 비밀번호를 입력해 주세요.'
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
    passwordErrorMessage.value = '새 비밀번호가 일치하지 않습니다.'
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
          <h2 id="password-modal-title">비밀번호 변경</h2>
        </div>

        <button
          class="password-modal-close"
          type="button"
          aria-label="비밀번호 변경 창 닫기"
          :disabled="isChangingPassword"
          @click="closePasswordModal"
        >
          ×
        </button>
      </header>

      <form
        class="password-form"
        @submit.prevent="submitPasswordChange"
      >
        <div class="password-field">
          <label for="current-password">현재 비밀번호</label>

          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            placeholder="현재 비밀번호"
            :disabled="isChangingPassword"
          />
        </div>

        <div class="password-field">
          <label for="new-password">새 비밀번호</label>

          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="8자 이상 30자 이하"
            :disabled="isChangingPassword"
          />
        </div>

        <div class="password-field">
          <label for="new-password-confirm">새 비밀번호 확인</label>

          <input
            id="new-password-confirm"
            v-model="newPasswordConfirm"
            type="password"
            autocomplete="new-password"
            placeholder="새 비밀번호를 다시 입력"
            :disabled="isChangingPassword"
          />
        </div>

        <p
          v-if="passwordErrorMessage"
          class="password-error-message"
          role="alert"
        >
          {{ passwordErrorMessage }}
        </p>

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
            {{ isChangingPassword ? '변경 중...' : '비밀번호 변경' }}
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
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
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
  color: var(--tmr-primary);
}

.password-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.password-modal-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.password-modal-close:hover:not(:disabled) {
  color: var(--tmr-primary);
  background: var(--tmr-background);
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
  color: var(--tmr-text);
}

.password-field input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid var(--tmr-border);
  border-radius: 9px;
  outline: none;
  font-size: 12px;
  color: var(--tmr-text);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.password-field input::placeholder {
  color: var(--tmr-text-sub);
}

.password-field input:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 12%, transparent);
}

.password-field input:disabled {
  cursor: not-allowed;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.password-error-message {
  margin: -3px 0 0;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
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
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.password-cancel-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.password-cancel-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.password-submit-button {
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.password-submit-button:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.password-modal-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

.password-modal-close:disabled,
.password-cancel-button:disabled,
.password-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .password-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .password-modal {
    width: 100%;
    max-height: 90vh;
    padding: 20px 17px 24px;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
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
    height: 42px;
    flex: 1;
  }
}
</style>
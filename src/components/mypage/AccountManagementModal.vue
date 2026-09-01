<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteAccount, logout } from '@/api/auth'
import { ApiError } from '@/api/http'

const router = useRouter()

const emit = defineEmits<{
  close: []
}>()

const isDeleteAccountFormOpen = ref(false)
const deleteAccountPassword = ref('')
const accountErrorMessage = ref('')

const isLoggingOut = ref(false)
const isDeletingAccount = ref(false)

const isBusy = computed(
  () => isLoggingOut.value || isDeletingAccount.value,
)

const resetAccountModal = () => {
  isDeleteAccountFormOpen.value = false
  deleteAccountPassword.value = ''
  accountErrorMessage.value = ''
}

const closeAccountModal = () => {
  if (isBusy.value) return

  resetAccountModal()
  emit('close')
}

const handleLogout = async () => {
  if (isBusy.value) return

  isLoggingOut.value = true

  try {
    logout()
    emit('close')

    await router.replace('/login')
  } finally {
    isLoggingOut.value = false
  }
}

const openDeleteAccountForm = () => {
  accountErrorMessage.value = ''
  deleteAccountPassword.value = ''
  isDeleteAccountFormOpen.value = true
}

const closeDeleteAccountForm = () => {
  if (isDeletingAccount.value) return

  isDeleteAccountFormOpen.value = false
  deleteAccountPassword.value = ''
  accountErrorMessage.value = ''
}

const submitDeleteAccount = async () => {
  accountErrorMessage.value = ''

  if (!deleteAccountPassword.value) {
    accountErrorMessage.value = '현재 비밀번호를 입력해 주세요.'
    return
  }

  const confirmed = window.confirm(
    '정말 회원 탈퇴를 진행하시겠습니까?\n\n계정과 내가 만든 여행, 참여 및 초대 정보가 삭제되며 복구할 수 없습니다.',
  )

  if (!confirmed) return

  isDeletingAccount.value = true

  try {
    await deleteAccount({
      password: deleteAccountPassword.value,
    })

    logout()
    resetAccountModal()
    emit('close')

    window.alert('회원 탈퇴가 완료되었습니다.')

    await router.replace('/login')
  } catch (error: unknown) {
    accountErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '회원 탈퇴를 처리하지 못했습니다.'
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<template>
  <div
    class="account-modal-backdrop"
    @click.self="closeAccountModal"
  >
    <section
      class="account-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <header class="account-modal-header">
        <div>
          <p>ACCOUNT</p>
          <h2 id="account-modal-title">계정 관리</h2>
        </div>

        <button
          class="account-modal-close"
          type="button"
          aria-label="계정 관리 창 닫기"
          :disabled="isBusy"
          @click="closeAccountModal"
        >
          ×
        </button>
      </header>

      <div class="account-management-list">
        <section class="account-management-item">
          <div class="account-management-info">
            <strong>로그아웃</strong>
            <span>현재 기기에서 로그아웃합니다.</span>
          </div>

          <button
            class="logout-button"
            type="button"
            :disabled="isBusy"
            @click="handleLogout"
          >
            {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
          </button>
        </section>

        <section class="account-management-item danger-item">
          <div class="account-management-info">
            <strong>회원 탈퇴</strong>
            <span>계정과 관련된 여행 정보를 삭제합니다.</span>
          </div>

          <button
            v-if="!isDeleteAccountFormOpen"
            class="delete-account-open-button"
            type="button"
            :disabled="isBusy"
            @click="openDeleteAccountForm"
          >
            회원 탈퇴
          </button>
        </section>

        <form
          v-if="isDeleteAccountFormOpen"
          class="delete-account-form"
          @submit.prevent="submitDeleteAccount"
        >
          <div class="delete-account-warning">
            <strong>탈퇴 전 확인해 주세요</strong>

            <p>
              회원 탈퇴 시 계정과 내가 만든 여행, 참여 및 초대 정보가
              삭제됩니다. 삭제된 정보는 복구할 수 없습니다.
            </p>
          </div>

          <div class="password-field">
            <label for="delete-account-password">
              현재 비밀번호
            </label>

            <input
              id="delete-account-password"
              v-model="deleteAccountPassword"
              type="password"
              autocomplete="current-password"
              placeholder="현재 비밀번호"
              :disabled="isDeletingAccount"
            />
          </div>

          <p
            v-if="accountErrorMessage"
            class="password-error-message"
            role="alert"
          >
            {{ accountErrorMessage }}
          </p>

          <div class="delete-account-actions">
            <button
              class="delete-account-cancel-button"
              type="button"
              :disabled="isDeletingAccount"
              @click="closeDeleteAccountForm"
            >
              취소
            </button>

            <button
              class="delete-account-submit-button"
              type="submit"
              :disabled="isDeletingAccount"
            >
              {{ isDeletingAccount ? '탈퇴 처리 중...' : '회원 탈퇴' }}
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.account-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.account-modal {
  width: min(460px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
}

.account-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.account-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--tmr-primary);
}

.account-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.account-modal-close {
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

.account-modal-close:hover:not(:disabled) {
  color: var(--tmr-primary);
  background: var(--tmr-background);
}

.account-management-list {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  margin-top: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 12px;
  background: var(--tmr-surface);
}

.account-management-item {
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  background: var(--tmr-surface);
}

.account-management-item + .account-management-item {
  border-top: 1px solid var(--tmr-border);
}

.account-management-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.account-management-info strong {
  font-size: 13px;
  color: var(--tmr-text);
}

.account-management-info span {
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-text-sub);
}

.logout-button,
.delete-account-open-button {
  height: 36px;
  flex-shrink: 0;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.logout-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-primary);
  background: var(--tmr-surface);
}

.logout-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.delete-account-open-button {
  border: 1px solid #efcbd0;
  color: #d94b5b;
  background: #fffafa;
}

.delete-account-open-button:hover:not(:disabled) {
  border-color: #e5a0aa;
  background: #fff1f3;
}

.danger-item {
  background: #fffdfd;
}

.delete-account-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 17px;
  border-top: 1px solid #efcbd0;
  background: #fffafa;
}

.delete-account-warning {
  padding: 13px;
  border: 1px solid #efcbd0;
  border-radius: 9px;
  background: #fff1f3;
}

.delete-account-warning strong {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  color: #d94b5b;
}

.delete-account-warning p {
  margin: 0;
  font-size: 10px;
  line-height: 1.65;
  color: #8b5c63;
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
  color: #d94b5b;
  background: #fff1f3;
}

.delete-account-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.delete-account-cancel-button,
.delete-account-submit-button {
  height: 39px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.delete-account-cancel-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.delete-account-cancel-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.delete-account-submit-button {
  border: 1px solid #d94b5b;
  color: #ffffff;
  background: #d94b5b;
}

.delete-account-submit-button:hover:not(:disabled) {
  border-color: #c83c4c;
  background: #c83c4c;
}

.delete-account-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

.account-modal-close:disabled,
.logout-button:disabled,
.delete-account-open-button:disabled,
.delete-account-cancel-button:disabled,
.delete-account-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .account-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .account-modal {
    width: 100%;
    max-height: 90vh;
    padding: 20px 17px 24px;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 18px 18px 0 0;
  }

  .account-modal-header h2 {
    font-size: 17px;
  }

  .account-management-list {
    margin-top: 20px;
  }

  .account-management-item {
    min-height: 72px;
    gap: 12px;
    padding: 14px;
  }

  .account-management-info strong {
    font-size: 12px;
  }

  .account-management-info span {
    font-size: 9px;
  }

  .logout-button,
  .delete-account-open-button {
    height: 34px;
    padding: 0 11px;
    font-size: 9px;
  }

  .delete-account-form {
    padding: 14px;
  }

  .password-field input {
    height: 42px;
  }

  .delete-account-actions {
    margin-top: 2px;
  }

  .delete-account-cancel-button,
  .delete-account-submit-button {
    height: 42px;
    flex: 1;
  }
}
</style>
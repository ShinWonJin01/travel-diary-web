<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  deleteAccount,
  logout,
} from '@/api/auth'
import { ApiError } from '@/api/http'

const router = useRouter()

/* =========================
   부모에게 보내는 이벤트
========================= */

const emit = defineEmits<{
  close: []
}>()

/* =========================
   계정 관리 상태
========================= */

const isDeleteAccountFormOpen = ref(false)

const deleteAccountPassword = ref('')
const accountErrorMessage = ref('')

const isLoggingOut = ref(false)
const isDeletingAccount = ref(false)

/* =========================
   계정 관리 초기화
========================= */

const resetAccountModal = () => {
  isDeleteAccountFormOpen.value = false
  deleteAccountPassword.value = ''
  accountErrorMessage.value = ''
}

/* =========================
   모달 닫기
========================= */

const closeAccountModal = () => {
  if (isLoggingOut.value || isDeletingAccount.value) {
    return
  }

  resetAccountModal()
  emit('close')
}

/* =========================
   로그아웃
========================= */

const handleLogout = async () => {
  if (isLoggingOut.value || isDeletingAccount.value) {
    return
  }

  isLoggingOut.value = true

  try {
    logout()

    emit('close')

    await router.replace('/login')
  } finally {
    isLoggingOut.value = false
  }
}

/* =========================
   회원 탈퇴 입력창
========================= */

const openDeleteAccountForm = () => {
  accountErrorMessage.value = ''
  deleteAccountPassword.value = ''
  isDeleteAccountFormOpen.value = true
}

const closeDeleteAccountForm = () => {
  if (isDeletingAccount.value) {
    return
  }

  isDeleteAccountFormOpen.value = false
  deleteAccountPassword.value = ''
  accountErrorMessage.value = ''
}

/* =========================
   회원 탈퇴
========================= */

const submitDeleteAccount = async () => {
  accountErrorMessage.value = ''

  if (!deleteAccountPassword.value) {
    accountErrorMessage.value =
      '현재 비밀번호를 입력해 주세요.'
    return
  }

  const confirmed = window.confirm(
    '정말 회원 탈퇴를 진행하시겠습니까?\n\n계정과 내가 만든 여행, 참여 및 초대 정보가 삭제되며 복구할 수 없습니다.',
  )

  if (!confirmed) {
    return
  }

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
          <h2 id="account-modal-title">
            계정 관리
          </h2>
        </div>

        <button
          class="account-modal-close"
          type="button"
          aria-label="계정 관리 창 닫기"
          @click="closeAccountModal"
        >
          ×
        </button>
      </header>

      <div class="account-management-list">
        <!-- 로그아웃 -->
        <section class="account-management-item">
          <div class="account-management-info">
            <strong>로그아웃</strong>
            <span>현재 기기에서 로그아웃합니다.</span>
          </div>

          <button
            class="logout-button"
            type="button"
            :disabled="isLoggingOut || isDeletingAccount"
            @click="handleLogout"
          >
            {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
          </button>
        </section>

        <!-- 회원 탈퇴 -->
        <section class="account-management-item danger-item">
          <div class="account-management-info">
            <strong>회원 탈퇴</strong>
            <span>계정과 관련된 여행 정보를 삭제합니다.</span>
          </div>

          <button
            v-if="!isDeleteAccountFormOpen"
            class="delete-account-open-button"
            type="button"
            :disabled="isLoggingOut || isDeletingAccount"
            @click="openDeleteAccountForm"
          >
            회원 탈퇴
          </button>
        </section>

        <!-- 회원 탈퇴 확인 -->
        <form
          v-if="isDeleteAccountFormOpen"
          class="delete-account-form"
          @submit.prevent="submitDeleteAccount"
        >
          <div class="delete-account-warning">
            <strong>탈퇴 전 확인해 주세요</strong>

            <p>
              회원 탈퇴 시 계정과 내가 만든 여행, 참여 및 초대
              정보가 삭제됩니다. 삭제된 정보는 복구할 수 없습니다.
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
              {{
                isDeletingAccount
                  ? '탈퇴 처리 중...'
                  : '회원 탈퇴'
              }}
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
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
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
  color: #4566e8;
}

.account-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222934;
}

.account-modal-close {
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

.account-management-list {
  display: flex;
  flex-direction: column;
  margin-top: 24px;
  overflow: hidden;
  border: 1px solid #e4e8ee;
  border-radius: 12px;
}

.account-management-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 76px;
  padding: 16px;
  background: #ffffff;
}

.account-management-item + .account-management-item {
  border-top: 1px solid #edf0f4;
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
  color: #28313d;
}

.account-management-info span {
  font-size: 10px;
  line-height: 1.5;
  color: #939ca8;
}

.logout-button,
.delete-account-open-button {
  flex-shrink: 0;
  height: 36px;
  padding: 0 13px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.logout-button {
  border: 1px solid #dce2ea;
  color: #586575;
  background: #ffffff;
}

.logout-button:hover {
  background: #f6f8fa;
}

.delete-account-open-button {
  border: 1px solid #efcbd0;
  color: #c94b59;
  background: #fffafa;
}

.delete-account-open-button:hover {
  background: #fff2f3;
}

.logout-button:disabled,
.delete-account-open-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.danger-item {
  background: #fffdfd;
}

.delete-account-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 17px;
  border-top: 1px solid #edf0f4;
  background: #fffafa;
}

.delete-account-warning {
  padding: 13px;
  border: 1px solid #f0d2d6;
  border-radius: 9px;
  background: #fff5f6;
}

.delete-account-warning strong {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  color: #b63e4d;
}

.delete-account-warning p {
  margin: 0;
  font-size: 10px;
  line-height: 1.65;
  color: #8b5c63;
}

/* 회원 탈퇴 비밀번호 입력 */

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
  cursor: pointer;
}

.delete-account-cancel-button {
  border: 1px solid #dce2ea;
  color: #66717f;
  background: #ffffff;
}

.delete-account-submit-button {
  border: 0;
  color: #ffffff;
  background: #d94b5a;
}

.delete-account-submit-button:hover {
  background: #c83d4c;
}

.delete-account-cancel-button:disabled,
.delete-account-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* =========================
   모바일
========================= */

@media (max-width: 760px) {
  .account-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .account-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius: 18px 18px 0 0;
  }

  .account-modal-header h2 {
    font-size: 17px;
  }

  .account-management-list {
    margin-top: 20px;
  }

  .account-management-item {
    gap: 12px;
    min-height: 72px;
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
    flex: 1;
    height: 42px;
  }
}
</style>
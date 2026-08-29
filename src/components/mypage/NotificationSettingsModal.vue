<script setup lang="ts">
import { onMounted, ref } from 'vue'

import {
  getMemberSettings,
  updateMemberSettings,
  type MemberSettings,
} from '@/api/auth'
import { ApiError } from '@/api/http'

const emit = defineEmits<{
  close: []
}>()

const settings = ref<MemberSettings | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

const closeModal = () => {
  if (isSaving.value) {
    return
  }

  emit('close')
}

const loadSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    settings.value = await getMemberSettings()
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : '알림 설정을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  if (!settings.value || isSaving.value) {
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  try {
    settings.value = await updateMemberSettings({
      invitationNotificationEnabled:
        settings.value.invitationNotificationEnabled,
      activityNotificationEnabled:
        settings.value.activityNotificationEnabled,
    })

    window.alert('알림 설정을 저장했습니다.')
    emit('close')
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : '알림 설정을 저장하지 못했습니다.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  void loadSettings()
})
</script>

<template>
  <div
    class="settings-modal-backdrop"
    @click.self="closeModal"
  >
    <section
      class="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-settings-title"
    >
      <header class="settings-modal-header">
        <div>
          <p>NOTIFICATION</p>
          <h2 id="notification-settings-title">
            알림 설정
          </h2>
        </div>

        <button
          class="settings-modal-close"
          type="button"
          aria-label="알림 설정 창 닫기"
          @click="closeModal"
        >
          ×
        </button>
      </header>

      <div
        v-if="isLoading"
        class="settings-state"
      >
        알림 설정을 불러오는 중입니다.
      </div>

      <template v-else-if="settings">
        <div class="settings-list">
          <div class="settings-item">
            <div class="settings-information">
              <strong>여행 초대 알림</strong>
              <span>
                다른 사용자가 여행에 초대했을 때 알림을 받습니다.
              </span>
            </div>

            <label class="toggle">
              <input
                v-model="settings.invitationNotificationEnabled"
                type="checkbox"
                :disabled="isSaving"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="settings-item">
            <div class="settings-information">
              <strong>여행 활동 알림</strong>
              <span>
                초대 수락·거절과 참여자 활동에 대한 알림을 받습니다.
              </span>
            </div>

            <label class="toggle">
              <input
                v-model="settings.activityNotificationEnabled"
                type="checkbox"
                :disabled="isSaving"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="settings-error-message"
        >
          {{ errorMessage }}
        </p>

        <div class="settings-actions">
          <button
            class="settings-cancel-button"
            type="button"
            :disabled="isSaving"
            @click="closeModal"
          >
            취소
          </button>

          <button
            class="settings-save-button"
            type="button"
            :disabled="isSaving"
            @click="saveSettings"
          >
            {{ isSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </template>

      <div
        v-else
        class="settings-state settings-error-state"
      >
        <p>{{ errorMessage }}</p>

        <button
          type="button"
          @click="loadSettings"
        >
          다시 시도
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.settings-modal {
  width: min(460px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
}

.settings-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.settings-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #4566e8;
}

.settings-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222934;
}

.settings-modal-close {
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

.settings-list {
  margin-top: 24px;
  overflow: hidden;
  border: 1px solid #e4e8ee;
  border-radius: 12px;
}

.settings-item {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  background: #ffffff;
}

.settings-item + .settings-item {
  border-top: 1px solid #edf0f4;
}

.settings-information {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.settings-information strong {
  font-size: 13px;
  color: #28313d;
}

.settings-information span {
  font-size: 10px;
  line-height: 1.5;
  color: #939ca8;
}

.toggle {
  position: relative;
  flex-shrink: 0;
  width: 42px;
  height: 24px;
  cursor: pointer;
}

.toggle input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #d8dde5;
  transition: 0.2s;
}

.toggle-slider::before {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(35, 44, 58, 0.22);
  transition: 0.2s;
  content: '';
}

.toggle input:checked + .toggle-slider {
  background: #4566e8;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle input:disabled + .toggle-slider {
  cursor: not-allowed;
  opacity: 0.6;
}

.settings-state {
  margin-top: 24px;
  padding: 24px 16px;
  border: 1px solid #e4e8ee;
  border-radius: 12px;
  font-size: 11px;
  color: #7d8794;
  text-align: center;
}

.settings-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.settings-error-state p {
  margin: 0;
}

.settings-error-state button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #dce2ea;
  border-radius: 8px;
  font-size: 10px;
  color: #586575;
  background: #ffffff;
  cursor: pointer;
}

.settings-error-message {
  margin: 12px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: #c74658;
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.settings-cancel-button,
.settings-save-button {
  height: 39px;
  padding: 0 16px;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.settings-cancel-button {
  border: 1px solid #dce2ea;
  color: #66717f;
  background: #ffffff;
}

.settings-save-button {
  border: 0;
  color: #ffffff;
  background: #4566e8;
}

.settings-save-button:hover {
  background: #3858d2;
}

.settings-cancel-button:disabled,
.settings-save-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .settings-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .settings-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius: 18px 18px 0 0;
  }

  .settings-modal-header h2 {
    font-size: 17px;
  }

  .settings-list {
    margin-top: 20px;
  }

  .settings-item {
    min-height: 72px;
    gap: 12px;
    padding: 14px;
  }

  .settings-information strong {
    font-size: 12px;
  }

  .settings-information span {
    font-size: 9px;
  }

  .settings-actions {
    margin-top: 16px;
  }

  .settings-cancel-button,
  .settings-save-button {
    flex: 1;
    height: 42px;
  }
}
</style>
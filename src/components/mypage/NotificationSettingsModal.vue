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
  if (isSaving.value) return

  emit('close')
}

const loadSettings = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    settings.value = await getMemberSettings()
  } catch (error: unknown) {
    settings.value = null
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : '알림 설정을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const saveSettings = async () => {
  const currentSettings = settings.value

  if (!currentSettings || isSaving.value) return

  isSaving.value = true
  errorMessage.value = ''

  try {
    settings.value = await updateMemberSettings({
      invitationNotificationEnabled:
        currentSettings.invitationNotificationEnabled,
      activityNotificationEnabled:
        currentSettings.activityNotificationEnabled,
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
          <h2 id="notification-settings-title">알림 설정</h2>
        </div>

        <button
          class="settings-modal-close"
          type="button"
          aria-label="알림 설정 창 닫기"
          :disabled="isSaving"
          @click="closeModal"
        >
          ×
        </button>
      </header>

      <div v-if="isLoading" class="settings-state">
        <span class="settings-loading-spinner"></span>
        <span>알림 설정을 불러오는 중입니다.</span>
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

            <label
              class="toggle"
              :class="{ disabled: isSaving }"
            >
              <input
                v-model="settings.invitationNotificationEnabled"
                type="checkbox"
                :disabled="isSaving"
                aria-label="여행 초대 알림"
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

            <label
              class="toggle"
              :class="{ disabled: isSaving }"
            >
              <input
                v-model="settings.activityNotificationEnabled"
                type="checkbox"
                :disabled="isSaving"
                aria-label="여행 활동 알림"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <p
          v-if="errorMessage"
          class="settings-error-message"
          role="alert"
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
        role="alert"
      >
        <p>{{ errorMessage }}</p>

        <button type="button" @click="loadSettings">
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
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
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
  color: var(--tmr-primary);
}

.settings-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.settings-modal-close {
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

.settings-modal-close:hover:not(:disabled) {
  color: var(--tmr-primary);
  background: var(--tmr-background);
}

.settings-list {
  overflow: hidden;
  margin-top: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 12px;
  background: var(--tmr-surface);
}

.settings-item {
  display: flex;
  min-height: 78px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px;
  background: var(--tmr-surface);
}

.settings-item + .settings-item {
  border-top: 1px solid var(--tmr-border);
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
  color: var(--tmr-text);
}

.settings-information span {
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-text-sub);
}

.toggle {
  position: relative;
  width: 42px;
  height: 24px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle.disabled {
  cursor: not-allowed;
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
  background: var(--tmr-border);
  transition: background 0.2s ease;
}

.toggle-slider::before {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  content: '';
  background: var(--tmr-surface);
  box-shadow: 0 1px 4px rgba(36, 48, 66, 0.22);
  transition: transform 0.2s ease;
}

.toggle input:checked + .toggle-slider {
  background: var(--tmr-primary);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle input:focus-visible + .toggle-slider {
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 16%, transparent);
}

.toggle input:disabled + .toggle-slider {
  opacity: 0.6;
}

.settings-state {
  display: flex;
  min-height: 110px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  margin-top: 24px;
  padding: 24px 16px;
  border: 1px solid var(--tmr-border);
  border-radius: 12px;
  font-size: 11px;
  color: var(--tmr-text-sub);
  text-align: center;
  background: var(--tmr-surface);
}

.settings-loading-spinner {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 2px solid var(--tmr-border);
  border-top-color: var(--tmr-primary);
  border-radius: 50%;
  animation: settings-spin 0.8s linear infinite;
}

.settings-error-state {
  flex-direction: column;
  gap: 12px;
}

.settings-error-state p {
  margin: 0;
  color: var(--tmr-accent);
}

.settings-error-state button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--tmr-border);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-primary);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.settings-error-state button:hover {
  border-color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.settings-error-message {
  margin: 12px 0 0;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
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
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.settings-cancel-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.settings-cancel-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.settings-save-button {
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.settings-save-button:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.settings-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

.settings-modal-close:disabled,
.settings-cancel-button:disabled,
.settings-save-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@keyframes settings-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .settings-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .settings-modal {
    width: 100%;
    max-height: 90vh;
    padding: 20px 17px 24px;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
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

  .settings-state {
    min-height: 100px;
    margin-top: 20px;
  }

  .settings-actions {
    margin-top: 16px;
  }

  .settings-cancel-button,
  .settings-save-button {
    height: 42px;
    flex: 1;
  }
}
</style>
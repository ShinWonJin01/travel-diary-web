<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import {
  resetProfileImage,
  updateProfile,
  uploadProfileImage,
  type Member,
} from '@/api/auth'
import { ApiError } from '@/api/http'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

const props = defineProps<{
  member: Member
  profileInitial: string
  profileImageUrl: string | null
}>()

const emit = defineEmits<{
  close: []
  updated: [member: Member]
}>()

const profileName = ref(props.member.name)
const profileNickname = ref(props.member.nickname)
const profileErrorMessage = ref('')
const isUpdatingProfile = ref(false)

const profileImageFile = ref<File | null>(null)
const profileImagePreviewUrl = ref<string | null>(null)
const isProfileImageBroken = ref(false)
const shouldResetProfileImage = ref(false)

const displayedProfileImageUrl = computed(() => {
  if (shouldResetProfileImage.value) return null

  return profileImagePreviewUrl.value ?? props.profileImageUrl
})

const canResetProfileImage = computed(() =>
  Boolean(profileImageFile.value || props.member.profileImagePath),
)

const clearProfileImageSelection = () => {
  if (profileImagePreviewUrl.value) {
    URL.revokeObjectURL(profileImagePreviewUrl.value)
  }

  profileImageFile.value = null
  profileImagePreviewUrl.value = null
}

const closeProfileModal = () => {
  if (isUpdatingProfile.value) return

  clearProfileImageSelection()
  emit('close')
}

const handleProfileImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    profileErrorMessage.value =
      'JPG, PNG 또는 WEBP 이미지만 등록할 수 있습니다.'
    input.value = ''
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    profileErrorMessage.value =
      '프로필 이미지는 10MB 이하로 등록해 주세요.'
    input.value = ''
    return
  }

  clearProfileImageSelection()

  shouldResetProfileImage.value = false
  profileImageFile.value = file
  profileImagePreviewUrl.value = URL.createObjectURL(file)
  isProfileImageBroken.value = false
  profileErrorMessage.value = ''
  input.value = ''
}

const handleResetProfileImage = () => {
  if (isUpdatingProfile.value) return

  profileErrorMessage.value = ''
  clearProfileImageSelection()

  shouldResetProfileImage.value = Boolean(
    props.member.profileImagePath,
  )
  isProfileImageBroken.value = false
}

const submitProfileUpdate = async () => {
  profileErrorMessage.value = ''

  const name = profileName.value.trim()
  const nickname = profileNickname.value.trim()

  if (!name) {
    profileErrorMessage.value = '이름을 입력해 주세요.'
    return
  }

  if (name.length > 50) {
    profileErrorMessage.value = '이름은 50자 이하로 입력해 주세요.'
    return
  }

  if (!nickname) {
    profileErrorMessage.value = '닉네임을 입력해 주세요.'
    return
  }

  if (nickname.length < 2 || nickname.length > 20) {
    profileErrorMessage.value =
      '닉네임은 2자 이상 20자 이하로 입력해 주세요.'
    return
  }

  isUpdatingProfile.value = true

  try {
    let updatedMember = await updateProfile({
      name,
      nickname,
    })

    emit('updated', updatedMember)

    if (shouldResetProfileImage.value) {
      updatedMember = await resetProfileImage()
      emit('updated', updatedMember)
    } else if (profileImageFile.value) {
      updatedMember = await uploadProfileImage(
        profileImageFile.value,
      )
      emit('updated', updatedMember)
    }

    isProfileImageBroken.value = false
    shouldResetProfileImage.value = false

    clearProfileImageSelection()
    emit('close')

    window.alert('프로필이 수정되었습니다.')
  } catch (error: unknown) {
    profileErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '프로필을 수정하지 못했습니다.'
  } finally {
    isUpdatingProfile.value = false
  }
}

onBeforeUnmount(clearProfileImageSelection)
</script>

<template>
  <div
    class="profile-modal-backdrop"
    @click.self="closeProfileModal"
  >
    <section
      class="profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <header class="profile-modal-header">
        <div>
          <p>PROFILE</p>
          <h2 id="profile-modal-title">프로필 수정</h2>
        </div>

        <button
          class="profile-modal-close"
          type="button"
          aria-label="프로필 수정 창 닫기"
          :disabled="isUpdatingProfile"
          @click="closeProfileModal"
        >
          ×
        </button>
      </header>

      <form
        class="profile-form"
        @submit.prevent="submitProfileUpdate"
      >
        <div class="profile-edit-avatar">
          <div class="profile-edit-avatar-circle">
            <img
              v-if="
                displayedProfileImageUrl &&
                !isProfileImageBroken
              "
              :src="displayedProfileImageUrl"
              alt="프로필 사진 미리보기"
              @error="isProfileImageBroken = true"
            />

            <span v-else>
              {{ profileInitial }}
            </span>
          </div>

          <div class="profile-image-control">
            <strong>프로필 사진</strong>

            <div class="profile-image-actions">
              <label
                class="profile-image-button"
                :class="{ disabled: isUpdatingProfile }"
                for="profile-image"
              >
                사진 변경
              </label>

              <button
                class="profile-image-reset-button"
                type="button"
                :disabled="
                  isUpdatingProfile ||
                  !canResetProfileImage
                "
                @click="handleResetProfileImage"
              >
                기본 이미지로 변경
              </button>
            </div>

            <input
              id="profile-image"
              class="profile-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              :disabled="isUpdatingProfile"
              @change="handleProfileImageChange"
            />

            <p>JPG, PNG, WEBP · 최대 10MB</p>
          </div>
        </div>

        <div class="profile-field">
          <label for="profile-name">이름</label>

          <input
            id="profile-name"
            v-model="profileName"
            type="text"
            autocomplete="name"
            maxlength="50"
            placeholder="이름"
            :disabled="isUpdatingProfile"
          />
        </div>

        <div class="profile-field">
          <label for="profile-nickname">닉네임</label>

          <input
            id="profile-nickname"
            v-model="profileNickname"
            type="text"
            maxlength="20"
            placeholder="2자 이상 20자 이하"
            :disabled="isUpdatingProfile"
          />
        </div>

        <div class="profile-field">
          <label for="profile-email">이메일</label>

          <input
            id="profile-email"
            :value="member.email"
            type="email"
            disabled
          />

          <span class="profile-field-help">
            이메일은 현재 프로필 수정에서 변경할 수 없습니다.
          </span>
        </div>

        <p
          v-if="profileErrorMessage"
          class="profile-error-message"
          role="alert"
        >
          {{ profileErrorMessage }}
        </p>

        <div class="profile-modal-actions">
          <button
            class="profile-cancel-button"
            type="button"
            :disabled="isUpdatingProfile"
            @click="closeProfileModal"
          >
            취소
          </button>

          <button
            class="profile-submit-button"
            type="submit"
            :disabled="isUpdatingProfile"
          >
            {{ isUpdatingProfile ? '저장 중...' : '저장' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.profile-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.profile-modal {
  width: min(440px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
}

.profile-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.profile-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--tmr-primary);
}

.profile-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.profile-modal-close {
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

.profile-modal-close:hover:not(:disabled) {
  color: var(--tmr-primary);
  background: var(--tmr-background);
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.profile-edit-avatar {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px;
  border: 1px solid var(--tmr-border);
  border-radius: 11px;
  background: var(--tmr-surface-soft);
}

.profile-edit-avatar-circle {
  display: flex;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--tmr-surface);
  border-radius: 50%;
  font-size: 17px;
  font-weight: 700;
  color: var(--tmr-surface);
  background: linear-gradient(
    145deg,
    var(--tmr-primary),
    var(--tmr-primary-dark)
  );
}

.profile-edit-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-image-control {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.profile-image-control strong {
  font-size: 11px;
  color: var(--tmr-text);
}

.profile-image-control p {
  margin: 5px 0 0;
  font-size: 9px;
  line-height: 1.5;
  color: var(--tmr-text-sub);
}

.profile-image-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 7px;
}

.profile-image-button,
.profile-image-reset-button {
  display: inline-flex;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0 11px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.profile-image-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-primary);
  background: var(--tmr-surface);
  cursor: pointer;
}

.profile-image-button:hover {
  border-color: var(--tmr-primary);
  background: var(--tmr-background);
}

.profile-image-button.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.profile-image-reset-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.profile-image-reset-button:hover:not(:disabled) {
  color: var(--tmr-text);
  background: var(--tmr-background);
}

.profile-image-reset-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.profile-image-input {
  display: none;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.profile-field label {
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-text);
}

.profile-field input {
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
    box-shadow 0.2s ease;
}

.profile-field input::placeholder {
  color: var(--tmr-text-sub);
}

.profile-field input:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 12%, transparent);
}

.profile-field input:disabled {
  cursor: not-allowed;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.profile-field-help {
  font-size: 9px;
  color: var(--tmr-text-sub);
}

.profile-error-message {
  margin: -3px 0 0;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.profile-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.profile-cancel-button,
.profile-submit-button {
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

.profile-cancel-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.profile-cancel-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.profile-submit-button {
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.profile-submit-button:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.profile-modal-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

.profile-modal-close:disabled,
.profile-cancel-button:disabled,
.profile-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .profile-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .profile-modal {
    width: 100%;
    max-height: 90vh;
    padding: 20px 17px 24px;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 18px 18px 0 0;
  }

  .profile-modal-header h2 {
    font-size: 17px;
  }

  .profile-form {
    gap: 14px;
    margin-top: 20px;
  }

  .profile-edit-avatar {
    padding: 12px;
  }

  .profile-edit-avatar-circle {
    width: 48px;
    height: 48px;
  }

  .profile-field input {
    height: 42px;
  }

  .profile-modal-actions {
    margin-top: 6px;
  }

  .profile-cancel-button,
  .profile-submit-button {
    height: 42px;
    flex: 1;
  }
}
</style>
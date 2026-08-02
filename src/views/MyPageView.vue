<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
} from 'vue'
import { useRouter } from 'vue-router'

import {
  changePassword,
  deleteAccount,
  getStoredMember,
  logout,
  resetProfileImage,
  updateProfile,
  uploadProfileImage,
  type Member,
} from '@/api/auth'
import { ApiError } from '@/api/http'

interface MyPageMenu {
  id: string
  title: string
  description: string
}

const router = useRouter()

/* =========================
   현재 로그인 회원
========================= */

const currentMember = ref<Member | null>(
  getStoredMember(),
)

const profileInitial = computed(() => {
  const name =
    currentMember.value?.name.trim()

  if (!name) {
    return '?'
  }

  return name.charAt(0)
})

/* =========================
   설정 메뉴
========================= */

const menuItems: MyPageMenu[] = [
  {
    id: 'profile',
    title: '프로필 수정',
    description:
      '이름, 닉네임과 프로필 사진을 변경합니다.',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    description:
      '여행 초대와 활동 알림을 설정합니다.',
  },
  {
    id: 'privacy',
    title: '개인정보·위치 설정',
    description:
      '개인정보와 사진 위치정보 사용 범위를 설정합니다.',
  },
  {
    id: 'password',
    title: '비밀번호 변경',
    description:
      '계정의 비밀번호를 변경합니다.',
  },
  {
    id: 'account',
    title: '계정 관리',
    description:
      '로그아웃과 회원 탈퇴를 관리합니다.',
  },
]

/* =========================
   프로필 수정
========================= */

const isProfileModalOpen = ref(false)

const profileName = ref('')
const profileNickname = ref('')

const profileErrorMessage = ref('')
const isUpdatingProfile = ref(false)

const profileImageFile =
  ref<File | null>(null)

const profileImagePreviewUrl =
  ref<string | null>(null)

const isProfileImageBroken =
  ref(false)

const shouldResetProfileImage =
  ref(false)

/* =========================
   백엔드 이미지 주소
========================= */

const backendBaseUrl = (() => {
  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL as
      | string
      | undefined

  if (
    !configuredUrl
    || configuredUrl.startsWith('/')
  ) {
    return 'http://localhost:8080'
  }

  return configuredUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
})()

const profileImageUrl = computed(() => {
  const path =
    currentMember.value?.profileImagePath

  if (!path) {
    return null
  }

  if (
    path.startsWith('http://')
    || path.startsWith('https://')
  ) {
    return path
  }

  return `${backendBaseUrl}${
    path.startsWith('/')
      ? path
      : `/${path}`
  }`
})

const displayedProfileImageUrl = computed(() => {
  if (shouldResetProfileImage.value) {
    return null
  }

  return (
    profileImagePreviewUrl.value
    ?? profileImageUrl.value
  )
})

const canResetProfileImage = computed(() => {
  return Boolean(
    profileImageFile.value
    || currentMember.value?.profileImagePath,
  )
})

/* =========================
   비밀번호 변경
========================= */

const isPasswordModalOpen = ref(false)

const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')

const passwordErrorMessage = ref('')
const isChangingPassword = ref(false)

/* =========================
   계정 관리
========================= */

const isAccountModalOpen = ref(false)
const isDeleteAccountFormOpen = ref(false)

const deleteAccountPassword = ref('')
const accountErrorMessage = ref('')

const isLoggingOut = ref(false)
const isDeletingAccount = ref(false)

/* =========================
   설정 메뉴 클릭
========================= */

const handleMenuClick = (
  menuId: string,
) => {
  if (menuId === 'profile') {
    openProfileModal()
    return
  }

  if (menuId === 'password') {
    openPasswordModal()
    return
  }

  if (menuId === 'account') {
    openAccountModal()
  }
}

/* =========================
   프로필 수정 모달
========================= */

const clearProfileImageSelection =
  () => {
    if (
      profileImagePreviewUrl.value
    ) {
      URL.revokeObjectURL(
        profileImagePreviewUrl.value,
      )
    }

    profileImageFile.value = null
    profileImagePreviewUrl.value = null
  }

const resetProfileForm = () => {
  profileName.value = ''
  profileNickname.value = ''
  profileErrorMessage.value = ''

  shouldResetProfileImage.value =
    false

  clearProfileImageSelection()
}

const openProfileModal = () => {
  const member = currentMember.value

  if (!member) {
    window.alert(
      '회원 정보를 불러오지 못했습니다.',
    )
    return
  }

  profileName.value =
    member.name

  profileNickname.value =
    member.nickname

  profileErrorMessage.value = ''
  isProfileImageBroken.value = false

  shouldResetProfileImage.value =
    false

  clearProfileImageSelection()

  isProfileModalOpen.value = true
}

const closeProfileModal = () => {
  if (isUpdatingProfile.value) {
    return
  }

  isProfileModalOpen.value = false

  resetProfileForm()
}

const handleProfileImageChange = (
  event: Event,
) => {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  if (!file) {
    return
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (
    !allowedTypes.includes(file.type)
  ) {
    profileErrorMessage.value =
      'JPG, PNG 또는 WEBP 이미지만 등록할 수 있습니다.'

    input.value = ''
    return
  }

  if (
    file.size
    > 10 * 1024 * 1024
  ) {
    profileErrorMessage.value =
      '프로필 이미지는 10MB 이하로 등록해 주세요.'

    input.value = ''
    return
  }

  clearProfileImageSelection()

  shouldResetProfileImage.value =
    false

  profileImageFile.value =
    file

  profileImagePreviewUrl.value =
    URL.createObjectURL(file)

  isProfileImageBroken.value =
    false

  profileErrorMessage.value = ''
}

const handleResetProfileImage = () => {
  profileErrorMessage.value = ''

  if (isUpdatingProfile.value) {
    return
  }

  clearProfileImageSelection()

  if (
    currentMember.value?.profileImagePath
  ) {
    shouldResetProfileImage.value =
      true
  } else {
    shouldResetProfileImage.value =
      false
  }

  isProfileImageBroken.value =
    false
}

const submitProfileUpdate = async () => {
  profileErrorMessage.value = ''

  const name =
    profileName.value.trim()

  const nickname =
    profileNickname.value.trim()

  if (!name) {
    profileErrorMessage.value =
      '이름을 입력해 주세요.'
    return
  }

  if (name.length > 50) {
    profileErrorMessage.value =
      '이름은 50자 이하로 입력해 주세요.'
    return
  }

  if (!nickname) {
    profileErrorMessage.value =
      '닉네임을 입력해 주세요.'
    return
  }

  if (
    nickname.length < 2
    || nickname.length > 20
  ) {
    profileErrorMessage.value =
      '닉네임은 2자 이상 20자 이하로 입력해 주세요.'
    return
  }

  isUpdatingProfile.value = true

  try {
    let updatedMember =
      await updateProfile({
        name,
        nickname,
      })

    /*
     * 이름과 닉네임 수정은 이미 성공했으므로
     * 현재 화면에도 먼저 반영
     */
    currentMember.value =
      updatedMember

    /*
     * 기본 이미지로 변경을 선택한 경우
     */
    if (shouldResetProfileImage.value) {
      updatedMember =
        await resetProfileImage()

      currentMember.value =
        updatedMember
    }

    /*
     * 새 프로필 사진을 선택한 경우
     */
    else if (profileImageFile.value) {
      updatedMember =
        await uploadProfileImage(
          profileImageFile.value,
        )

      currentMember.value =
        updatedMember
    }

    isProfileImageBroken.value =
      false

    shouldResetProfileImage.value =
      false

    clearProfileImageSelection()

    isProfileModalOpen.value =
      false

    resetProfileForm()

    window.alert(
      '프로필이 수정되었습니다.',
    )
  } catch (error: unknown) {
    profileErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '프로필을 수정하지 못했습니다.'
  } finally {
    isUpdatingProfile.value =
      false
  }
}

/* =========================
   비밀번호 변경 모달
========================= */

const openPasswordModal = () => {
  passwordErrorMessage.value = ''
  isPasswordModalOpen.value = true
}

const resetPasswordForm = () => {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  passwordErrorMessage.value = ''
}

const closePasswordModal = () => {
  if (isChangingPassword.value) {
    return
  }

  isPasswordModalOpen.value = false
  resetPasswordForm()
}

const submitPasswordChange =
  async () => {
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

    if (
      newPassword.value.length < 8
      || newPassword.value.length
        > 30
    ) {
      passwordErrorMessage.value =
        '새 비밀번호는 8자 이상 30자 이하로 입력해 주세요.'
      return
    }

    if (
      currentPassword.value
      === newPassword.value
    ) {
      passwordErrorMessage.value =
        '새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.'
      return
    }

    if (
      newPassword.value
      !== newPasswordConfirm.value
    ) {
      passwordErrorMessage.value =
        '새 비밀번호가 일치하지 않습니다.'
      return
    }

    isChangingPassword.value = true

    try {
      await changePassword({
        currentPassword:
          currentPassword.value,

        newPassword:
          newPassword.value,
      })

      isPasswordModalOpen.value =
        false

      resetPasswordForm()

      window.alert(
        '비밀번호가 변경되었습니다.',
      )
    } catch (error: unknown) {
      passwordErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '비밀번호를 변경하지 못했습니다.'
    } finally {
      isChangingPassword.value =
        false
    }
  }

/* =========================
   계정 관리 모달
========================= */

const resetAccountModal = () => {
  isDeleteAccountFormOpen.value =
    false

  deleteAccountPassword.value = ''
  accountErrorMessage.value = ''
}

const openAccountModal = () => {
  resetAccountModal()

  isAccountModalOpen.value = true
}

const closeAccountModal = () => {
  if (
    isLoggingOut.value
    || isDeletingAccount.value
  ) {
    return
  }

  isAccountModalOpen.value = false

  resetAccountModal()
}

/* =========================
   로그아웃
========================= */

const handleLogout = async () => {
  if (
    isLoggingOut.value
    || isDeletingAccount.value
  ) {
    return
  }

  isLoggingOut.value = true

  try {
    logout()

    isAccountModalOpen.value =
      false

    await router.replace('/login')
  } finally {
    isLoggingOut.value = false
  }
}

/* =========================
   회원 탈퇴
========================= */

const openDeleteAccountForm =
  () => {
    accountErrorMessage.value = ''

    deleteAccountPassword.value =
      ''

    isDeleteAccountFormOpen.value =
      true
  }

const closeDeleteAccountForm =
  () => {
    if (isDeletingAccount.value) {
      return
    }

    isDeleteAccountFormOpen.value =
      false

    deleteAccountPassword.value =
      ''

    accountErrorMessage.value = ''
  }

const submitDeleteAccount =
  async () => {
    accountErrorMessage.value = ''

    if (
      !deleteAccountPassword.value
    ) {
      accountErrorMessage.value =
        '현재 비밀번호를 입력해 주세요.'
      return
    }

    const confirmed =
      window.confirm(
        '정말 회원 탈퇴를 진행하시겠습니까?\n\n계정과 내가 만든 여행, 참여 및 초대 정보가 삭제되며 복구할 수 없습니다.',
      )

    if (!confirmed) {
      return
    }

    isDeletingAccount.value = true

    try {
      await deleteAccount({
        password:
          deleteAccountPassword.value,
      })

      logout()

      isAccountModalOpen.value =
        false

      resetAccountModal()

      window.alert(
        '회원 탈퇴가 완료되었습니다.',
      )

      await router.replace('/login')
    } catch (error: unknown) {
      accountErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '회원 탈퇴를 처리하지 못했습니다.'
    } finally {
      isDeletingAccount.value =
        false
    }
  }

/* =========================
   미리보기 URL 정리
========================= */

onBeforeUnmount(() => {
  clearProfileImageSelection()
})
</script>

<template>
  <section class="mypage-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <p>MY PAGE</p>
      <h1>마이페이지</h1>
    </div>

    <div class="mypage-content">
      <!-- 사용자 프로필 -->
      <section class="profile-card">
        <div class="profile-avatar">
          <img
            v-if="
              profileImageUrl
              && !isProfileImageBroken
            "
            :src="profileImageUrl"
            alt="프로필 사진"
            @error="
              isProfileImageBroken = true
            "
          />

          <span v-else>
            {{ profileInitial }}
          </span>
        </div>

        <div class="profile-information">
          <h2>
            {{
              currentMember?.name
              ?? '사용자'
            }}
          </h2>

          <p>
            {{
              currentMember?.email
              ?? ''
            }}
          </p>

          <span
            v-if="currentMember"
            class="profile-nickname"
          >
            {{ currentMember.nickname }}
          </span>
        </div>
      </section>

      <!-- 여행 정보 -->
      <section class="trip-summary">
        <div class="summary-item">
          <strong>5</strong>
          <span>전체 여행</span>
        </div>

        <div
          class="summary-divider"
        ></div>

        <div class="summary-item">
          <strong>3</strong>
          <span>내가 만든 여행</span>
        </div>

        <div
          class="summary-divider"
        ></div>

        <div class="summary-item">
          <strong>2</strong>
          <span>참여 중</span>
        </div>
      </section>

      <!-- 설정 메뉴 -->
      <section class="settings-section">
        <h2>계정 및 설정</h2>

        <div class="settings-list">
          <button
            v-for="item in menuItems"
            :key="item.id"
            class="settings-item"
            type="button"
            @click="
              handleMenuClick(item.id)
            "
          >
            <span class="settings-icon">
              <svg
                v-if="
                  item.id === 'profile'
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />

                <path
                  d="M4 21c0-5 3-8 8-8s8 3 8 8"
                />
              </svg>

              <svg
                v-else-if="
                  item.id
                  === 'notifications'
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                />
              </svg>

              <svg
                v-else-if="
                  item.id === 'privacy'
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6z"
                />

                <circle
                  cx="12"
                  cy="11"
                  r="2"
                />
              </svg>

              <svg
                v-else-if="
                  item.id === 'password'
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                />

                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                />
              </svg>

              <svg
                v-else
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path
                  d="M8 12h8M12 8v8"
                />
              </svg>
            </span>

            <span
              class="settings-information"
            >
              <strong>
                {{ item.title }}
              </strong>

              <span>
                {{ item.description }}
              </span>
            </span>

            <span
              class="settings-arrow"
            >
              ›
            </span>
          </button>
        </div>
      </section>
    </div>
  </section>

  <!-- 프로필 수정 모달 -->
  <div
    v-if="isProfileModalOpen"
    class="profile-modal-backdrop"
    @click.self="closeProfileModal"
  >
    <section
      class="profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <header
        class="profile-modal-header"
      >
        <div>
          <p>PROFILE</p>

          <h2
            id="profile-modal-title"
          >
            프로필 수정
          </h2>
        </div>

        <button
          class="profile-modal-close"
          type="button"
          aria-label="프로필 수정 창 닫기"
          @click="closeProfileModal"
        >
          ×
        </button>
      </header>

      <form
        class="profile-form"
        @submit.prevent="
          submitProfileUpdate
        "
      >
        <!-- 프로필 사진 -->
        <div
          class="profile-edit-avatar"
        >
          <div
            class="profile-edit-avatar-circle"
          >
            <img
              v-if="
                displayedProfileImageUrl
                && !isProfileImageBroken
              "
              :src="
                displayedProfileImageUrl
              "
              alt="프로필 사진 미리보기"
              @error="
                isProfileImageBroken = true
              "
            />

            <span v-else>
              {{ profileInitial }}
            </span>
          </div>

          <div
            class="profile-image-control"
          >
            <strong>
              프로필 사진
            </strong>

            <div class="profile-image-actions">
              <label
                class="profile-image-button"
                for="profile-image"
              >
                사진 변경
              </label>

              <button
                class="profile-image-reset-button"
                type="button"
                :disabled="
                  isUpdatingProfile
                  || !canResetProfileImage
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

            <p>
              JPG, PNG, WEBP · 최대 10MB
            </p>
          </div>
        </div>

        <!-- 이름 -->
        <div class="profile-field">
          <label for="profile-name">
            이름
          </label>

          <input
            id="profile-name"
            v-model="profileName"
            type="text"
            autocomplete="name"
            maxlength="50"
            placeholder="이름"
            :disabled="
              isUpdatingProfile
            "
          />
        </div>

        <!-- 닉네임 -->
        <div class="profile-field">
          <label
            for="profile-nickname"
          >
            닉네임
          </label>

          <input
            id="profile-nickname"
            v-model="profileNickname"
            type="text"
            maxlength="20"
            placeholder="2자 이상 20자 이하"
            :disabled="
              isUpdatingProfile
            "
          />
        </div>

        <!-- 이메일 -->
        <div class="profile-field">
          <label for="profile-email">
            이메일
          </label>

          <input
            id="profile-email"
            :value="
              currentMember?.email
              ?? ''
            "
            type="email"
            disabled
          />

          <span
            class="profile-field-help"
          >
            이메일은 현재 프로필
            수정에서 변경할 수 없습니다.
          </span>
        </div>

        <p
          v-if="
            profileErrorMessage
          "
          class="profile-error-message"
        >
          {{ profileErrorMessage }}
        </p>

        <div
          class="profile-modal-actions"
        >
          <button
            class="profile-cancel-button"
            type="button"
            :disabled="
              isUpdatingProfile
            "
            @click="
              closeProfileModal
            "
          >
            취소
          </button>

          <button
            class="profile-submit-button"
            type="submit"
            :disabled="
              isUpdatingProfile
            "
          >
            {{
              isUpdatingProfile
                ? '저장 중...'
                : '저장'
            }}
          </button>
        </div>
      </form>
    </section>
  </div>

  <!-- 비밀번호 변경 모달 -->
  <div
    v-if="isPasswordModalOpen"
    class="password-modal-backdrop"
    @click.self="
      closePasswordModal
    "
  >
    <section
      class="password-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <header
        class="password-modal-header"
      >
        <div>
          <p>PASSWORD</p>

          <h2
            id="password-modal-title"
          >
            비밀번호 변경
          </h2>
        </div>

        <button
          class="password-modal-close"
          type="button"
          aria-label="비밀번호 변경 창 닫기"
          @click="
            closePasswordModal
          "
        >
          ×
        </button>
      </header>

      <form
        class="password-form"
        @submit.prevent="
          submitPasswordChange
        "
      >
        <div class="password-field">
          <label
            for="current-password"
          >
            현재 비밀번호
          </label>

          <input
            id="current-password"
            v-model="currentPassword"
            type="password"
            autocomplete="current-password"
            placeholder="현재 비밀번호"
            :disabled="
              isChangingPassword
            "
          />
        </div>

        <div class="password-field">
          <label
            for="new-password"
          >
            새 비밀번호
          </label>

          <input
            id="new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            placeholder="8자 이상 30자 이하"
            :disabled="
              isChangingPassword
            "
          />
        </div>

        <div class="password-field">
          <label
            for="new-password-confirm"
          >
            새 비밀번호 확인
          </label>

          <input
            id="new-password-confirm"
            v-model="
              newPasswordConfirm
            "
            type="password"
            autocomplete="new-password"
            placeholder="새 비밀번호를 다시 입력"
            :disabled="
              isChangingPassword
            "
          />
        </div>

        <p
          v-if="
            passwordErrorMessage
          "
          class="password-error-message"
        >
          {{
            passwordErrorMessage
          }}
        </p>

        <div
          class="password-modal-actions"
        >
          <button
            class="password-cancel-button"
            type="button"
            :disabled="
              isChangingPassword
            "
            @click="
              closePasswordModal
            "
          >
            취소
          </button>

          <button
            class="password-submit-button"
            type="submit"
            :disabled="
              isChangingPassword
            "
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

  <!-- 계정 관리 모달 -->
  <div
    v-if="isAccountModalOpen"
    class="account-modal-backdrop"
    @click.self="
      closeAccountModal
    "
  >
    <section
      class="account-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <header
        class="account-modal-header"
      >
        <div>
          <p>ACCOUNT</p>

          <h2
            id="account-modal-title"
          >
            계정 관리
          </h2>
        </div>

        <button
          class="account-modal-close"
          type="button"
          aria-label="계정 관리 창 닫기"
          @click="
            closeAccountModal
          "
        >
          ×
        </button>
      </header>

      <div
        class="account-management-list"
      >
        <!-- 로그아웃 -->
        <section
          class="account-management-item"
        >
          <div
            class="account-management-info"
          >
            <strong>
              로그아웃
            </strong>

            <span>
              현재 기기에서
              로그아웃합니다.
            </span>
          </div>

          <button
            class="logout-button"
            type="button"
            :disabled="
              isLoggingOut
              || isDeletingAccount
            "
            @click="handleLogout"
          >
            {{
              isLoggingOut
                ? '로그아웃 중...'
                : '로그아웃'
            }}
          </button>
        </section>

        <!-- 회원 탈퇴 -->
        <section
          class="account-management-item danger-item"
        >
          <div
            class="account-management-info"
          >
            <strong>
              회원 탈퇴
            </strong>

            <span>
              계정과 관련된 여행 정보를
              삭제합니다.
            </span>
          </div>

          <button
            v-if="
              !isDeleteAccountFormOpen
            "
            class="delete-account-open-button"
            type="button"
            :disabled="
              isLoggingOut
              || isDeletingAccount
            "
            @click="
              openDeleteAccountForm
            "
          >
            회원 탈퇴
          </button>
        </section>

        <!-- 회원 탈퇴 확인 -->
        <form
          v-if="
            isDeleteAccountFormOpen
          "
          class="delete-account-form"
          @submit.prevent="
            submitDeleteAccount
          "
        >
          <div
            class="delete-account-warning"
          >
            <strong>
              탈퇴 전 확인해 주세요
            </strong>

            <p>
              회원 탈퇴 시 계정과 내가
              만든 여행, 참여 및 초대
              정보가 삭제됩니다.
              삭제된 정보는 복구할 수
              없습니다.
            </p>
          </div>

          <div
            class="password-field"
          >
            <label
              for="delete-account-password"
            >
              현재 비밀번호
            </label>

            <input
              id="delete-account-password"
              v-model="
                deleteAccountPassword
              "
              type="password"
              autocomplete="current-password"
              placeholder="현재 비밀번호"
              :disabled="
                isDeletingAccount
              "
            />
          </div>

          <p
            v-if="
              accountErrorMessage
            "
            class="password-error-message"
          >
            {{
              accountErrorMessage
            }}
          </p>

          <div
            class="delete-account-actions"
          >
            <button
              class="delete-account-cancel-button"
              type="button"
              :disabled="
                isDeletingAccount
              "
              @click="
                closeDeleteAccountForm
              "
            >
              취소
            </button>

            <button
              class="delete-account-submit-button"
              type="submit"
              :disabled="
                isDeletingAccount
              "
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
.mypage-page {
  padding: 42px 48px 72px;
}

.desktop-page-heading {
  margin-bottom: 32px;
}

.desktop-page-heading p {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4566e8;
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: #1d2430;
}

.mypage-content {
  width: 100%;
}

/* =========================
   프로필 카드
========================= */

.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px 26px;
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 5px 18px
    rgba(37, 54, 78, 0.06);
}

.profile-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  overflow: hidden;
  border-radius: 50%;
  color: #ffffff;
  background:
    linear-gradient(
      145deg,
      #7798be,
      #4e6688
    );
}

.profile-avatar span {
  font-size: 25px;
  font-weight: 700;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-information {
  min-width: 0;
}

.profile-information h2 {
  margin: 0;
  font-size: 21px;
  color: #222934;
}

.profile-information p {
  margin: 7px 0 0;
  font-size: 13px;
  color: #89919d;
}

.profile-nickname {
  display: block;
  margin-top: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #607087;
}

/* =========================
   여행 정보
========================= */

.trip-summary {
  display: grid;
  grid-template-columns:
    1fr 1px 1fr 1px 1fr;
  align-items: center;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #ffffff;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.summary-item strong {
  font-size: 20px;
  color: #315ce8;
}

.summary-item span {
  font-size: 12px;
  color: #7e8794;
}

.summary-divider {
  width: 1px;
  height: 34px;
  background: #e5e9ef;
}

/* =========================
   설정
========================= */

.settings-section {
  margin-top: 34px;
}

.settings-section > h2 {
  margin: 0 0 15px;
  font-size: 17px;
  color: #202631;
}

.settings-list {
  overflow: hidden;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #ffffff;
}

.settings-item {
  display: grid;
  grid-template-columns:
    42px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 76px;
  padding: 13px 20px;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  background: #ffffff;
  cursor: pointer;
}

.settings-item:last-child {
  border-bottom: 0;
}

.settings-item:hover {
  background: #f8fafc;
}

.settings-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #4f6f98;
  background: #eef3f8;
}

.settings-icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.settings-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.settings-information strong {
  font-size: 14px;
  color: #272e38;
}

.settings-information > span {
  overflow: hidden;
  font-size: 11px;
  color: #959da8;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-arrow {
  font-size: 24px;
  color: #a3abb5;
  text-align: right;
}

/* =========================
   프로필 수정 모달
========================= */

.profile-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(22, 29, 42, 0.48);
}

.profile-modal {
  width: min(440px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 24px 70px
    rgba(26, 36, 53, 0.24);
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
  color: #4566e8;
}

.profile-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222934;
}

.profile-modal-close {
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

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

/* 프로필 이미지 선택 */

.profile-edit-avatar {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px;
  border-radius: 11px;
  background: #f6f8fb;
}

.profile-edit-avatar-circle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  background:
    linear-gradient(
      145deg,
      #7798be,
      #4e6688
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
  color: #35404d;
}

.profile-image-control p {
  margin: 5px 0 0;
  font-size: 9px;
  line-height: 1.5;
  color: #929ba7;
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
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 11px;
  border: 1px solid #dce2ea;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.profile-image-button {
  color: #586575;
  background: #ffffff;
}

.profile-image-button:hover {
  background: #f6f8fa;
}

.profile-image-reset-button {
  color: #6f7782;
  background: #f6f7f9;
}

.profile-image-reset-button:hover:not(:disabled) {
  background: #eceff3;
}

.profile-image-reset-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.profile-image-input {
  display: none;
}

/* 프로필 입력 */

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.profile-field label {
  font-size: 11px;
  font-weight: 700;
  color: #495362;
}

.profile-field input {
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

.profile-field input:focus {
  border-color: #5878e9;
  box-shadow:
    0 0 0 3px
    rgba(88, 120, 233, 0.11);
}

.profile-field input:disabled {
  color: #929ba7;
  background: #f5f6f8;
  cursor: not-allowed;
}

.profile-field-help {
  font-size: 9px;
  color: #9aa2ad;
}

.profile-error-message {
  margin: -3px 0 0;
  font-size: 10px;
  line-height: 1.5;
  color: #c74658;
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
  cursor: pointer;
}

.profile-cancel-button {
  border: 1px solid #dce2ea;
  color: #66717f;
  background: #ffffff;
}

.profile-submit-button {
  border: 0;
  color: #ffffff;
  background: #3565ef;
}

.profile-submit-button:hover {
  background: #2958df;
}

.profile-cancel-button:disabled,
.profile-submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* =========================
   비밀번호 변경 모달
========================= */

.password-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(22, 29, 42, 0.48);
}

.password-modal {
  width: min(440px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 24px 70px
    rgba(26, 36, 53, 0.24);
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
  box-shadow:
    0 0 0 3px
    rgba(88, 120, 233, 0.11);
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
   계정 관리 모달
========================= */

.account-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 210;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(22, 29, 42, 0.48);
}

.account-modal {
  width: min(460px, 100%);
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 24px 70px
    rgba(26, 36, 53, 0.24);
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

.account-management-item
  + .account-management-item {
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
  .mypage-page {
    padding: 22px 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .mypage-content {
    max-width: none;
  }

  .profile-card {
    gap: 14px;
    padding: 17px;
    border-radius: 11px;
  }

  .profile-avatar {
    width: 58px;
    height: 58px;
  }

  .profile-avatar span {
    font-size: 19px;
  }

  .profile-information h2 {
    font-size: 16px;
  }

  .profile-information p {
    margin-top: 5px;
    font-size: 10px;
  }

  .profile-nickname {
    margin-top: 4px;
    font-size: 9px;
  }

  .trip-summary {
    margin-top: 13px;
    padding: 16px 7px;
  }

  .summary-item {
    gap: 5px;
  }

  .summary-item strong {
    font-size: 16px;
  }

  .summary-item span {
    font-size: 9px;
  }

  .summary-divider {
    height: 28px;
  }

  .settings-section {
    margin-top: 27px;
  }

  .settings-section > h2 {
    margin-bottom: 11px;
    font-size: 13px;
  }

  .settings-item {
    grid-template-columns:
      36px minmax(0, 1fr) 18px;
    gap: 11px;
    min-height: 66px;
    padding: 11px 13px;
  }

  .settings-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }

  .settings-icon svg {
    width: 18px;
    height: 18px;
  }

  .settings-information {
    gap: 4px;
  }

  .settings-information strong {
    font-size: 12px;
  }

  .settings-information > span {
    font-size: 9px;
  }

  .settings-arrow {
    font-size: 20px;
  }

  /* 프로필 수정 */

  .profile-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .profile-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius:
      18px 18px 0 0;
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
    flex: 1;
    height: 42px;
  }

  /* 비밀번호 변경 */

  .password-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .password-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius:
      18px 18px 0 0;
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

  /* 계정 관리 */

  .account-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .account-modal {
    width: 100%;
    padding: 20px 17px 24px;
    border-radius:
      18px 18px 0 0;
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
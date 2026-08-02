<script setup lang="ts">
import { computed, ref } from 'vue'

import ProfileCard from '@/components/ProfileCard.vue'
import TripSummary from '@/components/TripSummary.vue'
import ProfileEditModal from '@/components/ProfileEditModal.vue'
import PasswordChangeModal from '@/components/PasswordChangeModal.vue'
import AccountManagementModal from '@/components/AccountManagementModal.vue'

import {
  getStoredMember,
  type Member,
} from '@/api/auth'

interface MyPageMenu {
  id: string
  title: string
  description: string
}

/* =========================
   현재 로그인 회원
========================= */

const currentMember = ref<Member | null>(getStoredMember())

const profileInitial = computed(() => {
  const name = currentMember.value?.name.trim()

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
    description: '이름, 닉네임과 프로필 사진을 변경합니다.',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    description: '여행 초대와 활동 알림을 설정합니다.',
  },
  {
    id: 'privacy',
    title: '개인정보·위치 설정',
    description: '개인정보와 사진 위치정보 사용 범위를 설정합니다.',
  },
  {
    id: 'password',
    title: '비밀번호 변경',
    description: '계정의 비밀번호를 변경합니다.',
  },
  {
    id: 'account',
    title: '계정 관리',
    description: '로그아웃과 회원 탈퇴를 관리합니다.',
  },
]

/* =========================
   프로필 수정 모달
========================= */

const isProfileModalOpen = ref(false)

const openProfileModal = () => {
  if (!currentMember.value) {
    window.alert('회원 정보를 불러오지 못했습니다.')
    return
  }

  isProfileModalOpen.value = true
}

const closeProfileModal = () => {
  isProfileModalOpen.value = false
}

const handleProfileUpdated = (updatedMember: Member) => {
  currentMember.value = updatedMember
}

/* =========================
   백엔드 이미지 주소
========================= */

const backendBaseUrl = (() => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined

  if (!configuredUrl || configuredUrl.startsWith('/')) {
    return 'http://localhost:8080'
  }

  return configuredUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
})()

const profileImageUrl = computed(() => {
  const path = currentMember.value?.profileImagePath

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

/* =========================
   비밀번호 변경
========================= */

const isPasswordModalOpen = ref(false)

/* =========================
   계정 관리
========================= */

const isAccountModalOpen = ref(false)

/* =========================
   설정 메뉴 클릭
========================= */

const handleMenuClick = (menuId: string) => {
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
   비밀번호 변경 모달
========================= */

const openPasswordModal = () => {
  isPasswordModalOpen.value = true
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}

/* =========================
   계정 관리 모달
========================= */

const openAccountModal = () => {
  isAccountModalOpen.value = true
}

const closeAccountModal = () => {
  isAccountModalOpen.value = false
}

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
      <ProfileCard
        :member="currentMember"
        :profile-initial="profileInitial"
        :profile-image-url="profileImageUrl"
      />

      <!-- 여행 정보 -->
      <TripSummary />

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
  <ProfileEditModal
    v-if="isProfileModalOpen && currentMember"
    :member="currentMember"
    :profile-initial="profileInitial"
    :profile-image-url="profileImageUrl"
    @close="closeProfileModal"
    @updated="handleProfileUpdated"
  />

  <!-- 비밀번호 변경 모달 -->
  <PasswordChangeModal
    v-if="isPasswordModalOpen"
    @close="closePasswordModal"
  />

  <!-- 계정 관리 모달 -->
  <AccountManagementModal
    v-if="isAccountModalOpen"
    @close="closeAccountModal"
  />
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
}
</style>
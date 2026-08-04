<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import ProfileCard from '@/components/mypage/ProfileCard.vue'
import TripSummary from '@/components/mypage/TripSummary.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'
import ProfileEditModal from '@/components/mypage/ProfileEditModal.vue'
import PasswordChangeModal from '@/components/mypage/PasswordChangeModal.vue'
import AccountManagementModal from '@/components/mypage/AccountManagementModal.vue'

import {
  getCurrentMember,
  getStoredMember,
  type Member,
} from '@/api/auth'

import {
  getTripSummary,
  type TripSummary as TripSummaryData,
} from '@/api/trips'

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
   여행 통계
========================= */

const tripSummary = ref<TripSummaryData>({
  totalCount: 0,
  ownedCount: 0,
  participatingCount: 0,
})

const loadTripSummary = async () => {
  try {
    tripSummary.value = await getTripSummary()
  } catch (error) {
    console.error('여행 통계를 불러오지 못했습니다.', error)
  }
}

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
    return `${window.location.protocol}//${window.location.hostname}:8080`
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

/* =========================
   초기 데이터 조회
========================= */

const loadCurrentMember = async () => {
  try {
    currentMember.value = await getCurrentMember()
  } catch (error) {
    console.error('회원 정보를 불러오지 못했습니다.', error)
  }
}

onMounted(() => {
  loadCurrentMember()
  loadTripSummary()
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
      <ProfileCard
        :member="currentMember"
        :profile-initial="profileInitial"
        :profile-image-url="profileImageUrl"
      />

      <!-- 여행 정보 -->
      <TripSummary
        :total-count="tripSummary.totalCount"
        :owned-count="tripSummary.ownedCount"
        :participating-count="tripSummary.participatingCount"
      />

      <!-- 설정 -->
      <SettingsMenu @select="handleMenuClick" />
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
}
</style>
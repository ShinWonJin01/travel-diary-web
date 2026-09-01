<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  getCurrentMember,
  getStoredMember,
  type Member,
} from '@/api/auth'
import { apiBlobRequest } from '@/api/http'
import {
  getTripSummary,
  type TripSummary as TripSummaryData,
} from '@/api/trips'

import AccountManagementModal from '@/components/mypage/AccountManagementModal.vue'
import NotificationSettingsModal from '@/components/mypage/NotificationSettingsModal.vue'
import PasswordChangeModal from '@/components/mypage/PasswordChangeModal.vue'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import ProfileEditModal from '@/components/mypage/ProfileEditModal.vue'
import SettingsMenu from '@/components/mypage/SettingsMenu.vue'
import TripSummary from '@/components/mypage/TripSummary.vue'

const currentMember = ref<Member | null>(getStoredMember())
const profileImageUrl = ref<string | null>(null)

const tripSummary = ref<TripSummaryData>({
  totalCount: 0,
  ownedCount: 0,
  participatingCount: 0,
})

const isProfileModalOpen = ref(false)
const isPasswordModalOpen = ref(false)
const isAccountModalOpen = ref(false)
const isNotificationSettingsModalOpen = ref(false)

const profileInitial = computed(() => {
  const name = currentMember.value?.name.trim()
  return name ? name.charAt(0) : '?'
})

const revokeProfileImageUrl = () => {
  if (profileImageUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(profileImageUrl.value)
  }

  profileImageUrl.value = null
}

const loadProfileImage = async () => {
  revokeProfileImageUrl()

  const member = currentMember.value
  if (!member?.profileImagePath) return

  if (
    member.profileImagePath.startsWith('http://') ||
    member.profileImagePath.startsWith('https://')
  ) {
    profileImageUrl.value = member.profileImagePath
    return
  }

  try {
    const blob = await apiBlobRequest(
      `/api/members/${member.id}/profile-image/file`,
    )

    profileImageUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('프로필 이미지를 불러오지 못했습니다.', error)
  }
}

const loadCurrentMember = async () => {
  try {
    currentMember.value = await getCurrentMember()
  } catch (error) {
    console.error('회원 정보를 불러오지 못했습니다.', error)
  }
}

const loadTripSummary = async () => {
  try {
    tripSummary.value = await getTripSummary()
  } catch (error) {
    console.error('여행 통계를 불러오지 못했습니다.', error)
  }
}

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

const openPasswordModal = () => {
  isPasswordModalOpen.value = true
}

const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}

const openAccountModal = () => {
  isAccountModalOpen.value = true
}

const closeAccountModal = () => {
  isAccountModalOpen.value = false
}

const openNotificationSettingsModal = () => {
  isNotificationSettingsModalOpen.value = true
}

const closeNotificationSettingsModal = () => {
  isNotificationSettingsModalOpen.value = false
}

const handleMenuClick = (menuId: string) => {
  switch (menuId) {
    case 'profile':
      openProfileModal()
      break
    case 'notifications':
      openNotificationSettingsModal()
      break
    case 'password':
      openPasswordModal()
      break
    case 'account':
      openAccountModal()
      break
  }
}

watch(
  [
    () => currentMember.value?.id,
    () => currentMember.value?.profileImagePath,
  ],
  () => {
    void loadProfileImage()
  },
  { immediate: true },
)

onMounted(() => {
  void loadCurrentMember()
  void loadTripSummary()
})

onBeforeUnmount(revokeProfileImageUrl)
</script>

<template>
  <section class="mypage-page">
    <div class="desktop-page-heading">
      <p>MY PAGE</p>
      <h1>마이페이지</h1>
    </div>

    <div class="mypage-content">
      <ProfileCard
        :member="currentMember"
        :profile-initial="profileInitial"
        :profile-image-url="profileImageUrl"
      />

      <TripSummary
        :total-count="tripSummary.totalCount"
        :owned-count="tripSummary.ownedCount"
        :participating-count="tripSummary.participatingCount"
      />

      <SettingsMenu @select="handleMenuClick" />
    </div>
  </section>

  <ProfileEditModal
    v-if="isProfileModalOpen && currentMember"
    :member="currentMember"
    :profile-initial="profileInitial"
    :profile-image-url="profileImageUrl"
    @close="closeProfileModal"
    @updated="handleProfileUpdated"
  />

  <PasswordChangeModal
    v-if="isPasswordModalOpen"
    @close="closePasswordModal"
  />

  <NotificationSettingsModal
    v-if="isNotificationSettingsModalOpen"
    @close="closeNotificationSettingsModal"
  />

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
  color: var(--tmr-primary);
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: var(--tmr-text);
}

.mypage-content {
  width: 100%;
}

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
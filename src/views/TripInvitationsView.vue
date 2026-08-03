<script setup lang="ts">
import { onMounted, ref } from 'vue'

import InvitationTabs from '@/components/invitations/InvitationTabs.vue'
import ReceivedInvitationsSection from '@/components/invitations/ReceivedInvitationsSection.vue'
import SentInvitationsSection from '@/components/invitations/SentInvitationsSection.vue'

import {
  acceptInvitation as acceptInvitationApi,
  cancelInvitation as cancelInvitationApi,
  declineInvitation as declineInvitationApi,
  getReceivedInvitations,
  getSentInvitations,
  type TripInvitation,
} from '@/api/invitations'

type InvitationTab = 'received' | 'sent'

const activeTab = ref<InvitationTab>('received')

const handleTabChange = (tab: InvitationTab) => {
  activeTab.value = tab
}

const receivedInvitations = ref<TripInvitation[]>([])
const sentInvitations = ref<TripInvitation[]>([])

const isLoading = ref(false)
const processingInvitationId = ref<number | null>(null)

const errorMessage = ref('')
const successMessage = ref('')

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '초대 정보를 처리하는 중 오류가 발생했습니다.'
}

const loadInvitations = async () => {
  isLoading.value = true
  clearMessages()

  try {
    const [received, sent] = await Promise.all([
      getReceivedInvitations(),
      getSentInvitations(),
    ])

    receivedInvitations.value = received
    sentInvitations.value = sent
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const handleAcceptInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) {
    return
  }

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await acceptInvitationApi(invitationId)

    receivedInvitations.value = receivedInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '여행 초대를 수락했습니다.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingInvitationId.value = null
  }
}

const handleDeclineInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) {
    return
  }

  const confirmed = window.confirm('이 여행 초대를 거절하시겠습니까?')

  if (!confirmed) {
    return
  }

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await declineInvitationApi(invitationId)

    receivedInvitations.value = receivedInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '여행 초대를 거절했습니다.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingInvitationId.value = null
  }
}

const handleCancelSentInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) {
    return
  }

  const confirmed = window.confirm('보낸 초대를 취소하시겠습니까?')

  if (!confirmed) {
    return
  }

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await cancelInvitationApi(invitationId)

    sentInvitations.value = sentInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '보낸 초대를 취소했습니다.'
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingInvitationId.value = null
  }
}

onMounted(() => {
  void loadInvitations()
})
</script>

<template>
  <section class="trip-invitations-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <p>TRIP INVITATIONS</p>
      <h1>초대 관리</h1>
    </div>

    <!-- 상단 탭 -->
    <InvitationTabs
      :active-tab="activeTab"
      @change="handleTabChange"
    />

    <div class="page-content">
      <p
        v-if="errorMessage"
        class="feedback-message error-message"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="feedback-message success-message"
      >
        {{ successMessage }}
      </p>

      <div
        v-if="isLoading"
        class="loading-state"
      >
        초대 정보를 불러오는 중입니다.
      </div>

      <!-- 받은 초대 -->
      <ReceivedInvitationsSection
        v-else-if="activeTab === 'received'"
        :invitations="receivedInvitations"
        :processing-invitation-id="processingInvitationId"
        @accept="handleAcceptInvitation"
        @decline="handleDeclineInvitation"
      />

      <!-- 보낸 초대 -->
      <SentInvitationsSection
        v-else
        :invitations="sentInvitations"
        :processing-invitation-id="processingInvitationId"
        @cancel="handleCancelSentInvitation"
      />
    </div>
  </section>
</template>

<style scoped>
.trip-invitations-page {
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

/* 페이지 콘텐츠 */
.page-content {
  width: 100%;
  max-width: none;
  padding-top: 30px;
}

.feedback-message {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 12px;
}

.error-message {
  color: #b42318;
  background: #fef3f2;
}

.success-message {
  color: #18794e;
  background: #ecfdf3;
}

.loading-state {
  display: grid;
  min-height: 180px;
  place-items: center;
  border: 1px dashed #d6dce4;
  border-radius: 10px;
  font-size: 12px;
  color: #747d89;
}

/* 모바일 */
@media (max-width: 760px) {
  .trip-invitations-page {
    padding: 0 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .page-content {
    padding-top: 22px;
  }
}
</style>
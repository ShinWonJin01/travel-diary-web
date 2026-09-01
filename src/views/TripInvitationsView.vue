<script setup lang="ts">
import { onMounted, ref } from 'vue'

import {
  acceptInvitation as acceptInvitationApi,
  cancelInvitation as cancelInvitationApi,
  declineInvitation as declineInvitationApi,
  getReceivedInvitations,
  getSentInvitations,
  type TripInvitation,
} from '@/api/invitations'

import InvitationTabs from '@/components/invitations/InvitationTabs.vue'
import ReceivedInvitationsSection from '@/components/invitations/ReceivedInvitationsSection.vue'
import SentInvitationsSection from '@/components/invitations/SentInvitationsSection.vue'

type InvitationTab = 'received' | 'sent'

const activeTab = ref<InvitationTab>('received')

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

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : '초대 정보를 처리하는 중 오류가 발생했습니다.'

const handleTabChange = (tab: InvitationTab) => {
  activeTab.value = tab
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
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const handleAcceptInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) return

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await acceptInvitationApi(invitationId)

    receivedInvitations.value = receivedInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '여행 초대를 수락했습니다.'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingInvitationId.value = null
  }
}

const handleDeclineInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) return

  const confirmed = window.confirm(
    '이 여행 초대를 거절하시겠습니까?',
  )

  if (!confirmed) return

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await declineInvitationApi(invitationId)

    receivedInvitations.value = receivedInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '여행 초대를 거절했습니다.'
  } catch (error: unknown) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    processingInvitationId.value = null
  }
}

const handleCancelSentInvitation = async (invitationId: number) => {
  if (processingInvitationId.value !== null) return

  const confirmed = window.confirm(
    '보낸 초대를 취소하시겠습니까?',
  )

  if (!confirmed) return

  processingInvitationId.value = invitationId
  clearMessages()

  try {
    await cancelInvitationApi(invitationId)

    sentInvitations.value = sentInvitations.value.filter(
      (invitation) => invitation.invitationId !== invitationId,
    )

    successMessage.value = '보낸 초대를 취소했습니다.'
  } catch (error: unknown) {
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
    <div class="desktop-page-heading">
      <p>TRIP INVITATIONS</p>
      <h1>초대 관리</h1>
    </div>

    <InvitationTabs
      :active-tab="activeTab"
      @change="handleTabChange"
    />

    <div class="page-content">
      <p
        v-if="errorMessage"
        class="feedback-message error-message"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p
        v-if="successMessage"
        class="feedback-message success-message"
        role="status"
      >
        {{ successMessage }}
      </p>

      <div v-if="isLoading" class="loading-state">
        <span class="loading-spinner"></span>
        <span>초대 정보를 불러오는 중입니다.</span>
      </div>

      <ReceivedInvitationsSection
        v-else-if="activeTab === 'received'"
        :invitations="receivedInvitations"
        :processing-invitation-id="processingInvitationId"
        @accept="handleAcceptInvitation"
        @decline="handleDeclineInvitation"
      />

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
  color: var(--tmr-primary);
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: var(--tmr-text);
}

.page-content {
  width: 100%;
  padding-top: 30px;
}

.feedback-message {
  margin: 0 0 16px;
  padding: 11px 13px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.5;
}

.error-message {
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.success-message {
  color: #2f8068;
  background: #e9f7f2;
}

.loading-state {
  display: flex;
  min-height: 180px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px dashed var(--tmr-border);
  border-radius: 10px;
  font-size: 12px;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.loading-spinner {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 2px solid var(--tmr-border);
  border-top-color: var(--tmr-primary);
  border-radius: 50%;
  animation: invitation-spin 0.8s linear infinite;
}

@keyframes invitation-spin {
  to {
    transform: rotate(360deg);
  }
}

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

  .feedback-message {
    margin-bottom: 12px;
    padding: 9px 10px;
    font-size: 9px;
  }

  .loading-state {
    min-height: 150px;
    font-size: 10px;
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
  }
}
</style>
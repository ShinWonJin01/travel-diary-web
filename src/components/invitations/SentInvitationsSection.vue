<script setup lang="ts">
import type {
  InvitationStatus,
  TripInvitation,
} from '@/api/invitations'

defineProps<{
  invitations: TripInvitation[]
  processingInvitationId: number | null
}>()

const emit = defineEmits<{
  cancel: [invitationId: number]
}>()

const formatDate = (date: string) => {
  return date.replaceAll('-', '.')
}

const formatPeriod = (
  startDate: string,
  endDate: string | null,
) => {
  const formattedStartDate = formatDate(startDate)

  if (!endDate) {
    return `${formattedStartDate} - 종료일 미정`
  }

  return `${formattedStartDate} - ${formatDate(endDate)}`
}

const formatSentDate = (createdAt: string) => {
  return formatDate(createdAt.slice(0, 10))
}

const getStatusLabel = (status: InvitationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return '수락 완료'

    case 'DECLINED':
      return '거절'

    default:
      return '응답 대기'
  }
}

const getStatusClass = (status: InvitationStatus) => {
  return status.toLowerCase()
}

const getThumbnailClass = (invitation: TripInvitation) => {
  const thumbnailClasses = [
    'thumbnail-europe',
    'thumbnail-tokyo',
    'thumbnail-jeju',
  ]

  return thumbnailClasses[
    invitation.tripId % thumbnailClasses.length
  ]
}
</script>

<template>
  <section class="content-section sent-invitation-section">
    <h2 class="section-title">보낸 초대</h2>

    <div
      v-if="invitations.length > 0"
      class="sent-invitation-list"
    >
      <article
        v-for="invitation in invitations"
        :key="invitation.invitationId"
        class="sent-invitation-card"
      >
        <div class="sent-invitation-summary">
          <div
            class="trip-thumbnail sent-invitation-thumbnail"
            :class="getThumbnailClass(invitation)"
          >
            <span class="thumbnail-mountain mountain-back"></span>
            <span class="thumbnail-mountain mountain-front"></span>
            <span class="thumbnail-sun"></span>
          </div>

          <div class="sent-invitation-information">
            <h3>{{ invitation.tripTitle }}</h3>

            <p>
              {{ invitation.inviteeNickname }}님에게 보낸 초대
            </p>

            <span class="sent-trip-period">
              {{
                formatPeriod(
                  invitation.startDate,
                  invitation.endDate,
                )
              }}
            </span>

            <span class="sent-date">
              보낸 날짜 {{ formatSentDate(invitation.createdAt) }}
            </span>
          </div>
        </div>

        <div class="sent-invitation-state">
          <span
            class="status-badge"
            :class="getStatusClass(invitation.status)"
          >
            {{ getStatusLabel(invitation.status) }}
          </span>

          <button
            v-if="invitation.status === 'PENDING'"
            class="cancel-invitation-button"
            type="button"
            :disabled="
              processingInvitationId === invitation.invitationId
            "
            @click="emit('cancel', invitation.invitationId)"
          >
            {{
              processingInvitationId === invitation.invitationId
                ? '처리 중'
                : '초대 취소'
            }}
          </button>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <p>보낸 여행 초대가 없습니다.</p>

      <span>
        내가 만든 여행에서 친구를 초대해 보세요.
      </span>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 0 0 17px;
  font-size: 17px;
  color: var(--tmr-text);
}

.trip-thumbnail {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-europe {
  background: linear-gradient(145deg, #8da887, #c2b899);
}

.thumbnail-tokyo {
  background: linear-gradient(145deg, #9caec5, #d0b49f);
}

.thumbnail-jeju {
  background: linear-gradient(145deg, #82b8a5, #c8d892);
}

.thumbnail-mountain {
  position: absolute;
  bottom: -25px;
  width: 74px;
  height: 58px;
  transform: rotate(45deg);
  border-radius: 5px;
}

.mountain-back {
  right: -16px;
  background: rgba(255, 255, 255, 0.28);
}

.mountain-front {
  bottom: -31px;
  left: -8px;
  width: 88px;
  height: 68px;
  background: rgba(255, 255, 255, 0.5);
}

.thumbnail-sun {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
}

.sent-invitation-list {
  display: grid;
  gap: 14px;
}

.sent-invitation-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px;
  align-items: center;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--tmr-border);
  border-radius: 12px;
  background: var(--tmr-surface);
  box-shadow: 0 5px 18px rgba(37, 54, 78, 0.06);
}

.sent-invitation-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.sent-invitation-thumbnail {
  width: 92px;
  height: 76px;
  border-radius: 9px;
}

.sent-invitation-information {
  min-width: 0;
}

.sent-invitation-information h3 {
  margin: 0;
  font-size: 15px;
  color: var(--tmr-text);
}

.sent-invitation-information p {
  margin: 7px 0 0;
  font-size: 12px;
  color: var(--tmr-text-sub);
}

.sent-invitation-information span {
  display: block;
}

.sent-trip-period {
  margin-top: 5px;
  font-size: 11px;
  color: var(--tmr-text-sub);
}

.sent-date {
  margin-top: 4px;
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.sent-invitation-state {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 9px;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge.pending {
  color: #8a6415;
  background: #fff6dc;
}

.status-badge.accepted {
  color: #28745c;
  background: #e8f7f1;
}

.status-badge.declined {
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.cancel-invitation-button {
  width: 100%;
  height: 36px;
  border: 1px solid var(--tmr-border);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.cancel-invitation-button:hover {
  background: var(--tmr-surface-soft);
}

.cancel-invitation-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-state {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 38px 20px;
  border: 1px dashed var(--tmr-border);
  border-radius: 10px;
  text-align: center;
  background: var(--tmr-surface);
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--tmr-text-sub);
}

.empty-state span {
  font-size: 11px;
  color: var(--tmr-text-sub);
}

@media (max-width: 760px) {
  .section-title {
    margin-bottom: 13px;
    font-size: 13px;
  }

  .sent-invitation-card {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }

  .sent-invitation-summary {
    gap: 11px;
  }

  .sent-invitation-thumbnail {
    width: 76px;
    height: 65px;
  }

  .sent-invitation-information h3 {
    font-size: 12px;
  }

  .sent-invitation-information p {
    margin-top: 5px;
    font-size: 9px;
  }

  .sent-trip-period {
    margin-top: 4px;
    font-size: 8px;
  }

  .sent-date {
    margin-top: 3px;
    font-size: 8px;
  }

  .sent-invitation-state {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--tmr-border);
  }

  .status-badge {
    min-height: 30px;
    padding: 0 10px;
    font-size: 9px;
  }

  .cancel-invitation-button {
    width: 95px;
    height: 30px;
    font-size: 9px;
  }

  .empty-state {
    min-height: 160px;
    padding: 30px 16px;
  }

  .empty-state p {
    font-size: 11px;
  }

  .empty-state span {
    font-size: 9px;
  }
}
</style>
<script setup lang="ts">
import { type TripInvitation } from '@/api/invitations'

defineProps<{
  invitations: TripInvitation[]
  processingInvitationId: number | null
}>()

const emit = defineEmits<{
  accept: [invitationId: number]
  decline: [invitationId: number]
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

const handleAccept = (invitationId: number) => {
  emit('accept', invitationId)
}

const handleDecline = (invitationId: number) => {
  emit('decline', invitationId)
}
</script>

<template>
  <section class="content-section received-invitation-section">
    <h2 class="section-title">받은 초대</h2>

    <div
      v-if="invitations.length > 0"
      class="received-invitation-list"
    >
      <article
        v-for="invitation in invitations"
        :key="invitation.invitationId"
        class="received-invitation-card"
      >
        <div class="received-invitation-summary">
          <div
            class="trip-thumbnail received-invitation-thumbnail"
            :class="getThumbnailClass(invitation)"
          >
            <span class="thumbnail-mountain mountain-back"></span>
            <span class="thumbnail-mountain mountain-front"></span>
            <span class="thumbnail-sun"></span>
          </div>

          <div class="received-invitation-information">
            <h3>{{ invitation.tripTitle }}</h3>

            <p>
              {{ invitation.inviterNickname }}님이 초대했습니다.
            </p>

            <span>
              {{
                formatPeriod(
                  invitation.startDate,
                  invitation.endDate,
                )
              }}
            </span>
          </div>
        </div>

        <div class="received-invitation-actions">
          <button
            class="reject-button"
            type="button"
            :disabled="
              processingInvitationId === invitation.invitationId
            "
            @click="handleDecline(invitation.invitationId)"
          >
            거절
          </button>

          <button
            class="accept-button"
            type="button"
            :disabled="
              processingInvitationId === invitation.invitationId
            "
            @click="handleAccept(invitation.invitationId)"
          >
            {{
              processingInvitationId === invitation.invitationId
                ? '처리 중'
                : '수락'
            }}
          </button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="empty-state"
    >
      <p>받은 여행 초대가 없습니다.</p>

      <span>
        친구가 여행에 초대하면 이곳에서 확인할 수 있습니다.
      </span>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  margin: 0 0 17px;
  font-size: 17px;
  color: #202631;
}

/* 공통 썸네일 */
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

/* 받은 초대 */
.received-invitation-list {
  display: grid;
  gap: 14px;
}

.received-invitation-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px;
  align-items: center;
  gap: 20px;
  padding: 16px;
  border: 1px solid #e4e8ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(37, 54, 78, 0.06);
}

.received-invitation-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.received-invitation-thumbnail {
  width: 92px;
  height: 76px;
  border-radius: 9px;
}

.received-invitation-information {
  min-width: 0;
}

.received-invitation-information h3 {
  margin: 0;
  font-size: 15px;
  color: #252b35;
}

.received-invitation-information p {
  margin: 7px 0 0;
  font-size: 12px;
  color: #646d79;
}

.received-invitation-information span {
  display: block;
  margin-top: 5px;
  font-size: 11px;
  color: #9aa1aa;
}

.received-invitation-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.received-invitation-actions button {
  width: 100%;
  height: 40px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reject-button {
  border: 1px solid #dce1e8;
  color: #606a77;
  background: #ffffff;
}

.accept-button {
  border: 1px solid #2864ed;
  color: #ffffff;
  background: #2864ed;
}

.reject-button:hover {
  background: #f5f7fa;
}

.accept-button:hover {
  background: #1e56d9;
}

.received-invitation-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 빈 목록 */
.empty-state {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 38px 20px;
  border: 1px dashed #d6dce4;
  border-radius: 10px;
  text-align: center;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #747d89;
}

.empty-state span {
  font-size: 11px;
  color: #a0a7b0;
}

@media (max-width: 760px) {
  .section-title {
    margin-bottom: 13px;
    font-size: 13px;
  }

  .received-invitation-card {
    display: block;
    padding: 0;
  }

  .received-invitation-summary {
    gap: 11px;
    padding: 12px;
  }

  .received-invitation-thumbnail {
    width: 76px;
    height: 65px;
  }

  .received-invitation-information h3 {
    font-size: 12px;
  }

  .received-invitation-information p {
    margin-top: 5px;
    font-size: 9px;
  }

  .received-invitation-information span {
    margin-top: 4px;
    font-size: 8px;
  }

  .received-invitation-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 0 12px 12px;
  }

  .received-invitation-actions button {
    height: 32px;
    font-size: 10px;
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
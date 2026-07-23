<script setup lang="ts">
import { ref } from 'vue'

type InvitationTab = 'received' | 'sent'
type InvitationStatus = 'pending' | 'accepted' | 'declined'

interface ReceivedInvitation {
  id: number
  title: string
  inviterName: string
  period: string
  thumbnailClass: string
}

interface SentInvitation {
  id: number
  tripTitle: string
  inviteeName: string
  period: string
  sentDate: string
  status: InvitationStatus
  thumbnailClass: string
}

const activeTab = ref<InvitationTab>('received')

const receivedInvitations = ref<ReceivedInvitation[]>([
  {
    id: 1,
    title: '유럽 배낭여행',
    inviterName: '박지민',
    period: '2024.05.01 - 05.15',
    thumbnailClass: 'thumbnail-europe',
  },
])

const sentInvitations = ref<SentInvitation[]>([
  {
    id: 1,
    tripTitle: '도쿄 여행',
    inviteeName: '김민수',
    period: '2024.04.10 - 04.14',
    sentDate: '2024.04.01',
    status: 'accepted',
    thumbnailClass: 'thumbnail-tokyo',
  },
  {
    id: 2,
    tripTitle: '도쿄 여행',
    inviteeName: '이지현',
    period: '2024.04.10 - 04.14',
    sentDate: '2024.04.02',
    status: 'pending',
    thumbnailClass: 'thumbnail-tokyo',
  },
  {
    id: 3,
    tripTitle: '제주도 가족여행',
    inviteeName: '박유진',
    period: '2024.03.20 - 03.23',
    sentDate: '2024.03.10',
    status: 'declined',
    thumbnailClass: 'thumbnail-jeju',
  },
])

const rejectInvitation = (invitationId: number) => {
  receivedInvitations.value = receivedInvitations.value.filter(
    (invitation) => invitation.id !== invitationId,
  )
}

const acceptInvitation = (invitationId: number) => {
  const invitation = receivedInvitations.value.find((item) => item.id === invitationId)

  if (!invitation) {
    return
  }

  /*
   * 추후 Pinia 또는 백엔드와 연결하면
   * 수락한 여행을 여행 기록의 '참여 중' 목록에 추가합니다.
   */
  receivedInvitations.value = receivedInvitations.value.filter((item) => item.id !== invitationId)
}

const cancelSentInvitation = (invitationId: number) => {
  sentInvitations.value = sentInvitations.value.filter(
    (invitation) => invitation.id !== invitationId,
  )
}

const getStatusLabel = (status: InvitationStatus) => {
  switch (status) {
    case 'accepted':
      return '수락 완료'

    case 'declined':
      return '거절'

    default:
      return '응답 대기'
  }
}
</script>

<template>
  <section class="trip-invitations-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <p>TRIP INVITATIONS</p>
      <h1>초대 관리</h1>
    </div>

    <!-- 상단 탭 -->
    <div class="invitation-tabs">
      <button
        type="button"
        :class="{ active: activeTab === 'received' }"
        :aria-pressed="activeTab === 'received'"
        @click="activeTab = 'received'"
      >
        받은 초대
      </button>

      <button
        type="button"
        :class="{ active: activeTab === 'sent' }"
        :aria-pressed="activeTab === 'sent'"
        @click="activeTab = 'sent'"
      >
        보낸 초대
      </button>
    </div>

    <div class="page-content">
      <!-- 받은 초대 -->
      <section v-if="activeTab === 'received'" class="content-section received-invitation-section">
        <h2 class="section-title">받은 초대</h2>

        <div v-if="receivedInvitations.length > 0" class="received-invitation-list">
          <article
            v-for="invitation in receivedInvitations"
            :key="invitation.id"
            class="received-invitation-card"
          >
            <div class="received-invitation-summary">
              <div
                class="trip-thumbnail received-invitation-thumbnail"
                :class="invitation.thumbnailClass"
              >
                <span class="thumbnail-mountain mountain-back"></span>
                <span class="thumbnail-mountain mountain-front"></span>
                <span class="thumbnail-sun"></span>
              </div>

              <div class="received-invitation-information">
                <h3>{{ invitation.title }}</h3>

                <p>{{ invitation.inviterName }}님이 초대했습니다.</p>

                <span>{{ invitation.period }}</span>
              </div>
            </div>

            <div class="received-invitation-actions">
              <button class="reject-button" type="button" @click="rejectInvitation(invitation.id)">
                거절
              </button>

              <button class="accept-button" type="button" @click="acceptInvitation(invitation.id)">
                수락
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <p>받은 여행 초대가 없습니다.</p>
          <span> 친구가 여행에 초대하면 이곳에서 확인할 수 있습니다. </span>
        </div>
      </section>

      <!-- 보낸 초대 -->
      <section v-else class="content-section sent-invitation-section">
        <h2 class="section-title">보낸 초대</h2>

        <div v-if="sentInvitations.length > 0" class="sent-invitation-list">
          <article
            v-for="invitation in sentInvitations"
            :key="invitation.id"
            class="sent-invitation-card"
          >
            <div class="sent-invitation-summary">
              <div
                class="trip-thumbnail sent-invitation-thumbnail"
                :class="invitation.thumbnailClass"
              >
                <span class="thumbnail-mountain mountain-back"></span>
                <span class="thumbnail-mountain mountain-front"></span>
                <span class="thumbnail-sun"></span>
              </div>

              <div class="sent-invitation-information">
                <h3>{{ invitation.tripTitle }}</h3>

                <p>{{ invitation.inviteeName }}님에게 보낸 초대</p>

                <span class="sent-trip-period">
                  {{ invitation.period }}
                </span>

                <span class="sent-date"> 보낸 날짜 {{ invitation.sentDate }} </span>
              </div>
            </div>

            <div class="sent-invitation-state">
              <span class="status-badge" :class="invitation.status">
                {{ getStatusLabel(invitation.status) }}
              </span>

              <button
                v-if="invitation.status === 'pending'"
                class="cancel-invitation-button"
                type="button"
                @click="cancelSentInvitation(invitation.id)"
              >
                초대 취소
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <p>보낸 여행 초대가 없습니다.</p>
          <span> 내가 만든 여행에서 친구를 초대해 보세요. </span>
        </div>
      </section>
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

/* 상단 탭 */
.invitation-tabs {
  display: grid;
  grid-template-columns: repeat(2, 160px);
  border-bottom: 1px solid #e4e8ee;
}

.invitation-tabs button {
  position: relative;
  height: 48px;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  color: #9299a4;
  background: transparent;
  cursor: pointer;
}

.invitation-tabs button.active {
  color: #3264ed;
}

.invitation-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #3264ed;
  content: '';
}

.page-content {
  width: 100%;
  max-width: none;
  padding-top: 30px;
}

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

.received-invitation-information h3,
.sent-invitation-information h3 {
  margin: 0;
  font-size: 15px;
  color: #252b35;
}

.received-invitation-information p,
.sent-invitation-information p {
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

/* 보낸 초대 */
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
  border: 1px solid #e4e8ef;
  border-radius: 12px;
  background: #ffffff;
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

.sent-invitation-information span {
  display: block;
}

.sent-trip-period {
  margin-top: 5px;
  font-size: 11px;
  color: #8f97a2;
}

.sent-date {
  margin-top: 4px;
  font-size: 10px;
  color: #afb5bd;
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
  color: #7f8791;
  background: #f0f2f5;
}

.cancel-invitation-button {
  width: 100%;
  height: 36px;
  border: 1px solid #dce1e8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #606a77;
  background: #ffffff;
  cursor: pointer;
}

.cancel-invitation-button:hover {
  background: #f5f7fa;
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

/* 모바일 */
@media (max-width: 760px) {
  .trip-invitations-page {
    padding: 0 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .invitation-tabs {
    grid-template-columns: repeat(2, 1fr);
    margin: 0 -17px;
    padding: 0 17px;
  }

  .invitation-tabs button {
    height: 46px;
    font-size: 11px;
  }

  .page-content {
    padding-top: 22px;
  }

  .section-title {
    margin-bottom: 13px;
    font-size: 13px;
  }

  /* 모바일 받은 초대 */
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

  .received-invitation-information h3,
  .sent-invitation-information h3 {
    font-size: 12px;
  }

  .received-invitation-information p,
  .sent-invitation-information p {
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

  /* 모바일 보낸 초대 */
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
    border-top: 1px solid #edf0f4;
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

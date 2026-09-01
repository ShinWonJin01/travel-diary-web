<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface ReceivedInvitation {
  id: number
  tripId: number
  title: string
  inviter: string
  participants: number
  period: string
  theme: string
}

defineProps<{
  invitations: ReceivedInvitation[]
}>()
</script>

<template>
  <section class="invitation-section">
    <div class="section-heading">
      <div class="invitation-heading-title">
        <h1>받은 여행 초대</h1>
        <span v-if="invitations.length > 0" class="invitation-count">
          {{ invitations.length }}
        </span>
      </div>

      <RouterLink to="/invitations">
        더보기
        <span>›</span>
      </RouterLink>
    </div>

    <div v-if="invitations.length > 0" class="invitation-list">
      <article
        v-for="invitation in invitations"
        :key="invitation.id"
        class="invitation-item"
      >
        <div class="invitation-thumbnail" :class="invitation.theme">
          <svg viewBox="0 0 32 27" aria-hidden="true">
            <path d="M2 25 11 14l5 6 5-7 9 12z" />
            <circle cx="22" cy="7" r="4" />
          </svg>
        </div>

        <div class="invitation-information">
          <div class="invitation-title-row">
            <h2>{{ invitation.title }}</h2>
            <span class="invitation-status">초대 대기</span>
          </div>

          <p class="inviter-information">
            <strong>{{ invitation.inviter }}</strong>님이 여행에 초대했어요.
          </p>

          <p class="invitation-detail">
            참여자 {{ invitation.participants }}명
            <span>|</span>
            {{ invitation.period }}
          </p>
        </div>

        <RouterLink
          class="invitation-check-button"
          to="/invitations"
          :aria-label="`${invitation.title} 초대 확인`"
        >
          초대 확인
        </RouterLink>
      </article>
    </div>

    <div v-else class="invitation-empty">
      <span class="invitation-empty-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </span>
      <p>현재 받은 여행 초대가 없습니다.</p>
    </div>
  </section>
</template>

<style scoped>
.invitation-section {
  margin-top: 50px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-heading h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--tmr-text);
}

.section-heading a {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tmr-primary);
}

.section-heading a:hover {
  color: var(--tmr-primary-dark);
}

.section-heading a span {
  font-size: 20px;
  line-height: 1;
}

.invitation-heading-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invitation-count {
  display: flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-surface);
  background: var(--tmr-accent);
}

.invitation-list {
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
}

.invitation-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  min-height: 96px;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--tmr-border);
  transition: background 0.2s ease;
}

.invitation-item:last-child {
  border-bottom: 0;
}

.invitation-item:hover {
  background: var(--tmr-surface-soft);
}

.invitation-thumbnail {
  display: flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.invitation-thumbnail svg {
  width: 29px;
  fill: var(--tmr-surface);
}

.invitation-theme-blue {
  background: linear-gradient(145deg, #91b6ff, #5d86e8);
}

.invitation-theme-green {
  background: linear-gradient(145deg, #9bd8c7, #63ad9a);
}

.invitation-information {
  min-width: 0;
}

.invitation-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invitation-title-row h2 {
  overflow: hidden;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invitation-status {
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.inviter-information {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--tmr-text-sub);
}

.inviter-information strong {
  font-weight: 700;
  color: var(--tmr-text);
}

.invitation-detail {
  margin: 5px 0 0;
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.invitation-detail span {
  margin: 0 5px;
  color: var(--tmr-border);
}

.invitation-check-button {
  display: flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  padding: 0 13px;
  border: 1px solid var(--tmr-primary);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-primary);
  white-space: nowrap;
  background: var(--tmr-surface);
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.invitation-check-button:hover {
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.invitation-empty {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.invitation-empty-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface);
}

.invitation-empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.invitation-empty p {
  margin: 0;
  font-size: 11px;
}

@media (max-width: 760px) {
  .invitation-section {
    margin-top: 30px;
  }

  .section-heading {
    margin-bottom: 14px;
  }

  .section-heading h1 {
    font-size: 15px;
  }

  .section-heading a {
    font-size: 11px;
  }

  .section-heading a span {
    font-size: 16px;
  }

  .invitation-heading-title {
    gap: 6px;
  }

  .invitation-count {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    font-size: 8px;
  }

  .invitation-list {
    border: 0;
    border-radius: 0;
  }

  .invitation-item {
    grid-template-columns: 51px minmax(0, 1fr) auto;
    min-height: 78px;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--tmr-border);
  }

  .invitation-item:hover {
    background: transparent;
  }

  .invitation-thumbnail {
    width: 51px;
    height: 51px;
    border-radius: 9px;
  }

  .invitation-thumbnail svg {
    width: 24px;
  }

  .invitation-title-row {
    gap: 5px;
  }

  .invitation-title-row h2 {
    font-size: 11px;
  }

  .invitation-status {
    padding: 2px 5px;
    font-size: 7px;
  }

  .inviter-information,
  .invitation-detail {
    margin-top: 4px;
    font-size: 8px;
  }

  .invitation-check-button {
    height: 29px;
    padding: 0 9px;
    border-radius: 6px;
    font-size: 8px;
  }

  .invitation-empty {
    min-height: 105px;
    border-radius: 12px;
  }

  .invitation-empty-icon {
    width: 36px;
    height: 36px;
  }

  .invitation-empty-icon svg {
    width: 18px;
    height: 18px;
  }

  .invitation-empty p {
    font-size: 9px;
  }
}
</style>
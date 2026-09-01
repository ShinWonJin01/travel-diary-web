<script setup lang="ts">
import type { Participant } from '@/composables/trips/useTripParticipants'

defineProps<{
  participantCount: number
  participants: Participant[]
  ownerId: number
  isOwner: boolean
  isInviting: boolean
  invitationMessage: string
  invitationErrorMessage: string
}>()

const inviteNickname = defineModel<string>('inviteNickname', {
  required: true,
})

const emit = defineEmits<{
  close: []
  invite: []
}>()
</script>

<template>
  <div
    class="participant-modal-backdrop"
    @click.self="emit('close')"
  >
    <section
      class="participant-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-modal-title"
    >
      <div class="participant-modal-header">
        <div>
          <p>PARTICIPANTS</p>
          <h2 id="participant-modal-title">참여자 관리</h2>
        </div>

        <button
          class="participant-modal-close"
          type="button"
          aria-label="닫기"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <div class="participant-modal-summary">
        <strong>현재 {{ participantCount }}명이 함께하고 있어요.</strong>
        <span>여행에 참여하고 있는 멤버를 확인할 수 있습니다.</span>
      </div>

      <div class="participant-modal-list">
        <article
          v-for="participant in participants"
          :key="participant.id"
        >
          <span
            class="participant-avatar"
            :class="participant.avatarClass"
          >
            <img
              v-if="participant.profileImageUrl"
              :src="participant.profileImageUrl"
              :alt="`${participant.nickname} 프로필`"
            />
            <span v-else>
              {{ participant.nickname.slice(0, 1) }}
            </span>
          </span>

          <div class="participant-information">
            <strong>{{ participant.nickname }}</strong>
            <span>
              {{ participant.id === ownerId ? '여행 생성자' : '참여자' }}
            </span>
          </div>
        </article>
      </div>

      <form
        v-if="isOwner"
        class="participant-invite-form"
        @submit.prevent="emit('invite')"
      >
        <label for="participant-invite-nickname">
          닉네임으로 여행 초대
        </label>

        <div class="participant-invite-row">
          <input
            id="participant-invite-nickname"
            v-model.trim="inviteNickname"
            type="text"
            placeholder="초대할 사용자의 닉네임"
            :disabled="isInviting"
          />

          <button type="submit" :disabled="isInviting">
            {{ isInviting ? '초대 중...' : '초대하기' }}
          </button>
        </div>

        <p
          v-if="invitationMessage"
          class="participant-action-message"
          role="status"
        >
          {{ invitationMessage }}
        </p>

        <p
          v-if="invitationErrorMessage"
          class="participant-action-error"
          role="alert"
        >
          {{ invitationErrorMessage }}
        </p>
      </form>
    </section>
  </div>
</template>

<style scoped>
.participant-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.participant-modal {
  width: min(460px, 100%);
  max-height: min(680px, calc(100vh - 40px));
  overflow-y: auto;
  padding: 22px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
}

.participant-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.participant-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--tmr-primary);
}

.participant-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.participant-modal-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.participant-modal-close:hover {
  color: var(--tmr-primary);
  background: var(--tmr-background);
}

.participant-modal-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
  padding: 14px;
  border: 1px solid var(--tmr-border);
  border-radius: 10px;
  background: var(--tmr-surface-soft);
}

.participant-modal-summary strong {
  font-size: 13px;
  color: var(--tmr-text);
}

.participant-modal-summary span {
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.participant-modal-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.participant-modal-list article {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 2px;
  border-bottom: 1px solid var(--tmr-border);
}

.participant-modal-list article:last-child {
  border-bottom: 0;
}

.participant-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 2px solid var(--tmr-surface);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-surface);
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-blue {
  background: var(--tmr-primary);
}

.avatar-green {
  background: #63ad9a;
}

.avatar-orange {
  background: var(--tmr-accent);
}

.participant-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.participant-information strong {
  overflow: hidden;
  font-size: 12px;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.participant-information span {
  font-size: 9px;
  color: var(--tmr-text-sub);
}

.participant-invite-form {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--tmr-border);
}

.participant-invite-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-text);
}

.participant-invite-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.participant-invite-row input {
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--tmr-border);
  border-radius: 9px;
  outline: none;
  font-size: 12px;
  color: var(--tmr-text);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.participant-invite-row input::placeholder {
  color: var(--tmr-text-sub);
}

.participant-invite-row input:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 12%, transparent);
}

.participant-invite-row input:disabled {
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.participant-invite-row button {
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-surface);
  background: var(--tmr-primary);
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.participant-invite-row button:hover:not(:disabled) {
  background: var(--tmr-primary-dark);
}

.participant-invite-row button:active:not(:disabled) {
  transform: scale(0.98);
}

.participant-invite-row button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.participant-action-message,
.participant-action-error {
  margin: 9px 0 0;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: 10px;
}

.participant-action-message {
  color: #2f8068;
  background: #e9f7f2;
}

.participant-action-error {
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

@media (max-width: 760px) {
  .participant-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .participant-modal {
    width: 100%;
    max-height: 82vh;
    padding: 18px 17px 22px;
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
    border-radius: 18px 18px 0 0;
  }

  .participant-modal-header h2 {
    font-size: 17px;
  }

  .participant-invite-row {
    grid-template-columns: 1fr;
  }

  .participant-invite-row button {
    width: 100%;
  }
}
</style>
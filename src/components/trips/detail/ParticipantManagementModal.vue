<script setup lang="ts">
interface Participant {
  id: number
  nickname: string
  profileImageUrl: string | null
  avatarClass: string
}

defineProps<{
  participantCount: number
  participants: Participant[]
  ownerId: number
  isOwner: boolean
  isInviting: boolean
  invitationMessage: string
  invitationErrorMessage: string
}>()

const inviteNickname = defineModel<string>('inviteNickname', { required: true })

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
    <section class="participant-modal">
      <div class="participant-modal-header">
        <div>
          <p>PARTICIPANTS</p>
          <h2>참여자 관리</h2>
        </div>

        <button
          type="button"
          class="participant-modal-close"
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
            <template v-else>
              {{ participant.nickname.slice(0, 1) }}
            </template>
          </span>

          <div>
            <strong>{{ participant.nickname }}</strong>
            <span>
              {{ participant.id === ownerId ? '여행 생성자' : '참여자' }}
            </span>
          </div>
        </article>

        <p class="participant-list-guide">
          현재 여행 상세 API에서는 전체 참여자 정보가 제공되지 않아
          확인 가능한 참여자만 표시하고 있습니다.
        </p>
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

          <button
            type="submit"
            :disabled="isInviting"
          >
            {{ isInviting ? '초대 중...' : '초대하기' }}
          </button>
        </div>

        <p
          v-if="invitationMessage"
          class="participant-action-message"
        >
          {{ invitationMessage }}
        </p>

        <p
          v-if="invitationErrorMessage"
          class="participant-action-error"
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
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
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
  color: #4c6fea;
}

.participant-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222a36;
}

.participant-modal-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: #747e8c;
  background: #f3f5f8;
  cursor: pointer;
}

.participant-modal-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
  padding: 14px;
  border-radius: 10px;
  background: #f5f7fb;
}

.participant-modal-summary strong {
  font-size: 13px;
  color: #343c48;
}

.participant-modal-summary span {
  font-size: 10px;
  color: #8b94a0;
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
  border-bottom: 1px solid #edf0f4;
}

.participant-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 2px solid #ffffff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-blue {
  background: #6f91c1;
}

.avatar-green {
  background: #72a584;
}

.avatar-orange {
  background: #c88d61;
}

.remaining-avatar {
  color: #5e6b7a;
  background: #eef1f5;
}

.participant-modal-list article > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.participant-modal-list article strong {
  font-size: 12px;
  color: #303743;
}

.participant-modal-list article div span {
  font-size: 9px;
  color: #939ba6;
}

.participant-list-guide {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 9px;
  line-height: 1.6;
  color: #7e8793;
  background: #f7f8fa;
}

.participant-invite-form {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e8ecf1;
}

.participant-invite-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #495362;
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
  border: 1px solid #dce2ea;
  border-radius: 9px;
  outline: none;
  font-size: 12px;
}

.participant-invite-row input:focus {
  border-color: #5878e9;
  box-shadow: 0 0 0 3px rgba(88, 120, 233, 0.11);
}

.participant-invite-row button {
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #3565ef;
  cursor: pointer;
}

.participant-invite-row button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.participant-action-message,
.participant-action-error {
  margin: 9px 0 0;
  font-size: 10px;
}

.participant-action-message {
  color: #28745c;
}

.participant-action-error {
  color: #c74658;
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
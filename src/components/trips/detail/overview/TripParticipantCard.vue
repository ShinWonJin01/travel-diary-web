<script setup lang="ts">
import type { Participant } from '@/composables/trips/useTripParticipants'

defineProps<{
  participantCount: number
  visibleParticipants: Participant[]
  remainingParticipantCount: number
  isOwner: boolean
}>()

const emit = defineEmits<{
  'open-participants': []
}>()
</script>

<template>
  <section class="mobile-participant-card">
    <button
      class="mobile-participant-summary"
      type="button"
      @click="emit('open-participants')"
    >
      <span class="mobile-participant-label">
        참여자
        <strong>{{ participantCount }}명</strong>
      </span>

      <span class="mobile-participant-avatars">
        <span
          v-for="participant in visibleParticipants"
          :key="participant.id"
          class="participant-avatar"
          :class="participant.avatarClass"
          :title="participant.nickname"
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

        <span
          v-if="remainingParticipantCount > 0"
          class="participant-avatar remaining-avatar"
        >
          +{{ remainingParticipantCount }}
        </span>
      </span>
    </button>

    <button
      v-if="isOwner"
      class="mobile-invite-button"
      type="button"
      @click="emit('open-participants')"
    >
      + 초대
    </button>
  </section>
</template>

<style scoped>
.mobile-participant-card {
  display: none;
}

.participant-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  margin-left: -8px;
  place-items: center;
  overflow: hidden;
  border: 2px solid #ffffff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
}

.participant-avatar:first-child {
  margin-left: 0;
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

@media (max-width: 760px) {
  .mobile-participant-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px 12px;
    border: 1px solid #e6eaf2;
    border-radius: 10px;
    background: #ffffff;
  }

  .mobile-participant-summary {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
    border: 0;
    color: inherit;
    text-align: left;
    background: transparent;
    cursor: pointer;
  }

  .mobile-participant-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 8px;
    color: #8c95a1;
  }

  .mobile-participant-label strong {
    font-size: 10px;
    color: #343c48;
  }

  .mobile-participant-avatars {
    display: flex;
    align-items: center;
    padding-left: 7px;
  }

  .mobile-participant-avatars .participant-avatar {
    width: 27px;
    height: 27px;
    font-size: 9px;
  }

  .mobile-invite-button {
    height: 32px;
    flex: 0 0 auto;
    padding: 0 11px;
    border: 1px solid #cfdaff;
    border-radius: 8px;
    font-size: 9px;
    font-weight: 700;
    color: #315fe8;
    background: #eef3ff;
    cursor: pointer;
  }
}
</style>
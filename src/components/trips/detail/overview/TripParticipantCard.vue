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
          <span v-else>{{ participant.nickname.slice(0, 1) }}</span>
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
  border: 2px solid var(--tmr-surface);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-surface);
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
  background: var(--tmr-primary);
}

.avatar-green {
  background: #63ad9a;
}

.avatar-orange {
  background: var(--tmr-accent);
}

.remaining-avatar {
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

@media (max-width: 760px) {
  .mobile-participant-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px 12px;
    border: 1px solid var(--tmr-border);
    border-radius: 10px;
    background: var(--tmr-surface);
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
  }

  .mobile-participant-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 8px;
    color: var(--tmr-text-sub);
  }

  .mobile-participant-label strong {
    font-size: 10px;
    color: var(--tmr-text);
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
    border: 1px solid var(--tmr-border);
    border-radius: 8px;
    font-size: 9px;
    font-weight: 700;
    color: var(--tmr-primary);
    background: var(--tmr-surface-soft);
    transition:
      border-color 0.2s ease,
      background 0.2s ease;
  }

  .mobile-invite-button:hover {
    border-color: var(--tmr-primary);
    background: color-mix(
      in srgb,
      var(--tmr-primary) 12%,
      var(--tmr-surface)
    );
  }
}
</style>
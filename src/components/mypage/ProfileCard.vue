<script setup lang="ts">
import { ref, watch } from 'vue'

import type { Member } from '@/api/auth'

const props = defineProps<{
  member: Member | null
  profileInitial: string
  profileImageUrl: string | null
}>()

const isProfileImageBroken = ref(false)

watch(
  () => props.profileImageUrl,
  () => {
    isProfileImageBroken.value = false
  },
)
</script>

<template>
  <section class="profile-card">
    <div 
      class="profile-avatar" 
      :class="{ 'has-image': profileImageUrl && !isProfileImageBroken }"
    >
      <img
        v-if="profileImageUrl && !isProfileImageBroken"
        :src="profileImageUrl"
        :alt="`${member?.name ?? '사용자'} 프로필 사진`"
        @error="isProfileImageBroken = true"
      />

      <span v-else>
        {{ profileInitial }}
      </span>
    </div>

    <div class="profile-information">
      <h2>{{ member?.name ?? '사용자' }}</h2>
      <p>{{ member?.email ?? '' }}</p>

      <span v-if="member" class="profile-nickname">
        {{ member.nickname }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 25px 26px;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
  box-shadow: 0 5px 18px rgba(49, 95, 217, 0.05);
}

.profile-avatar {
  display: flex;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 50%;
  color: var(--tmr-surface);
  background: linear-gradient(
    145deg,
    var(--tmr-primary),
    var(--tmr-primary-dark)
  );
}

.profile-avatar span {
  font-size: 25px;
  font-weight: 700;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar.has-image {
  background: transparent;
}

.profile-information {
  min-width: 0;
}

.profile-information h2 {
  overflow: hidden;
  margin: 0;
  font-size: 21px;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-information p {
  overflow: hidden;
  margin: 7px 0 0;
  font-size: 13px;
  color: var(--tmr-text-sub);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-nickname {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  margin-top: 7px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

@media (max-width: 760px) {
  .profile-card {
    gap: 14px;
    padding: 17px;
    border-radius: 11px;
    box-shadow: none;
  }

  .profile-avatar {
    width: 58px;
    height: 58px;
  }

  .profile-avatar span {
    font-size: 19px;
  }

  .profile-information h2 {
    font-size: 16px;
  }

  .profile-information p {
    margin-top: 5px;
    font-size: 10px;
  }

  .profile-nickname {
    min-height: 20px;
    margin-top: 5px;
    padding: 0 7px;
    font-size: 8px;
  }
}
</style>
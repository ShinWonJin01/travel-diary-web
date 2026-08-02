<script setup lang="ts">
import { ref, watch } from 'vue'

import type { Member } from '@/api/auth'

const props = defineProps<{
  member: Member | null
  profileInitial: string
  profileImageUrl: string | null
}>()

const isProfileImageBroken = ref(false)

/*
 * 프로필 이미지가 변경되면
 * 이전 이미지의 오류 상태를 초기화
 */
watch(
  () => props.profileImageUrl,
  () => {
    isProfileImageBroken.value = false
  },
)
</script>

<template>
  <section class="profile-card">
    <div class="profile-avatar">
      <img
        v-if="profileImageUrl && !isProfileImageBroken"
        :src="profileImageUrl"
        alt="프로필 사진"
        @error="isProfileImageBroken = true"
      />

      <span v-else>
        {{ profileInitial }}
      </span>
    </div>

    <div class="profile-information">
      <h2>
        {{ member?.name ?? '사용자' }}
      </h2>

      <p>
        {{ member?.email ?? '' }}
      </p>

      <span
        v-if="member"
        class="profile-nickname"
      >
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
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(37, 54, 78, 0.06);
}

.profile-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  overflow: hidden;
  border-radius: 50%;
  color: #ffffff;
  background: linear-gradient(145deg, #7798be, #4e6688);
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

.profile-information {
  min-width: 0;
}

.profile-information h2 {
  margin: 0;
  font-size: 21px;
  color: #222934;
}

.profile-information p {
  margin: 7px 0 0;
  font-size: 13px;
  color: #89919d;
}

.profile-nickname {
  display: block;
  margin-top: 5px;
  font-size: 11px;
  font-weight: 600;
  color: #607087;
}

/* =========================
   모바일
========================= */

@media (max-width: 760px) {
  .profile-card {
    gap: 14px;
    padding: 17px;
    border-radius: 11px;
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
    margin-top: 4px;
    font-size: 9px;
  }
}
</style>
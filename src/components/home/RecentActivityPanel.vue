<script setup lang="ts">
import { RouterLink } from 'vue-router'

import type { RecentActivity } from '@/api/home'

defineProps<{
  activities: RecentActivity[]
}>()

const getActivityMessage = (activity: RecentActivity) => {
  if (activity.photoCount === 1) return '사진을 추가했습니다.'

  return `사진 ${activity.photoCount}장을 추가했습니다.`
}

const formatActivityTime = (createdAt: string) => {
  const createdTime = new Date(createdAt).getTime()

  if (Number.isNaN(createdTime)) return ''

  const diff = Math.max(Date.now() - createdTime, 0)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '방금 전'
  if (diff < hour) return `${Math.floor(diff / minute)}분 전`
  if (diff < day) return `${Math.floor(diff / hour)}시간 전`
  if (diff < 7 * day) return `${Math.floor(diff / day)}일 전`

  return new Date(createdAt).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  })
}
</script>

<template>
  <aside class="activity-area">
    <h1>최근 활동</h1>

    <div v-if="activities.length > 0" class="activity-list">
      <RouterLink
        v-for="activity in activities"
        :key="`${activity.tripId}-${activity.actorNickname}-${activity.createdAt}`"
        class="activity-item"
        :to="`/trips/${activity.tripId}`"
      >
        <div class="activity-profile">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 22c0-5 3-8 8-8s8 3 8 8" />
          </svg>
        </div>

        <div class="activity-information">
          <p>
            <strong>{{ activity.actorNickname }}님이</strong>
            {{ getActivityMessage(activity) }}
          </p>
          <span>
            {{ activity.tripTitle }} · {{ formatActivityTime(activity.createdAt) }}
          </span>
        </div>
      </RouterLink>
    </div>

    <div v-else class="empty-activity">
      <div class="empty-activity-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      </div>
      <p>아직 최근 활동이 없습니다.</p>
    </div>

    <RouterLink class="create-trip-button" to="/trips/create">
      여행 만들기
    </RouterLink>
  </aside>
</template>

<style scoped>
.activity-area {
  display: flex;
  flex-direction: column;
  padding: 42px 42px 44px;
  border-left: 1px solid var(--tmr-border);
  background: var(--tmr-surface);
}

.activity-area > h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--tmr-text);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 34px;
}

.activity-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: start;
  gap: 13px;
}

.activity-item:hover .activity-profile {
  color: var(--tmr-primary-dark);
  background: var(--tmr-surface-soft);
}

.activity-item:hover .activity-information p {
  color: var(--tmr-primary-dark);
}

.activity-profile {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--tmr-border);
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.activity-profile svg {
  width: 27px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
}

.activity-information {
  min-width: 0;
}

.activity-information p {
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--tmr-text);
  transition: color 0.2s ease;
}

.activity-information strong {
  font-weight: 700;
}

.activity-information span {
  display: block;
  overflow: hidden;
  margin-top: 5px;
  font-size: 10px;
  color: var(--tmr-text-sub);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-activity {
  display: flex;
  min-height: 150px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.empty-activity-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.empty-activity-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.empty-activity p {
  margin: 0;
  font-size: 11px;
  color: var(--tmr-text-sub);
}

.create-trip-button {
  display: flex;
  height: 52px;
  align-items: center;
  justify-content: center;
  margin-top: auto;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--tmr-surface);
  background: var(--tmr-primary);
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.create-trip-button:hover {
  background: var(--tmr-primary-dark);
}

.create-trip-button:active {
  transform: scale(0.98);
}

@media (max-width: 900px) {
  .activity-area {
    display: none;
  }
}
</style>
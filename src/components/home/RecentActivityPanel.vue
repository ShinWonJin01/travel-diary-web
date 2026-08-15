<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { RecentActivity } from '@/api/home'

defineProps<{
  activities: RecentActivity[]
}>()

const getActivityMessage = (activity: RecentActivity) => {
  if (activity.photoCount === 1) {
    return '사진을 추가했습니다.'
  }

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
  border-left: 1px solid #dfe4e9;
}

.activity-area > h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #171c24;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 34px;
}

.activity-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  align-items: start;
  gap: 13px;
  color: inherit;
  text-decoration: none;
}

.activity-item:hover .activity-information p {
  color: #3157e8;
}

.activity-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1.5px solid #222831;
  border-radius: 50%;
}

.activity-profile svg {
  width: 27px;
  fill: none;
  stroke: #222831;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
}

.activity-information p {
  margin: 1px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #272c34;
}

.activity-information strong {
  font-weight: 700;
}

.activity-information span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: #8f969f;
}

.empty-activity {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
}

.empty-activity p {
  margin: 0;
  font-size: 12px;
  color: #959da7;
}

.create-trip-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  margin-top: auto;
  border-radius: 7px;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
}

.create-trip-button:hover {
  background: #304bea;
}

@media (max-width: 900px) {
  .activity-area {
    display: none;
  }
}
</style>
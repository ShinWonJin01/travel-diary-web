<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface Activity {
  id: number
  user: string
  action: string
  trip: string
  time: string
}

defineProps<{
  activities: Activity[]
}>()
</script>

<template>
  <aside class="activity-area">
    <h1>최근 활동</h1>

    <div class="activity-list">
      <article
        v-for="activity in activities"
        :key="activity.id"
        class="activity-item"
      >
        <div class="activity-profile">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 22c0-5 3-8 8-8s8 3 8 8" />
          </svg>
        </div>

        <div class="activity-information">
          <p>
            <strong>{{ activity.user }}님이</strong>
            {{ activity.action }}
          </p>

          <span>
            {{ activity.trip }} · {{ activity.time }}
          </span>
        </div>
      </article>
    </div>

    <RouterLink
      class="create-trip-button"
      to="/trips/create"
    >
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
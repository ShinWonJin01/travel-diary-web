<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface RecentTrip {
  id: number
  title: string
  period: string
  theme: string
}

interface ParticipatingTrip {
  id: number
  title: string
  participants: number
  period: string
  theme: string
}

interface Activity {
  id: number
  user: string
  action: string
  trip: string
  time: string
}

const recentTrips: RecentTrip[] = [
  {
    id: 1,
    title: '도쿄 여행',
    period: '2024.06.23 - 06.26',
    theme: 'trip-theme-blue',
  },
  {
    id: 2,
    title: '도쿄 여행',
    period: '2024.06.23 - 06.26',
    theme: 'trip-theme-green',
  },
  {
    id: 3,
    title: '도쿄 여행',
    period: '2024.06.23 - 06.26',
    theme: 'trip-theme-purple',
  },
  {
    id: 4,
    title: '도쿄 여행',
    period: '2024.06.23 - 06.26',
    theme: 'trip-theme-sky',
  },
]

const participatingTrips: ParticipatingTrip[] = [
  {
    id: 1,
    title: '도쿄 여행',
    participants: 4,
    period: '2024.06.23 - 06.26',
    theme: 'thumbnail-blue',
  },
  {
    id: 2,
    title: '도쿄 여행',
    participants: 4,
    period: '2024.06.23 - 06.26',
    theme: 'thumbnail-green',
  },
]

const activities: Activity[] = [
  {
    id: 1,
    user: '홍길동',
    action: '사진을 추가했어요.',
    trip: '도쿄 여행',
    time: '2시간 전',
  },
  {
    id: 2,
    user: '홍길동',
    action: '사진을 추가했어요.',
    trip: '도쿄 여행',
    time: '2시간 전',
  },
  {
    id: 3,
    user: '홍길동',
    action: '사진을 추가했어요.',
    trip: '도쿄 여행',
    time: '2일 전',
  },
]
</script>

<template>
  <div class="home-layout">
    <div class="home-main">
      <!-- 최근 여행 -->
      <section class="recent-trip-section">
        <div class="section-heading">
          <h1>최근 여행</h1>

          <RouterLink to="/trips">
            더보기
            <span>›</span>
          </RouterLink>
        </div>

        <div class="recent-trip-list">
          <RouterLink
            v-for="trip in recentTrips"
            :key="trip.id"
            class="recent-trip-card"
            :to="`/trips/${trip.id}`"
          >
            <div class="recent-trip-image" :class="trip.theme">
              <svg viewBox="0 0 64 52" aria-hidden="true">
                <path d="M4 48 22 26l10 12 9-11 19 21z" />
                <circle cx="45" cy="14" r="7" />
              </svg>
            </div>

            <div class="recent-trip-information">
              <h2>{{ trip.title }}</h2>
              <p>{{ trip.period }}</p>
            </div>
          </RouterLink>
        </div>
      </section>

      <!-- 참여 중인 여행 -->
      <section class="participating-section">
        <div class="section-heading">
          <h1>참여 중인 여행</h1>

          <RouterLink
            :to="{
              path: '/trips',
              query: {
                filter: 'participating',
              },
            }"
          >
            더보기
            <span>›</span>
          </RouterLink>
        </div>

        <div class="participating-list">
          <RouterLink
            v-for="trip in participatingTrips"
            :key="trip.id"
            class="participating-item"
            :to="{
              path: '/trips',
              query: {
                filter: 'participating',
              },
            }"
          >
            <div class="participating-thumbnail" :class="trip.theme">
              <svg viewBox="0 0 32 27" aria-hidden="true">
                <path d="M2 25 11 14l5 6 5-7 9 12z" />
                <circle cx="22" cy="7" r="4" />
              </svg>
            </div>

            <div class="participating-information">
              <h2>{{ trip.title }}</h2>

              <p>
                참여자 {{ trip.participants }}명
                <span>|</span>
                {{ trip.period }}
              </p>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>

    <!-- PC 최근 활동 -->
    <aside class="activity-area">
      <h1>최근 활동</h1>

      <div class="activity-list">
        <article v-for="activity in activities" :key="activity.id" class="activity-item">
          <div class="activity-profile">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 22c0-5 3-8 8-8s8 3 8 8" />
            </svg>
          </div>

          <div class="activity-information">
            <p>
              <strong>{{ activity.user }}님이</strong>
              {{ activity.action }}
            </p>

            <span> {{ activity.trip }} · {{ activity.time }} </span>
          </div>
        </article>
      </div>

      <RouterLink class="create-trip-button" to="/trips/create"> 여행 만들기 </RouterLink>
    </aside>
  </div>
</template>

<style scoped>
.home-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  min-height: 650px;
}

.home-main {
  min-width: 0;
  padding: 42px 42px 50px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-heading h1,
.activity-area > h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #171c24;
}

.section-heading a {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: #3f63f0;
}

.section-heading a span {
  font-size: 20px;
  line-height: 1;
}

.recent-trip-section {
  padding: 24px 28px 22px;
  border-radius: 22px;
  background: #f6fafc;
}

.recent-trip-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.recent-trip-card {
  overflow: hidden;
  border-radius: 14px 14px 0 0;
  background: #ffffff;
  box-shadow: 0 3px 0 #c9d0d7;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.recent-trip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(47, 69, 96, 0.13);
}

.recent-trip-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 126px;
}

.recent-trip-image svg {
  width: 58px;
  fill: #ffffff;
  opacity: 0.9;
}

.trip-theme-blue {
  background: linear-gradient(145deg, #9eb8d3, #7897b9);
}

.trip-theme-green {
  background: linear-gradient(145deg, #abcbbd, #6b9c8b);
}

.trip-theme-purple {
  background: linear-gradient(145deg, #a8a5cc, #7778ab);
}

.trip-theme-sky {
  background: linear-gradient(145deg, #acd5e8, #6eafca);
}

.recent-trip-information {
  padding: 13px 11px 12px;
}

.recent-trip-information h2,
.participating-information h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #252a33;
}

.recent-trip-information p,
.participating-information p {
  margin: 7px 0 0;
  font-size: 10px;
  color: #808894;
}

.participating-section {
  margin-top: 50px;
}

.participating-list {
  border-top: 1px solid #e5e8ed;
}

.participating-item {
  display: flex;
  align-items: center;
  gap: 17px;
  min-height: 84px;
  padding: 14px 10px;
  border-bottom: 1px solid #e5e8ed;
}

.participating-item:hover {
  background: #f8fafc;
}

.participating-thumbnail {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 8px;
}

.participating-thumbnail svg {
  width: 28px;
  fill: #ffffff;
}

.thumbnail-blue {
  background: #a6bdd6;
}

.thumbnail-green {
  background: #9cbeb1;
}

.participating-information p span {
  margin: 0 5px;
  color: #c2c7ce;
}

.activity-area {
  display: flex;
  flex-direction: column;
  padding: 42px 42px 44px;
  border-left: 1px solid #dfe4e9;
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
  .home-layout {
    grid-template-columns: 1fr;
  }

  .activity-area {
    display: none;
  }

  .recent-trip-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .recent-trip-card:last-child {
    display: none;
  }
}

@media (max-width: 760px) {
  .home-layout {
    display: block;
    min-height: auto;
  }

  .home-main {
    padding: 23px 17px 92px;
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

  .recent-trip-section {
    padding: 0;
    border-radius: 0;
    background: transparent;
  }

  .recent-trip-list {
    display: flex;
    gap: 9px;
    overflow-x: auto;
    padding-bottom: 4px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .recent-trip-list::-webkit-scrollbar {
    display: none;
  }

  .recent-trip-card {
    flex: 0 0 132px;
    border-radius: 8px;
    box-shadow: none;
    scroll-snap-align: start;
  }

  .recent-trip-card:last-child {
    display: block;
  }

  .recent-trip-image {
    height: 86px;
    border-radius: 8px;
  }

  .recent-trip-image svg {
    width: 39px;
  }

  .recent-trip-information {
    padding: 8px 1px 3px;
  }

  .recent-trip-information h2 {
    font-size: 11px;
  }

  .recent-trip-information p {
    margin-top: 4px;
    font-size: 8px;
  }

  .participating-section {
    margin-top: 30px;
  }

  .participating-list {
    border-top: 0;
  }

  .participating-item {
    min-height: 62px;
    gap: 11px;
    padding: 8px 0;
  }

  .participating-thumbnail {
    width: 58px;
    height: 48px;
    border-radius: 7px;
  }

  .participating-thumbnail svg {
    width: 24px;
  }

  .participating-information h2 {
    font-size: 11px;
  }

  .participating-information p {
    margin-top: 5px;
    font-size: 8px;
  }
}
</style>

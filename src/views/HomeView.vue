<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface RecentTrip {
  id: number
  title: string
  period: string
  theme: string
}

interface ReceivedInvitation {
  id: number
  tripId: number
  title: string
  inviter: string
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
    title: '제주도 여행',
    period: '2024.07.10 - 07.13',
    theme: 'trip-theme-green',
  },
  {
    id: 3,
    title: '부산 여행',
    period: '2024.08.02 - 08.04',
    theme: 'trip-theme-purple',
  },
  {
    id: 4,
    title: '강릉 여행',
    period: '2024.09.14 - 09.16',
    theme: 'trip-theme-sky',
  },
]

const receivedInvitations: ReceivedInvitation[] = [
  {
    id: 1,
    tripId: 5,
    title: '오사카 친구 여행',
    inviter: '홍길동',
    participants: 4,
    period: '2026.08.10 - 08.13',
    theme: 'invitation-theme-blue',
  },
  {
    id: 2,
    tripId: 6,
    title: '여수 여름 여행',
    inviter: '김민수',
    participants: 3,
    period: '2026.08.22 - 08.24',
    theme: 'invitation-theme-green',
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
    user: '김민수',
    action: '여행에 참여했어요.',
    trip: '제주도 여행',
    time: '5시간 전',
  },
  {
    id: 3,
    user: '이영희',
    action: '사진을 추가했어요.',
    trip: '부산 여행',
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

          <RouterLink
            :to="{
              path: '/trips',
              query: {
                filter: 'all',
              },
            }"
          >
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
            <div
              class="recent-trip-image"
              :class="trip.theme"
            >
              <svg
                viewBox="0 0 64 52"
                aria-hidden="true"
              >
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

      <!-- 받은 여행 초대 -->
      <section class="invitation-section">
        <div class="section-heading">
          <div class="invitation-heading-title">
            <h1>받은 여행 초대</h1>

            <span
              v-if="receivedInvitations.length > 0"
              class="invitation-count"
            >
              {{ receivedInvitations.length }}
            </span>
          </div>

          <RouterLink to="/invitations">
            더보기
            <span>›</span>
          </RouterLink>
        </div>

        <div
          v-if="receivedInvitations.length > 0"
          class="invitation-list"
        >
          <article
            v-for="invitation in receivedInvitations"
            :key="invitation.id"
            class="invitation-item"
          >
            <div
              class="invitation-thumbnail"
              :class="invitation.theme"
            >
              <svg
                viewBox="0 0 32 27"
                aria-hidden="true"
              >
                <path d="M2 25 11 14l5 6 5-7 9 12z" />
                <circle cx="22" cy="7" r="4" />
              </svg>
            </div>

            <div class="invitation-information">
              <div class="invitation-title-row">
                <h2>{{ invitation.title }}</h2>

                <span class="invitation-status">
                  초대 대기
                </span>
              </div>

              <p class="inviter-information">
                <strong>{{ invitation.inviter }}</strong>님이
                여행에 초대했어요.
              </p>

              <p class="invitation-detail">
                참여자 {{ invitation.participants }}명
                <span>|</span>
                {{ invitation.period }}
              </p>
            </div>

            <RouterLink
              class="invitation-check-button"
              to="/invitations"
              :aria-label="`${invitation.title} 초대 확인`"
            >
              초대 확인
            </RouterLink>
          </article>
        </div>

        <div
          v-else
          class="invitation-empty"
        >
          <span class="invitation-empty-icon">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
              />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>

          <p>현재 받은 여행 초대가 없습니다.</p>
        </div>
      </section>
    </div>

    <!-- PC 최근 활동 -->
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

    <!-- 모바일 여행 만들기 버튼 -->
    <RouterLink
      class="mobile-create-trip-button"
      to="/trips/create"
      aria-label="새 여행 만들기"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>

      <span>여행 만들기</span>
    </RouterLink>
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

/* 최근 여행 */
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

.recent-trip-information h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #252a33;
}

.recent-trip-information p {
  margin: 7px 0 0;
  font-size: 10px;
  color: #808894;
}

/* 받은 여행 초대 */
.invitation-section {
  margin-top: 50px;
}

.invitation-heading-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invitation-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
}

.invitation-list {
  border-top: 1px solid #e5e8ed;
}

.invitation-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 96px;
  padding: 14px 10px;
  border-bottom: 1px solid #e5e8ed;
  transition: background 0.2s ease;
}

.invitation-item:hover {
  background: #f8fafc;
}

.invitation-thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 9px;
}

.invitation-thumbnail svg {
  width: 29px;
  fill: #ffffff;
}

.invitation-theme-blue {
  background: linear-gradient(145deg, #a6bdd6, #7899bd);
}

.invitation-theme-green {
  background: linear-gradient(145deg, #9fc5b7, #6c9d8b);
}

.invitation-information {
  min-width: 0;
}

.invitation-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invitation-title-row h2 {
  overflow: hidden;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #252a33;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invitation-status {
  flex-shrink: 0;
  padding: 3px 7px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 700;
  color: #4566e8;
  background: #edf1ff;
}

.inviter-information {
  margin: 6px 0 0;
  font-size: 11px;
  color: #565f6b;
}

.inviter-information strong {
  font-weight: 700;
  color: #343b46;
}

.invitation-detail {
  margin: 5px 0 0;
  font-size: 10px;
  color: #8a929d;
}

.invitation-detail span {
  margin: 0 5px;
  color: #c2c7ce;
}

.invitation-check-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 13px;
  border: 1px solid #405bf4;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
  color: #405bf4;
  background: #ffffff;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.invitation-check-button:hover {
  color: #ffffff;
  background: #405bf4;
}

.invitation-empty {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid #e5e8ed;
  border-bottom: 1px solid #e5e8ed;
  color: #98a0aa;
}

.invitation-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #8794a3;
  background: #f1f4f7;
}

.invitation-empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.invitation-empty p {
  margin: 0;
  font-size: 11px;
}

/* PC 최근 활동 */
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

/* 모바일 여행 만들기 버튼 */
.mobile-create-trip-button {
  display: none;
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
    padding: 23px 17px 150px;
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

  /* 모바일 최근 여행 */
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

  /* 모바일 받은 여행 초대 */
  .invitation-section {
    margin-top: 30px;
  }

  .invitation-heading-title {
    gap: 6px;
  }

  .invitation-count {
    min-width: 17px;
    height: 17px;
    padding: 0 5px;
    font-size: 8px;
  }

  .invitation-list {
    border-top: 0;
  }

  .invitation-item {
    grid-template-columns: 51px minmax(0, 1fr) auto;
    gap: 10px;
    min-height: 78px;
    padding: 10px 0;
  }

  .invitation-thumbnail {
    width: 51px;
    height: 51px;
    border-radius: 7px;
  }

  .invitation-thumbnail svg {
    width: 24px;
  }

  .invitation-title-row {
    gap: 5px;
  }

  .invitation-title-row h2 {
    font-size: 11px;
  }

  .invitation-status {
    padding: 2px 5px;
    font-size: 7px;
  }

  .inviter-information {
    margin-top: 4px;
    font-size: 8px;
  }

  .invitation-detail {
    margin-top: 4px;
    font-size: 8px;
  }

  .invitation-check-button {
    height: 29px;
    padding: 0 9px;
    border-radius: 6px;
    font-size: 8px;
  }

  .invitation-empty {
    min-height: 105px;
  }

  .invitation-empty-icon {
    width: 34px;
    height: 34px;
  }

  .invitation-empty-icon svg {
    width: 18px;
    height: 18px;
  }

  .invitation-empty p {
    font-size: 9px;
  }

  /* 모바일 여행 만들기 고정 버튼 */
  .mobile-create-trip-button {
    position: fixed;
    right: 17px;
    bottom: calc(82px + env(safe-area-inset-bottom));
    z-index: 40;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;

    height: 46px;
    padding: 0 17px;
    border-radius: 23px;

    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    background: #405bf4;
    box-shadow: 0 7px 20px rgba(64, 91, 244, 0.3);
    text-decoration: none;

    transition:
      transform 0.15s ease,
      background 0.15s ease;
  }

  .mobile-create-trip-button:active {
    background: #304bea;
    transform: scale(0.97);
  }

  .mobile-create-trip-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { getReceivedInvitations } from '@/api/invitations'
import { getTrips } from '@/api/trips'

import RecentTripsSection from '@/components/home/RecentTripsSection.vue'
import ReceivedInvitationsSection from '@/components/home/ReceivedInvitationsSection.vue'
import RecentActivityPanel from '@/components/home/RecentActivityPanel.vue'

interface RecentTrip {
  id: number
  title: string
  period: string
  theme: string
  coverImageUrl: string
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

const recentTripThemes = [
  'trip-theme-blue',
  'trip-theme-green',
  'trip-theme-purple',
  'trip-theme-sky',
]

const backendBaseUrl = (() => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

  if (!configuredUrl || configuredUrl.startsWith('/')) return 'http://localhost:8080'

  return configuredUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
})()

const getCoverImageUrl = (path: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const cleanedPath = path.replaceAll('\\', '/')
  const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`

  return `${backendBaseUrl}${normalizedPath}`
}

const recentTrips = ref<RecentTrip[]>([])

const formatTripPeriod = (
  startDate: string,
  endDate: string | null,
) => {
  const [startYear, startMonth, startDay] = startDate.split('-')

  if (!startYear || !startMonth || !startDay) return '-'

  const formattedStart = `${startYear}.${startMonth}.${startDay}`

  if (!endDate) return `${formattedStart} - 종료일 미정`

  const [, endMonth, endDay] = endDate.split('-')
  if (!endMonth || !endDay) return formattedStart

  return `${formattedStart} - ${endMonth}.${endDay}`
}

const loadRecentTrips = async () => {
  try {
    const trips = await getTrips()

    recentTrips.value = trips.slice(0, 4).map((trip, index) => ({
      id: trip.id,
      title: trip.title,
      period: formatTripPeriod(trip.startDate, trip.endDate),
      theme: recentTripThemes[index % recentTripThemes.length] ?? 'trip-theme-blue',
      coverImageUrl: getCoverImageUrl(trip.coverImagePath),
    }))
  } catch {
    recentTrips.value = []
  }
}

onMounted(() => {
  void loadRecentTrips()
  void loadReceivedInvitations()
})

const invitationThemes = [
  'invitation-theme-blue',
  'invitation-theme-green',
]

const receivedInvitations = ref<ReceivedInvitation[]>([])

const loadReceivedInvitations = async () => {
  try {
    const invitations = await getReceivedInvitations()

    receivedInvitations.value = invitations.slice(0, 2).map((invitation, index) => ({
      id: invitation.invitationId,
      tripId: invitation.tripId,
      title: invitation.tripTitle,
      inviter: invitation.inviterNickname,
      participants: invitation.currentParticipantCount,
      period: formatTripPeriod(invitation.startDate, invitation.endDate),
      theme: invitationThemes[index % invitationThemes.length] ?? 'invitation-theme-blue',
    }))
  } catch {
    receivedInvitations.value = []
  }
}

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
      <RecentTripsSection :trips="recentTrips" />

      <!-- 받은 여행 초대 -->
      <ReceivedInvitationsSection :invitations="receivedInvitations" />
    </div>

    <!-- PC 최근 활동 -->
    <RecentActivityPanel :activities="activities" />

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

/* 모바일 여행 만들기 버튼 */
.mobile-create-trip-button {
  display: none;
}

@media (max-width: 900px) {
  .home-layout {
    grid-template-columns: 1fr;
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
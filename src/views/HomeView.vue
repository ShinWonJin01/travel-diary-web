<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { apiBlobRequest } from '@/api/http'
import { getRecentActivities, type RecentActivity } from '@/api/home'
import { getReceivedInvitations } from '@/api/invitations'
import { getTrips } from '@/api/trips'

import RecentActivityPanel from '@/components/home/RecentActivityPanel.vue'
import RecentTripsSection from '@/components/home/RecentTripsSection.vue'
import ReceivedInvitationsSection from '@/components/home/ReceivedInvitationsSection.vue'

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

const recentTripThemes = [
  'trip-theme-blue',
  'trip-theme-green',
  'trip-theme-purple',
  'trip-theme-sky',
]

const invitationThemes = [
  'invitation-theme-blue',
  'invitation-theme-green',
]

const recentTrips = ref<RecentTrip[]>([])
const receivedInvitations = ref<ReceivedInvitation[]>([])
const recentActivities = ref<RecentActivity[]>([])

const revokeRecentTripCoverUrls = () => {
  recentTrips.value.forEach((trip) => {
    if (trip.coverImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(trip.coverImageUrl)
    }
  })
}

const loadCoverImageUrl = async (
  tripId: number,
  coverImagePath: string | null,
) => {
  if (!coverImagePath) return ''

  if (
    coverImagePath.startsWith('http://') ||
    coverImagePath.startsWith('https://')
  ) {
    return coverImagePath
  }

  try {
    const blob = await apiBlobRequest(`/api/trips/${tripId}/cover-image/file`)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('최근 여행 대표 이미지를 불러오지 못했습니다.', error)
    return ''
  }
}

const formatTripPeriod = (startDate: string, endDate: string | null) => {
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
    const selectedTrips = trips.slice(0, 4)

    const coverImageUrls = await Promise.all(
      selectedTrips.map((trip) =>
        loadCoverImageUrl(trip.id, trip.coverImagePath),
      ),
    )

    revokeRecentTripCoverUrls()

    recentTrips.value = selectedTrips.map((trip, index) => ({
      id: trip.id,
      title: trip.title,
      period: formatTripPeriod(trip.startDate, trip.endDate),
      theme:
        recentTripThemes[index % recentTripThemes.length] ?? 'trip-theme-blue',
      coverImageUrl: coverImageUrls[index] ?? '',
    }))
  } catch {
    revokeRecentTripCoverUrls()
    recentTrips.value = []
  }
}

const loadReceivedInvitations = async () => {
  try {
    const invitations = await getReceivedInvitations()

    receivedInvitations.value = invitations.map(
      (invitation, index) => ({
        id: invitation.invitationId,
        tripId: invitation.tripId,
        title: invitation.tripTitle,
        inviter: invitation.inviterNickname,
        participants: invitation.currentParticipantCount,
        period: formatTripPeriod(
          invitation.startDate,
          invitation.endDate,
        ),
        theme:
          invitationThemes[index % invitationThemes.length] ??
          'invitation-theme-blue',
      }),
    )
  } catch {
    receivedInvitations.value = []
  }
}

const loadRecentActivities = async () => {
  try {
    recentActivities.value = await getRecentActivities()
  } catch {
    recentActivities.value = []
  }
}

onMounted(() => {
  void loadRecentTrips()
  void loadReceivedInvitations()
  void loadRecentActivities()
})

onBeforeUnmount(revokeRecentTripCoverUrls)
</script>

<template>
  <div class="home-layout">
    <div class="home-main">
      <RecentTripsSection :trips="recentTrips" />
      <ReceivedInvitationsSection :invitations="receivedInvitations" />
    </div>

    <RecentActivityPanel :activities="recentActivities" />

    <RouterLink
      class="mobile-create-trip-button"
      to="/trips/create"
      aria-label="새 여행 만들기"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
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

  .mobile-create-trip-button {
    position: fixed;
    right: 17px;
    bottom: calc(82px + env(safe-area-inset-bottom));
    z-index: 40;
    display: flex;
    height: 46px;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 17px;
    border-radius: 23px;
    font-size: 12px;
    font-weight: 700;
    color: var(--tmr-surface);
    background: var(--tmr-primary);
    box-shadow: 0 7px 20px
      color-mix(in srgb, var(--tmr-primary) 30%, transparent);
    transition:
      background 0.15s ease,
      transform 0.15s ease;
  }

  .mobile-create-trip-button:active {
    background: var(--tmr-primary-dark);
    transform: scale(0.97);
  }

  .mobile-create-trip-button svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
  }
}
</style>
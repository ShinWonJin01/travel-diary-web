<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getStoredMember } from '@/api/auth'
import { ApiError, apiRequest } from '@/api/http'
import { getTripDetail, getTrips, type Trip, type TripListItem } from '@/api/trips'

import ParticipantManagementModal from '@/components/trips/detail/ParticipantManagementModal.vue'
import TripAiDiaryTab from '@/components/trips/detail/TripAiDiaryTab.vue'
import TripDetailSidebar from '@/components/trips/detail/TripDetailSidebar.vue'
import TripMapTab from '@/components/trips/detail/TripMapTab.vue'
import TripMobileTabs from '@/components/trips/detail/TripMobileTabs.vue'
import TripOverviewTab from '@/components/trips/detail/TripOverviewTab.vue'
import TripPhotosTab from '@/components/trips/detail/TripPhotosTab.vue'
import TripTimelineTab from '@/components/trips/detail/TripTimelineTab.vue'

type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'

interface TimelineEntry {
  id: number
  time: string
  title: string
  thumbnailClass: string
}

interface TimelineGroup {
  dateLabel: string
  dayLabel: string
  entries: TimelineEntry[]
}

interface PhotoItem {
  id: number
  title: string
  location: string
  className: string
}

interface Participant {
  id: number
  nickname: string
  profileImageUrl: string | null
  avatarClass: string
}

const route = useRoute()
const router = useRouter()
const currentMember = getStoredMember()

const trip = ref<Trip | null>(null)
const tripListItem = ref<TripListItem | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isCoverImageBroken = ref(false)

const isParticipantModalOpen = ref(false)
const inviteNickname = ref('')
const isInviting = ref(false)
const invitationMessage = ref('')
const invitationErrorMessage = ref('')

const tripId = computed<number | null>(() => {
  const routeId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsedId = Number(routeId)

  if (!Number.isInteger(parsedId) || parsedId <= 0) return null
  return parsedId
})

const formatDate = (date: string) => date.replaceAll('-', '.')

const toUtcTimestamp = (date: string) => {
  const [yearText, monthText, dayText] = date.split('-')
  if (!yearText || !monthText || !dayText) return null

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  return Date.UTC(year, month - 1, day)
}

const tripTitle = computed(() => trip.value?.title ?? '여행 상세')
const tripDestination = computed(() => trip.value?.destination ?? '')
const tripDescription = computed(() => trip.value?.description.trim() ?? '')

const tripPeriod = computed(() => {
  if (!trip.value) return ''

  const startDate = formatDate(trip.value.startDate)
  if (!trip.value.endDate) return `${startDate} - 종료일 미정`

  return `${startDate} - ${formatDate(trip.value.endDate)}`
})

const tripDuration = computed(() => {
  if (!trip.value) return ''
  if (!trip.value.endDate) return '종료일 미정'

  const startTimestamp = toUtcTimestamp(trip.value.startDate)
  const endTimestamp = toUtcTimestamp(trip.value.endDate)

  if (startTimestamp === null || endTimestamp === null) return '-'

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const nights = Math.max(Math.round((endTimestamp - startTimestamp) / millisecondsPerDay), 0)

  return `${nights}박 ${nights + 1}일`
})

const backendBaseUrl = (() => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

  if (!configuredUrl || configuredUrl.startsWith('/')) return 'http://localhost:8080'

  return configuredUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
})()

const coverImageUrl = computed(() => {
  const path = trip.value?.coverImagePath
  if (!path || isCoverImageBroken.value) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  const cleanedPath = path.replaceAll('\\', '/')
  const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`

  return `${backendBaseUrl}${normalizedPath}`
})

watch(
  () => trip.value?.coverImagePath,
  () => {
    isCoverImageBroken.value = false
  },
)

/*
 * 현재 상세 API에는 전체 참여자 목록이 없으므로
 * 실제 DB 응답에 포함된 여행 생성자만 우선 표시합니다.
 * 참여자 API를 연결하면 이 computed를 교체합니다.
 */
const participants = computed<Participant[]>(() => {
  if (!trip.value) return []

  return [
    {
      id: trip.value.ownerId,
      nickname: trip.value.ownerNickname,
      profileImageUrl: null,
      avatarClass: 'avatar-blue',
    },
  ]
})

const participantCount = computed(() => {
  return tripListItem.value?.participantCount ?? participants.value.length
})

const visibleParticipants = computed(() => participants.value.slice(0, 4))

const remainingParticipantCount = computed(() => {
  return Math.max(participantCount.value - visibleParticipants.value.length, 0)
})

const isOwner = computed(() => {
  if (!trip.value) return false
  if (tripListItem.value) return tripListItem.value.role === 'OWNER'

  return currentMember?.id === trip.value.ownerId
})

const loadTrip = async () => {
  if (tripId.value === null) {
    trip.value = null
    tripListItem.value = null
    errorMessage.value = '올바르지 않은 여행 주소입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  isCoverImageBroken.value = false

  try {
    const [tripDetail, tripItems] = await Promise.all([
      getTripDetail(tripId.value),
      getTrips().catch(() => []),
    ])

    trip.value = tripDetail
    tripListItem.value = tripItems.find((item) => item.id === tripId.value) ?? null
  } catch (error: unknown) {
    trip.value = null
    tripListItem.value = null

    if (error instanceof ApiError) {
      errorMessage.value = error.message
      return
    }

    errorMessage.value = '여행 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const handleCoverImageError = () => {
  isCoverImageBroken.value = true
}

watch(
  () => route.params.id,
  () => {
    void loadTrip()
  },
  { immediate: true },
)

const timelineGroups: TimelineGroup[] = [
  {
    dateLabel: '04.10',
    dayLabel: '(수)',
    entries: [
      { id: 1, time: '10:30', title: '나리타 공항 도착', thumbnailClass: 'thumb-blue' },
      { id: 2, time: '13:00', title: '신주쿠 일정', thumbnailClass: 'thumb-green' },
      { id: 3, time: '19:00', title: '초밥 저녁', thumbnailClass: 'thumb-orange' },
    ],
  },
  {
    dateLabel: '04.11',
    dayLabel: '(목)',
    entries: [
      { id: 4, time: '09:30', title: '아사쿠사 관광', thumbnailClass: 'thumb-purple' },
      { id: 5, time: '14:00', title: '시부야 거리', thumbnailClass: 'thumb-sky' },
    ],
  },
]

const photos: PhotoItem[] = [
  { id: 1, title: '도쿄역', location: '도쿄역', className: 'photo-blue' },
  { id: 2, title: '신주쿠', location: '신주쿠', className: 'photo-green' },
  { id: 3, title: '야경', location: '도쿄 타워', className: 'photo-orange' },
  { id: 4, title: '카페', location: '시부야', className: 'photo-purple' },
  { id: 5, title: '거리 풍경', location: '긴자', className: 'photo-sky' },
  { id: 6, title: '저녁 식사', location: '우에노', className: 'photo-gray' },
]

const validTabs: TripTab[] = ['overview', 'timeline', 'photos', 'map', 'ai-diary']

const activeTab = computed<TripTab>(() => {
  const tab = route.query.tab

  if (typeof tab === 'string' && validTabs.includes(tab as TripTab)) return tab as TripTab
  return 'overview'
})

const selectTab = (tab: TripTab) => {
  void router.replace({
    name: 'trip-detail',
    params: { id: route.params.id },
    query: tab === 'overview' ? {} : { tab },
  })
}

const goToTimelineTab = () => {
  selectTab('timeline')
}

const showMobilePhotoButton = computed(() => {
  return ['overview', 'timeline', 'photos'].includes(activeTab.value)
})

/* 사진 선택 */
const photoInputRef = ref<HTMLInputElement | null>(null)

const openPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handlePhotoSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  /*
   * 추후 여기에서 선택한 파일을 FormData에 담아
   * 사진 등록 API로 전송합니다.
   */

  input.value = ''
}

/* 참여자 관리 */
const openParticipantModal = () => {
  invitationMessage.value = ''
  invitationErrorMessage.value = ''
  isParticipantModalOpen.value = true
}

const closeParticipantModal = () => {
  if (isInviting.value) return

  isParticipantModalOpen.value = false
  invitationMessage.value = ''
  invitationErrorMessage.value = ''
}

const sendInvitation = async () => {
  const nickname = inviteNickname.value.trim()

  if (!nickname) {
    invitationErrorMessage.value = '초대할 회원의 닉네임을 입력해 주세요.'
    invitationMessage.value = ''
    return
  }

  if (tripId.value === null) {
    invitationErrorMessage.value = '여행 정보를 확인할 수 없습니다.'
    invitationMessage.value = ''
    return
  }

  isInviting.value = true
  invitationMessage.value = ''
  invitationErrorMessage.value = ''

  try {
    await apiRequest(`/api/trips/${tripId.value}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    })

    inviteNickname.value = ''
    invitationMessage.value = '여행 초대를 보냈습니다.'
  } catch (error: unknown) {
    invitationErrorMessage.value =
      error instanceof ApiError ? error.message : '초대를 보내지 못했습니다.'
  } finally {
    isInviting.value = false
  }
}

/* 여행 관리 */
const openTripEdit = () => {
  window.alert('여행 정보 수정 API와 수정 화면을 만든 뒤 이 버튼에 연결합니다.')
}

const handleDeleteTrip = () => {
  window.alert('여행 삭제 API를 만든 뒤 이 메뉴에 연결합니다.')
}

const handleLeaveTrip = () => {
  window.alert('여행 나가기 API를 만든 뒤 이 메뉴에 연결합니다.')
}
</script>

<template>
  <main class="trip-detail-page">
    <section v-if="isLoading" class="detail-state-card">
      <span class="detail-state-spinner"></span>
      <p>여행 정보를 불러오는 중입니다.</p>
    </section>

    <section v-else-if="errorMessage" class="detail-state-card detail-error-card">
      <h1>여행 정보를 불러오지 못했습니다.</h1>
      <p>{{ errorMessage }}</p>
      <button type="button" @click="loadTrip">다시 시도</button>
    </section>

    <div v-else-if="trip" class="detail-layout">
      <TripDetailSidebar
        :trip-title="tripTitle"
        :active-tab="activeTab"
        @change="selectTab"
      />

      <section class="detail-main">
        <TripMobileTabs :active-tab="activeTab" @change="selectTab" />

        <TripOverviewTab
          v-if="activeTab === 'overview'"
          :trip-title="tripTitle"
          :trip-destination="tripDestination"
          :trip-period="tripPeriod"
          :trip-duration="tripDuration"
          :trip-description="tripDescription"
          :owner-nickname="trip.ownerNickname"
          :cover-image-url="coverImageUrl"
          :participant-count="participantCount"
          :visible-participants="visibleParticipants"
          :remaining-participant-count="remainingParticipantCount"
          :timeline-groups="timelineGroups"
          :is-owner="isOwner"
          @edit="openTripEdit"
          @delete="handleDeleteTrip"
          @leave="handleLeaveTrip"
          @open-participants="openParticipantModal"
          @add-photo="openPhotoUpload"
          @timeline="goToTimelineTab"
          @cover-error="handleCoverImageError"
        />

        <TripTimelineTab
          v-else-if="activeTab === 'timeline'"
          :timeline-groups="timelineGroups"
        />

        <TripPhotosTab
          v-else-if="activeTab === 'photos'"
          :photos="photos"
        />

        <TripMapTab v-else-if="activeTab === 'map'" />
        <TripAiDiaryTab v-else />
      </section>
    </div>

    <ParticipantManagementModal
      v-if="isParticipantModalOpen && trip"
      v-model:invite-nickname="inviteNickname"
      :participant-count="participantCount"
      :participants="participants"
      :owner-id="trip.ownerId"
      :is-owner="isOwner"
      :is-inviting="isInviting"
      :invitation-message="invitationMessage"
      :invitation-error-message="invitationErrorMessage"
      @close="closeParticipantModal"
      @invite="sendInvitation"
    />

    <input
      v-if="trip"
      ref="photoInputRef"
      class="photo-file-input"
      type="file"
      accept="image/*"
      multiple
      @change="handlePhotoSelect"
    />

    <button
      v-if="trip && showMobilePhotoButton"
      class="mobile-floating-button"
      type="button"
      @click="openPhotoUpload"
    >
      + 사진 추가
    </button>
  </main>
</template>

<style scoped>
.trip-detail-page {
  min-height: 100vh;
  padding: 24px 24px 80px;
  background: #f6f7fb;
}

.detail-state-card {
  display: flex;
  min-height: 280px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 720px;
  margin: 48px auto 0;
  padding: 30px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  color: #687383;
  background: #ffffff;
}

.detail-state-card p {
  margin: 0;
  font-size: 13px;
}

.detail-state-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #dfe6f7;
  border-top-color: #3464ee;
  border-radius: 50%;
  animation: detail-spin 0.8s linear infinite;
}

.detail-error-card h1 {
  margin: 0;
  font-size: 19px;
  color: #252c37;
}

.detail-error-card button {
  height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: #3464ee;
  cursor: pointer;
}

@keyframes detail-spin {
  to {
    transform: rotate(360deg);
  }
}

.detail-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 18px;
  max-width: 1320px;
  margin: 0 auto;
}

.detail-main {
  min-width: 0;
}

.photo-file-input {
  display: none;
}

.mobile-floating-button {
  display: none;
}

@media (max-width: 760px) {
  .trip-detail-page {
    min-height: calc(100vh - 52px);
    padding: 0 0 24px;
    background: #f6f7fb;
  }

  .detail-state-card {
    min-height: 240px;
    margin: 18px 10px 0;
    padding: 22px 16px;
    border-radius: 10px;
  }

  .detail-state-card p {
    font-size: 11px;
  }

  .detail-error-card h1 {
    font-size: 15px;
  }

  .detail-layout {
    display: block;
    max-width: none;
    margin: 0;
  }

  .detail-main {
    padding-top: 0;
  }

  .mobile-floating-button {
    position: fixed;
    right: 14px;
    bottom: 16px;
    z-index: 30;
    display: inline-flex;
    height: 38px;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    border: 0;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    background: #3160ee;
    box-shadow: 0 8px 20px rgba(49, 96, 238, 0.3);
    cursor: pointer;
  }
}
</style>
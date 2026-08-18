<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getStoredMember } from '@/api/auth'
import { ApiError } from '@/api/http'
import {
  getTripDetail,
  getTripParticipants,
  getTripPhotos,
  type Trip,
} from '@/api/trips'

import { useTripAiDiary } from '@/composables/trips/useTripAiDiary'
import { useTripImages } from '@/composables/trips/useTripImages'
import { useTripManagement } from '@/composables/trips/useTripManagement'
import { useTripParticipants } from '@/composables/trips/useTripParticipants'
import { useTripPhotos } from '@/composables/trips/useTripPhotos'

import ParticipantManagementModal from '@/components/trips/detail/ParticipantManagementModal.vue'
import TripAiDiaryTab from '@/components/trips/detail/TripAiDiaryTab.vue'
import TripDetailSidebar from '@/components/trips/detail/TripDetailSidebar.vue'
import TripEditModal from '@/components/trips/detail/TripEditModal.vue'
import TripMapTab from '@/components/trips/detail/TripMapTab.vue'
import TripMobileTabs from '@/components/trips/detail/TripMobileTabs.vue'
import TripOverviewTab from '@/components/trips/detail/TripOverviewTab.vue'
import TripPhotosTab from '@/components/trips/detail/TripPhotosTab.vue'
import TripTimelineTab from '@/components/trips/detail/TripTimelineTab.vue'

type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'

const validTabs: TripTab[] = [
  'overview',
  'timeline',
  'photos',
  'map',
  'ai-diary',
]

const route = useRoute()
const router = useRouter()
const currentMember = getStoredMember()

const trip = ref<Trip | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const photoInputRef = ref<HTMLInputElement | null>(null)

const tripId = computed<number | null>(() => {
  const routeId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id

  const parsedId = Number(routeId)

  return Number.isInteger(parsedId) && parsedId > 0
    ? parsedId
    : null
})

const isOwner = computed(
  () => currentMember?.id === trip.value?.ownerId,
)

const {
  coverImageUrl,
  tripPhotoImageUrls,
  participantProfileImageUrls,
  loadCoverImage,
  loadTripPhotoImageUrl,
  loadTripPhotoImageUrls,
  loadParticipantProfileImageUrls,
  removeTripPhotoImageUrl,
  revokeCoverImageUrl,
  revokeTripPhotoImageUrls,
  revokeParticipantProfileImageUrls,
} = useTripImages(tripId)

const {
  tripPhotos,
  timelineGroups,
  photos,
  mapPhotos,
  uploadPhotos,
  removePhotos,
  updatePhotoMemo,
  updatePhotoTakenAt,
  updatePhotoLocation,
} = useTripPhotos({
  tripId,
  currentMemberId: currentMember?.id,
  isOwner,
  tripPhotoImageUrls,
  loadTripPhotoImageUrl,
  removeTripPhotoImageUrl,
})

const {
  tripParticipants,
  participants,
  participantCount,
  visibleParticipants,
  remainingParticipantCount,
  isParticipantModalOpen,
  inviteNickname,
  isInviting,
  invitationMessage,
  invitationErrorMessage,
  openParticipantModal,
  closeParticipantModal,
  sendInvitation,
} = useTripParticipants({
  tripId,
  participantProfileImageUrls,
})

const {
  isTripEditModalOpen,
  isSavingTrip,
  tripEditErrorMessage,
  openTripEdit,
  closeTripEdit,
  updateCurrentTrip,
  deleteCurrentTrip,
  leaveCurrentTrip,
} = useTripManagement({
  tripId,
  trip,
})

const {
  aiDiary,
  isGeneratingAiDiary,
  loadAiDiary,
  generateAiDiary,
  clearAiDiary,
} = useTripAiDiary({
  tripId,
})

const tripTitle = computed(
  () => trip.value?.title ?? '여행 상세',
)

const tripDestination = computed(
  () => trip.value?.destination ?? '',
)

const tripDescription = computed(
  () => trip.value?.description.trim() ?? '',
)

const activeTab = computed<TripTab>(() => {
  const tab = route.query.tab

  if (
    typeof tab === 'string'
    && validTabs.includes(tab as TripTab)
  ) {
    return tab as TripTab
  }

  return 'overview'
})

const showMobilePhotoButton = computed(() =>
  ['overview', 'timeline', 'photos'].includes(activeTab.value),
)

const formatDate = (date: string) => {
  return date.replaceAll('-', '.')
}

const toUtcTimestamp = (date: string) => {
  const [yearText, monthText, dayText] = date.split('-')

  if (!yearText || !monthText || !dayText) {
    return null
  }

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (
    !Number.isInteger(year)
    || !Number.isInteger(month)
    || !Number.isInteger(day)
  ) {
    return null
  }

  return Date.UTC(year, month - 1, day)
}

const tripPeriod = computed(() => {
  if (!trip.value) {
    return ''
  }

  const startDate = formatDate(trip.value.startDate)

  if (!trip.value.endDate) {
    return `${startDate} - 종료일 미정`
  }

  return `${startDate} - ${formatDate(trip.value.endDate)}`
})

const tripDuration = computed(() => {
  if (!trip.value) {
    return ''
  }

  if (!trip.value.endDate) {
    return '종료일 미정'
  }

  const startTimestamp = toUtcTimestamp(trip.value.startDate)
  const endTimestamp = toUtcTimestamp(trip.value.endDate)

  if (startTimestamp === null || endTimestamp === null) {
    return '-'
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000

  const nights = Math.max(
    Math.round(
      (endTimestamp - startTimestamp)
      / millisecondsPerDay,
    ),
    0,
  )

  return `${nights}박 ${nights + 1}일`
})

const resetTripState = () => {
  revokeCoverImageUrl()
  revokeTripPhotoImageUrls()
  revokeParticipantProfileImageUrls()

  trip.value = null
  tripParticipants.value = []
  tripPhotos.value = []
  clearAiDiary()
}

const loadTrip = async () => {
  const id = tripId.value

  if (id === null) {
    resetTripState()
    errorMessage.value = '올바르지 않은 여행 주소입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const [
      tripDetail,
      participantItems,
      photoItems,
    ] = await Promise.all([
      getTripDetail(id),
      getTripParticipants(id),
      getTripPhotos(id),
    ])

    trip.value = tripDetail
    tripParticipants.value = participantItems
    tripPhotos.value = photoItems

    await Promise.all([
      loadAiDiary(),
      loadTripPhotoImageUrls(photoItems),
      loadParticipantProfileImageUrls(participantItems),
    ])
  } catch (error: unknown) {
    resetTripState()

    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : '여행 정보를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const selectTab = (tab: TripTab) => {
  void router.replace({
    name: 'trip-detail',
    params: {
      id: route.params.id,
    },
    query: tab === 'overview' ? {} : { tab },
  })
}

const openPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handlePhotoSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }

  const files = Array.from(input.files)

  try {
    await uploadPhotos(files)

    selectTab('photos')

    window.alert(
      files.length === 1
        ? '사진을 등록했습니다.'
        : `사진 ${files.length}장을 등록했습니다.`,
    )
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '사진을 등록하지 못했습니다.',
    )
  } finally {
    input.value = ''
  }
}

const handleDeletePhotos = async (
  photoIds: number[],
) => {
  if (photoIds.length === 0) {
    return
  }

  const confirmed = window.confirm(
    `선택한 사진 ${photoIds.length}장을 삭제하시겠습니까?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await removePhotos(photoIds)
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '선택한 사진을 삭제하지 못했습니다.',
    )

    await loadTrip()
  }
}

const handleUpdatePhotoMemo = async (
  photoId: number,
  memo: string,
) => {
  try {
    await updatePhotoMemo(photoId, memo)
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '사진 메모를 저장하지 못했습니다.',
    )
  }
}

const handleUpdatePhotoTakenAt = async (
  photoId: number,
  takenAt: string | null,
) => {
  try {
    await updatePhotoTakenAt(photoId, takenAt)
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '사진 촬영시간을 수정하지 못했습니다.',
    )
  }
}

const handleUpdatePhotoLocation = async (
  photoId: number,
  latitude: number,
  longitude: number,
) => {
  try {
    await updatePhotoLocation(
      photoId,
      latitude,
      longitude,
    )
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '사진 위치를 수정하지 못했습니다.',
    )
  }
}

const handleDeleteTrip = async () => {
  const confirmed = window.confirm(
    '여행을 삭제하시겠습니까?\n삭제한 여행은 복구할 수 없습니다.',
  )

  if (!confirmed) {
    return
  }

  try {
    const deleted = await deleteCurrentTrip()

    if (!deleted) {
      return
    }

    await router.push('/trips')
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '여행을 삭제하지 못했습니다.',
    )
  }
}

const handleLeaveTrip = async () => {
  const confirmed = window.confirm(
    '이 여행에서 나가시겠습니까?\n나간 뒤에는 다시 초대를 받아야 참여할 수 있습니다.',
  )

  if (!confirmed) {
    return
  }

  try {
    const left = await leaveCurrentTrip()

    if (!left) {
      return
    }

    await router.push('/trips')
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '여행에서 나가지 못했습니다.',
    )
  }
}

const handleGenerateAiDiary = async () => {
  try {
    await generateAiDiary()
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : 'AI 여행기를 생성하지 못했습니다.',
    )
  }
}

watch(
  () => route.params.id,
  () => {
    void loadTrip()
  },
  { immediate: true },
)

watch(
  () => [
    tripId.value,
    trip.value?.coverImagePath,
  ],
  () => {
    void loadCoverImage(
      trip.value?.coverImagePath,
    )
  },
)
</script>

<template>
  <main class="trip-detail-page">
    <section
      v-if="isLoading"
      class="detail-state-card"
    >
      <span class="detail-state-spinner"></span>
      <p>여행 정보를 불러오는 중입니다.</p>
    </section>

    <section
      v-else-if="errorMessage"
      class="detail-state-card detail-error-card"
    >
      <h1>여행 정보를 불러오지 못했습니다.</h1>
      <p>{{ errorMessage }}</p>

      <button type="button" @click="loadTrip">
        다시 시도
      </button>
    </section>

    <div
      v-else-if="trip"
      class="detail-layout"
    >
      <TripDetailSidebar
        :trip-title="tripTitle"
        :active-tab="activeTab"
        @change="selectTab"
      />

      <section class="detail-main">
        <TripMobileTabs
          :active-tab="activeTab"
          @change="selectTab"
        />

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
          @timeline="selectTab('timeline')"
          @cover-error="revokeCoverImageUrl"
        />

        <TripTimelineTab
          v-else-if="activeTab === 'timeline'"
          :timeline-groups="timelineGroups"
        />

        <TripPhotosTab
          v-else-if="activeTab === 'photos'"
          :photos="photos"
          @add-photo="openPhotoUpload"
          @delete-photos="handleDeletePhotos"
          @update-memo="handleUpdatePhotoMemo"
          @update-taken-at="handleUpdatePhotoTakenAt"
          @update-location="handleUpdatePhotoLocation"
        />

        <TripMapTab
          v-else-if="activeTab === 'map'"
          :photos="mapPhotos"
        />

        <TripAiDiaryTab
          v-else-if="activeTab === 'ai-diary'"
          :content="aiDiary?.content ?? null"
          :is-generating="isGeneratingAiDiary"
          :is-owner="isOwner"
          @generate="handleGenerateAiDiary"
        />
      </section>
    </div>

    <TripEditModal
      v-if="isTripEditModalOpen && trip"
      :title="trip.title"
      :destination="trip.destination"
      :start-date="trip.startDate"
      :end-date="trip.endDate"
      :description="trip.description"
      :is-saving="isSavingTrip"
      :error-message="tripEditErrorMessage"
      @close="closeTripEdit"
      @save="updateCurrentTrip"
    />

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
  max-width: 720px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
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

.photo-file-input,
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
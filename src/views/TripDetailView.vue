<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getStoredMember } from '@/api/auth'
import { apiBlobRequest, ApiError } from '@/api/http'
import {
  deleteTrip,
  deleteTripPhoto,
  generateTripAiDiary,
  getTripAiDiary,
  getTripDetail,
  getTripParticipants,
  getTripPhotos,
  leaveTrip,
  sendTripInvitation,
  updateTrip,
  updateTripPhotoLocation,
  updateTripPhotoMemo,
  updateTripPhotoTakenAt,
  uploadTripPhoto,
  type Trip,
  type TripAiDiary,
  type TripParticipant,
  type TripPhoto,
} from '@/api/trips'

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

interface TimelineEntry {
  id: number
  time: string
  title: string
  thumbnailClass: string
  imageUrl: string
  memo: string | null
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
  imageUrl: string
  memo: string | null
  takenAt: string | null
  latitude: number | null
  longitude: number | null
  canDelete: boolean
  canEditMemo: boolean
  canEditLocation: boolean
}

interface MapPhoto {
  id: number
  title: string
  latitude: number
  longitude: number
  imageUrl: string
  takenAt: string | null
  memo: string | null
}

interface Participant {
  id: number
  nickname: string
  profileImageUrl: string | null
  avatarClass: string
}

interface TripEditForm {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
}

const validTabs: TripTab[] = [
  'overview',
  'timeline',
  'photos',
  'map',
  'ai-diary',
]

const timelineThumbnailClasses = [
  'thumb-blue',
  'thumb-green',
  'thumb-orange',
  'thumb-purple',
  'thumb-sky',
]

const participantAvatarClasses = [
  'avatar-blue',
  'avatar-green',
  'avatar-orange',
]

const weekdayLabels = [
  '(일)',
  '(월)',
  '(화)',
  '(수)',
  '(목)',
  '(금)',
  '(토)',
]

const route = useRoute()
const router = useRouter()
const currentMember = getStoredMember()

const trip = ref<Trip | null>(null)
const tripParticipants = ref<TripParticipant[]>([])
const tripPhotos = ref<TripPhoto[]>([])
const aiDiary = ref<TripAiDiary | null>(null)

const coverImageUrl = ref('')
const tripPhotoImageUrls = ref<Record<number, string>>({})
const participantProfileImageUrls = ref<Record<number, string>>({})

const isLoading = ref(true)
const errorMessage = ref('')

const isTripEditModalOpen = ref(false)
const isSavingTrip = ref(false)
const tripEditErrorMessage = ref('')

const isParticipantModalOpen = ref(false)
const inviteNickname = ref('')
const isInviting = ref(false)
const invitationMessage = ref('')
const invitationErrorMessage = ref('')

const isGeneratingAiDiary = ref(false)
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

const tripTitle = computed(
  () => trip.value?.title ?? '여행 상세',
)

const tripDestination = computed(
  () => trip.value?.destination ?? '',
)

const tripDescription = computed(
  () => trip.value?.description.trim() ?? '',
)

const isOwner = computed(
  () => currentMember?.id === trip.value?.ownerId,
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

const formatPhotoTakenAt = (takenAt: string | null) => {
  if (!takenAt) {
    return '사진 기록'
  }

  return `${takenAt.slice(5, 10).replace('-', '.')} ${takenAt.slice(11, 16)}`
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

const revokeCoverImageUrl = () => {
  if (coverImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverImageUrl.value)
  }

  coverImageUrl.value = ''
}

const revokeTripPhotoImageUrls = () => {
  Object.values(tripPhotoImageUrls.value).forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })

  tripPhotoImageUrls.value = {}
}

const revokeParticipantProfileImageUrls = () => {
  Object.values(
    participantProfileImageUrls.value,
  ).forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })

  participantProfileImageUrls.value = {}
}

const loadCoverImage = async () => {
  revokeCoverImageUrl()

  const id = tripId.value
  const coverImagePath = trip.value?.coverImagePath

  if (id === null || !coverImagePath) {
    return
  }

  if (
    coverImagePath.startsWith('http://')
    || coverImagePath.startsWith('https://')
  ) {
    coverImageUrl.value = coverImagePath
    return
  }

  try {
    const blob = await apiBlobRequest(
      `/api/trips/${id}/cover-image/file`,
    )

    coverImageUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error(
      '여행 대표 이미지를 불러오지 못했습니다.',
      error,
    )
  }
}

const loadTripPhotoImageUrls = async (
  photos: TripPhoto[],
) => {
  const id = tripId.value

  revokeTripPhotoImageUrls()

  if (id === null || photos.length === 0) {
    return
  }

  const imageUrls: Record<number, string> = {}

  await Promise.all(
    photos.map(async (photo) => {
      try {
        const blob = await apiBlobRequest(
          `/api/trips/${id}/photos/${photo.id}/file`,
        )

        imageUrls[photo.id] = URL.createObjectURL(blob)
      } catch (error) {
        console.error(
          `사진 ${photo.id}을 불러오지 못했습니다.`,
          error,
        )

        imageUrls[photo.id] = ''
      }
    }),
  )

  tripPhotoImageUrls.value = imageUrls
}

const loadParticipantProfileImageUrls = async (
  participants: TripParticipant[],
) => {
  revokeParticipantProfileImageUrls()

  const imageUrls: Record<number, string> = {}

  await Promise.all(
    participants.map(async (participant) => {
      const path = participant.profileImagePath

      if (!path) {
        imageUrls[participant.memberId] = ''
        return
      }

      if (
        path.startsWith('http://')
        || path.startsWith('https://')
      ) {
        imageUrls[participant.memberId] = path
        return
      }

      try {
        const blob = await apiBlobRequest(
          `/api/members/${participant.memberId}/profile-image/file`,
        )

        imageUrls[participant.memberId] =
          URL.createObjectURL(blob)
      } catch (error) {
        console.error(
          `참여자 ${participant.memberId}의 프로필 이미지를 불러오지 못했습니다.`,
          error,
        )

        imageUrls[participant.memberId] = ''
      }
    }),
  )

  participantProfileImageUrls.value = imageUrls
}

const participants = computed<Participant[]>(() =>
  tripParticipants.value.map((participant, index) => ({
    id: participant.memberId,
    nickname: participant.nickname,
    profileImageUrl:
      participantProfileImageUrls.value[
        participant.memberId
      ] || null,
    avatarClass:
      participantAvatarClasses[
        index % participantAvatarClasses.length
      ] ?? 'avatar-blue',
  })),
)

const participantCount = computed(
  () => participants.value.length,
)

const visibleParticipants = computed(
  () => participants.value.slice(0, 4),
)

const remainingParticipantCount = computed(() =>
  Math.max(
    participantCount.value - visibleParticipants.value.length,
    0,
  ),
)

const timelineGroups = computed<TimelineGroup[]>(() => {
  const groups = new Map<string, TimelineEntry[]>()

  const sortedPhotos = [...tripPhotos.value]
    .filter((photo) => photo.takenAt)
    .sort((a, b) =>
      (a.takenAt ?? '').localeCompare(b.takenAt ?? ''),
    )

  sortedPhotos.forEach((photo, index) => {
    if (!photo.takenAt) {
      return
    }

    const [datePart, timePart] = photo.takenAt.split('T')

    if (!datePart || !timePart) {
      return
    }

    const entries = groups.get(datePart) ?? []

    entries.push({
      id: photo.id,
      time: timePart.slice(0, 5),
      title: photo.locationName ?? '사진 기록',
      thumbnailClass:
        timelineThumbnailClasses[
          index % timelineThumbnailClasses.length
        ] ?? 'thumb-blue',
      imageUrl:
        tripPhotoImageUrls.value[photo.id] ?? '',
      memo: photo.memo,
    })

    groups.set(datePart, entries)
  })

  return Array.from(groups.entries()).map(
    ([datePart, entries]) => {
      const [yearText, monthText, dayText] =
        datePart.split('-')

      const date = new Date(
        Number(yearText),
        Number(monthText) - 1,
        Number(dayText),
      )

      return {
        dateLabel: `${monthText}.${dayText}`,
        dayLabel:
          weekdayLabels[date.getDay()] ?? '',
        entries,
      }
    },
  )
})

const photos = computed<PhotoItem[]>(() =>
  tripPhotos.value.map((photo) => {
    const canManagePhoto =
      isOwner.value
      || photo.uploadedByMemberId === currentMember?.id

    return {
      id: photo.id,
      title: formatPhotoTakenAt(photo.takenAt),
      location: photo.locationName ?? '위치 정보 없음',
      imageUrl:
        tripPhotoImageUrls.value[photo.id] ?? '',
      memo: photo.memo,
      takenAt: photo.takenAt,
      latitude: photo.latitude,
      longitude: photo.longitude,
      canDelete: canManagePhoto,
      canEditMemo: canManagePhoto,
      canEditLocation: canManagePhoto,
    }
  }),
)

const mapPhotos = computed<MapPhoto[]>(() =>
  tripPhotos.value.flatMap((photo) => {
    if (
      photo.latitude === null
      || photo.longitude === null
    ) {
      return []
    }

    return [
      {
        id: photo.id,
        title: photo.locationName ?? '사진 기록',
        latitude: photo.latitude,
        longitude: photo.longitude,
        imageUrl:
          tripPhotoImageUrls.value[photo.id] ?? '',
        takenAt: photo.takenAt,
        memo: photo.memo,
      },
    ]
  }),
)

const loadTrip = async () => {
  const id = tripId.value

  if (id === null) {
    revokeCoverImageUrl()
    revokeTripPhotoImageUrls()
    revokeParticipantProfileImageUrls()

    trip.value = null
    tripParticipants.value = []
    tripPhotos.value = []
    aiDiary.value = null
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
      diary,
    ] = await Promise.all([
      getTripDetail(id),
      getTripParticipants(id),
      getTripPhotos(id),
      getTripAiDiary(id).catch(() => null),
    ])

    trip.value = tripDetail
    tripParticipants.value = participantItems
    tripPhotos.value = photoItems
    aiDiary.value = diary

    await Promise.all([
      loadTripPhotoImageUrls(photoItems),
      loadParticipantProfileImageUrls(participantItems),
    ])
  } catch (error: unknown) {
    revokeCoverImageUrl()
    revokeTripPhotoImageUrls()
    revokeParticipantProfileImageUrls()

    trip.value = null
    tripParticipants.value = []
    tripPhotos.value = []
    aiDiary.value = null

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
    query:
      tab === 'overview'
        ? {}
        : { tab },
  })
}

const openPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handleCoverImageError = () => {
  revokeCoverImageUrl()
}

const handlePhotoSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const id = tripId.value

  if (id === null || !input.files?.length) {
    return
  }

  const files = Array.from(input.files)

  try {
    for (const file of files) {
      const uploadedPhoto =
        await uploadTripPhoto(id, file)

      tripPhotos.value.push(uploadedPhoto)

      try {
        const blob = await apiBlobRequest(
          `/api/trips/${id}/photos/${uploadedPhoto.id}/file`,
        )

        tripPhotoImageUrls.value = {
          ...tripPhotoImageUrls.value,
          [uploadedPhoto.id]:
            URL.createObjectURL(blob),
        }
      } catch (error) {
        console.error(
          '등록한 사진을 불러오지 못했습니다.',
          error,
        )
      }
    }

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
  const id = tripId.value

  if (id === null || photoIds.length === 0) {
    return
  }

  const confirmed = window.confirm(
    `선택한 사진 ${photoIds.length}장을 삭제하시겠습니까?`,
  )

  if (!confirmed) {
    return
  }

  try {
    for (const photoId of photoIds) {
      await deleteTripPhoto(id, photoId)
    }

    photoIds.forEach((photoId) => {
      const imageUrl =
        tripPhotoImageUrls.value[photoId]

      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }

      delete tripPhotoImageUrls.value[photoId]
    })

    const deletedIds = new Set(photoIds)

    tripPhotos.value =
      tripPhotos.value.filter(
        (photo) => !deletedIds.has(photo.id),
      )
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '선택한 사진을 삭제하지 못했습니다.',
    )

    await loadTrip()
  }
}

const replacePhoto = (
  updatedPhoto: TripPhoto,
) => {
  tripPhotos.value =
    tripPhotos.value.map((photo) =>
      photo.id === updatedPhoto.id
        ? updatedPhoto
        : photo,
    )
}

const handleUpdatePhotoMemo = async (
  photoId: number,
  memo: string,
) => {
  const id = tripId.value

  if (id === null) {
    return
  }

  try {
    replacePhoto(
      await updateTripPhotoMemo(
        id,
        photoId,
        memo,
      ),
    )
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
  const id = tripId.value

  if (id === null) {
    return
  }

  try {
    replacePhoto(
      await updateTripPhotoTakenAt(
        id,
        photoId,
        takenAt,
      ),
    )
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
  const id = tripId.value

  if (id === null) {
    return
  }

  try {
    replacePhoto(
      await updateTripPhotoLocation(
        id,
        photoId,
        latitude,
        longitude,
      ),
    )
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : '사진 위치를 수정하지 못했습니다.',
    )
  }
}

const openParticipantModal = () => {
  invitationMessage.value = ''
  invitationErrorMessage.value = ''
  isParticipantModalOpen.value = true
}

const closeParticipantModal = () => {
  if (isInviting.value) {
    return
  }

  isParticipantModalOpen.value = false
  invitationMessage.value = ''
  invitationErrorMessage.value = ''
}

const sendInvitation = async () => {
  const nickname = inviteNickname.value.trim()
  const id = tripId.value

  if (!nickname) {
    invitationErrorMessage.value =
      '초대할 회원의 닉네임을 입력해 주세요.'
    invitationMessage.value = ''
    return
  }

  if (id === null) {
    invitationErrorMessage.value =
      '여행 정보를 확인할 수 없습니다.'
    invitationMessage.value = ''
    return
  }

  isInviting.value = true
  invitationMessage.value = ''
  invitationErrorMessage.value = ''

  try {
    await sendTripInvitation(id, nickname)

    inviteNickname.value = ''
    invitationMessage.value =
      '여행 초대를 보냈습니다.'
  } catch (error: unknown) {
    invitationErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '초대를 보내지 못했습니다.'
  } finally {
    isInviting.value = false
  }
}

const openTripEdit = () => {
  tripEditErrorMessage.value = ''
  isTripEditModalOpen.value = true
}

const closeTripEdit = () => {
  if (isSavingTrip.value) {
    return
  }

  isTripEditModalOpen.value = false
  tripEditErrorMessage.value = ''
}

const handleUpdateTrip = async (
  form: TripEditForm,
) => {
  const id = tripId.value

  if (id === null) {
    return
  }

  if (!form.title) {
    tripEditErrorMessage.value =
      '여행 제목을 입력해 주세요.'
    return
  }

  if (!form.destination) {
    tripEditErrorMessage.value =
      '대표 지역을 입력해 주세요.'
    return
  }

  if (!form.startDate) {
    tripEditErrorMessage.value =
      '여행 시작일을 선택해 주세요.'
    return
  }

  if (
    form.endDate
    && form.endDate < form.startDate
  ) {
    tripEditErrorMessage.value =
      '종료일은 시작일보다 빠를 수 없습니다.'
    return
  }

  isSavingTrip.value = true
  tripEditErrorMessage.value = ''

  try {
    trip.value = await updateTrip(id, {
      title: form.title,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate || null,
      description: form.description,
    })

    isTripEditModalOpen.value = false
  } catch (error: unknown) {
    tripEditErrorMessage.value =
      error instanceof ApiError
        ? error.message
        : '여행 정보를 수정하지 못했습니다.'
  } finally {
    isSavingTrip.value = false
  }
}

const handleDeleteTrip = async () => {
  const id = tripId.value

  if (id === null) {
    return
  }

  const confirmed = window.confirm(
    '여행을 삭제하시겠습니까?\n삭제한 여행은 복구할 수 없습니다.',
  )

  if (!confirmed) {
    return
  }

  try {
    await deleteTrip(id)
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
  const id = tripId.value

  if (id === null) {
    return
  }

  const confirmed = window.confirm(
    '이 여행에서 나가시겠습니까?\n나간 뒤에는 다시 초대를 받아야 참여할 수 있습니다.',
  )

  if (!confirmed) {
    return
  }

  try {
    await leaveTrip(id)
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
  const id = tripId.value

  if (
    id === null
    || isGeneratingAiDiary.value
  ) {
    return
  }

  isGeneratingAiDiary.value = true

  try {
    aiDiary.value =
      await generateTripAiDiary(id)
  } catch (error: unknown) {
    window.alert(
      error instanceof ApiError
        ? error.message
        : 'AI 여행기를 생성하지 못했습니다.',
    )
  } finally {
    isGeneratingAiDiary.value = false
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
    void loadCoverImage()
  },
)

onBeforeUnmount(() => {
  revokeCoverImageUrl()
  revokeTripPhotoImageUrls()
  revokeParticipantProfileImageUrls()
})
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

      <button
        type="button"
        @click="loadTrip"
      >
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
          @cover-error="handleCoverImageError"
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
      @save="handleUpdateTrip"
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
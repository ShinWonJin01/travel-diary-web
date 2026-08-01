<script setup lang="ts">
import { getStoredMember } from '@/api/auth'
import { ApiError, apiRequest } from '@/api/http'
import {
  getTripDetail,
  getTrips,
  type Trip,
  type TripListItem,
} from '@/api/trips'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'

interface TabItem {
  id: TripTab
  label: string
  icon: string
}

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

const trip = ref<Trip | null>(null)
const tripListItem = ref<TripListItem | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')
const isCoverImageBroken = ref(false)

const currentMember = getStoredMember()

const isParticipantModalOpen = ref(false)
const inviteNickname = ref('')
const isInviting = ref(false)
const invitationMessage = ref('')
const invitationErrorMessage = ref('')

const tripId = computed<number | null>(() => {
  const routeId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id

  const parsedId = Number(routeId)

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null
  }

  return parsedId
})

const formatDate = (date: string) => {
  return date.replaceAll('-', '.')
}

const toUtcTimestamp = (date: string) => {
  const [yearText, monthText, dayText] =
    date.split('-')

  if (!yearText || !monthText || !dayText) {
    return null
  }

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null
  }

  return Date.UTC(year, month - 1, day)
}

const tripTitle = computed(() => {
  return trip.value?.title ?? '여행 상세'
})

const tripDestination = computed(() => {
  return trip.value?.destination ?? ''
})

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

  const startTimestamp =
    toUtcTimestamp(trip.value.startDate)

  const endTimestamp =
    toUtcTimestamp(trip.value.endDate)

  if (
    startTimestamp === null ||
    endTimestamp === null
  ) {
    return '-'
  }

  const millisecondsPerDay =
    24 * 60 * 60 * 1000

  const nights = Math.max(
    Math.round(
      (endTimestamp - startTimestamp) /
        millisecondsPerDay,
    ),
    0,
  )

  return `${nights}박 ${nights + 1}일`
})

const tripDescription = computed(() => {
  return trip.value?.description.trim() ?? ''
})

const backendBaseUrl = (() => {
  const configuredUrl =
    import.meta.env.VITE_API_BASE_URL as
      | string
      | undefined

  if (
    !configuredUrl
    || configuredUrl.startsWith('/')
  ) {
    return 'http://localhost:8080'
  }

  return configuredUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
})()

const coverImageUrl = computed(() => {
  const path =
    trip.value?.coverImagePath

  if (
    !path
    || isCoverImageBroken.value
  ) {
    return ''
  }

  if (
    path.startsWith('http://')
    || path.startsWith('https://')
  ) {
    return path
  }

  const cleanedPath =
    path.replaceAll('\\', '/')

  const normalizedPath =
    cleanedPath.startsWith('/')
      ? cleanedPath
      : `/${cleanedPath}`

  return `${backendBaseUrl}${normalizedPath}`
})

watch(
  () => trip.value?.coverImagePath,
  () => {
    isCoverImageBroken.value = false
  },
)

/*
 * 현재 상세 API에는 전체 참여자 목록이 없으므로,
 * 실제 DB 응답에 포함된 여행 생성자만 우선 표시합니다.
 * 참여자 API를 연결하면 이 computed를 교체합니다.
 */
const participants = computed<Participant[]>(() => {
  if (!trip.value) {
    return []
  }

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
  return (
    tripListItem.value?.participantCount
    ?? participants.value.length
  )
})

const visibleParticipants = computed(() => {
  return participants.value.slice(0, 4)
})

const remainingParticipantCount = computed(() => {
  return Math.max(
    participantCount.value
      - visibleParticipants.value.length,
    0,
  )
})

const isOwner = computed(() => {
  if (!trip.value) {
    return false
  }

  if (tripListItem.value) {
    return tripListItem.value.role === 'OWNER'
  }

  return currentMember?.id === trip.value.ownerId
})

const loadTrip = async () => {
  if (tripId.value === null) {
    trip.value = null
    tripListItem.value = null
    errorMessage.value =
      '올바르지 않은 여행 주소입니다.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  isCoverImageBroken.value = false

  try {
    const [tripDetail, tripItems] =
      await Promise.all([
        getTripDetail(tripId.value),
        getTrips().catch(() => []),
      ])

    trip.value = tripDetail

    tripListItem.value =
      tripItems.find(
        (item) => item.id === tripId.value,
      ) ?? null
  } catch (error: unknown) {
    trip.value = null
    tripListItem.value = null

    if (error instanceof ApiError) {
      errorMessage.value = error.message
      return
    }

    errorMessage.value =
      '여행 정보를 불러오지 못했습니다.'
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
  {
    immediate: true,
  },
)

const tabs: TabItem[] = [
  { id: 'overview', label: '개요', icon: 'home' },
  { id: 'timeline', label: '타임라인', icon: 'timeline' },
  { id: 'photos', label: '사진', icon: 'photo' },
  { id: 'map', label: '지도', icon: 'map' },
  { id: 'ai-diary', label: 'AI 여행기', icon: 'sparkles' },
]

const timelineGroups: TimelineGroup[] = [
  {
    dateLabel: '04.10',
    dayLabel: '(수)',
    entries: [
      {
        id: 1,
        time: '10:30',
        title: '나리타 공항 도착',
        thumbnailClass: 'thumb-blue',
      },
      {
        id: 2,
        time: '13:00',
        title: '신주쿠 일정',
        thumbnailClass: 'thumb-green',
      },
      {
        id: 3,
        time: '19:00',
        title: '초밥 저녁',
        thumbnailClass: 'thumb-orange',
      },
    ],
  },
  {
    dateLabel: '04.11',
    dayLabel: '(목)',
    entries: [
      {
        id: 4,
        time: '09:30',
        title: '아사쿠사 관광',
        thumbnailClass: 'thumb-purple',
      },
      {
        id: 5,
        time: '14:00',
        title: '시부야 거리',
        thumbnailClass: 'thumb-sky',
      },
    ],
  },
]

const photos: PhotoItem[] = [
  {
    id: 1,
    title: '도쿄역',
    location: '도쿄역',
    className: 'photo-blue',
  },
  {
    id: 2,
    title: '신주쿠',
    location: '신주쿠',
    className: 'photo-green',
  },
  {
    id: 3,
    title: '야경',
    location: '도쿄 타워',
    className: 'photo-orange',
  },
  {
    id: 4,
    title: '카페',
    location: '시부야',
    className: 'photo-purple',
  },
  {
    id: 5,
    title: '거리 풍경',
    location: '긴자',
    className: 'photo-sky',
  },
  {
    id: 6,
    title: '저녁 식사',
    location: '우에노',
    className: 'photo-gray',
  },
]

const validTabs: TripTab[] = [
  'overview',
  'timeline',
  'photos',
  'map',
  'ai-diary',
]

const activeTab = computed<TripTab>(() => {
  const tab = route.query.tab

  if (
    typeof tab === 'string' &&
    validTabs.includes(tab as TripTab)
  ) {
    return tab as TripTab
  }

  return 'overview'
})

const selectTab = (tab: TripTab) => {
  isTripMenuOpen.value = false

  void router.replace({
    name: 'trip-detail',
    params: {
      id: route.params.id,
    },
    query: tab === 'overview' ? {} : { tab },
  })
}

const goToTimelineTab = () => {
  selectTab('timeline')
}

const showMobilePhotoButton = computed(() => {
  return ['overview', 'timeline', 'photos'].includes(
    activeTab.value,
  )
})

/* 사진 선택 */
const photoInputRef = ref<HTMLInputElement | null>(null)

const openPhotoUpload = () => {
  photoInputRef.value?.click()
}

const handlePhotoSelect = (event: Event) => {
  const input = event.target as HTMLInputElement

  if (!input.files || input.files.length === 0) {
    return
  }

  /*
   * 추후 여기에서 선택한 파일을 FormData에 담아
   * 사진 등록 API로 전송합니다.
   */

  input.value = ''
}

/* 여행 더보기 메뉴 */
const isTripMenuOpen = ref(false)

const openTripMenu = () => {
  isTripMenuOpen.value = !isTripMenuOpen.value
}

const closeTripMenu = () => {
  isTripMenuOpen.value = false
}

const closeTripMenuOnOutsideClick = (
  event: MouseEvent,
) => {
  if (!isTripMenuOpen.value) {
    return
  }

  const target = event.target

  if (!(target instanceof Element)) {
    return
  }

  if (target.closest('.trip-more-wrapper')) {
    return
  }

  closeTripMenu()
}

onMounted(() => {
  document.addEventListener(
    'click',
    closeTripMenuOnOutsideClick,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    closeTripMenuOnOutsideClick,
  )
})

const openParticipantModal = () => {
  closeTripMenu()
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

  if (!nickname) {
    invitationErrorMessage.value =
      '초대할 회원의 닉네임을 입력해 주세요.'
    invitationMessage.value = ''
    return
  }

  if (tripId.value === null) {
    invitationErrorMessage.value =
      '여행 정보를 확인할 수 없습니다.'
    invitationMessage.value = ''
    return
  }

  isInviting.value = true
  invitationMessage.value = ''
  invitationErrorMessage.value = ''

  try {
    await apiRequest(
      `/api/trips/${tripId.value}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify({
          nickname,
        }),
      },
    )

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
  closeTripMenu()

  window.alert(
    '여행 정보 수정 API와 수정 화면을 만든 뒤 이 버튼에 연결합니다.',
  )
}

const handleDeleteTrip = () => {
  closeTripMenu()

  window.alert(
    '여행 삭제 API를 만든 뒤 이 메뉴에 연결합니다.',
  )
}

const handleLeaveTrip = () => {
  closeTripMenu()

  window.alert(
    '여행 나가기 API를 만든 뒤 이 메뉴에 연결합니다.',
  )
}

const getTabIconPath = (icon: string) => {
  switch (icon) {
    case 'home':
      return 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z'

    case 'timeline':
      return 'M6 5v14M18 5v14M8 8h8M8 12h5M8 16h7'

    case 'photo':
      return 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm3 2.5a1.5 1.5 0 1 0 0 .01ZM5.5 17l4.5-4.5 3 3 2.5-2.5 3 4'

    case 'map':
      return 'm3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zm6-2v14m6-12v14'

    case 'sparkles':
      return 'm12 3 1.8 4.7L18.5 9 13.8 10.3 12 15l-1.8-4.7L5.5 9l4.7-1.3zm6.5 9.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1zm-13 2 1.1 2.9L10 18.5l-2.9 1.1L6 22.5l-1.1-2.9L2 18.5l2.9-1.1z'

    default:
      return ''
  }
}
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
      <!-- PC 좌측 사이드바 -->
      <aside class="detail-sidebar">
        <div class="sidebar-trip-info">
          <h1>{{ tripTitle }}</h1>
        </div>

        <nav
          class="sidebar-tabs"
          aria-label="여행 상세 메뉴"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path :d="getTabIconPath(tab.icon)" />
            </svg>

            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </aside>

      <!-- 상세 메인 영역 -->
      <section class="detail-main">
        <!-- 모바일 가로 탭 -->
        <nav
          class="mobile-tabs"
          aria-label="여행 상세 메뉴"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </nav>

        <!-- 개요 -->
        <div
          v-if="activeTab === 'overview'"
          class="overview-layout"
        >
          <!-- 여행 기본 정보 -->
          <section class="trip-info-card">
            <!-- 위쪽: 대표 이미지와 핵심 정보 -->
            <div class="trip-info-top">
              <div
                class="trip-cover-preview"
                :class="{
                  'trip-cover-preview-empty':
                    !coverImageUrl,
                }"
              >
                <img
                  v-if="coverImageUrl"
                  :src="coverImageUrl"
                  :alt="`${tripTitle} 대표 이미지`"
                  @error="handleCoverImageError"
                />

                <svg
                  v-else
                  viewBox="0 0 64 52"
                  aria-hidden="true"
                >
                  <path
                    d="M4 48 22 26l10 12 9-11 19 21z"
                  />
                  <circle cx="45" cy="14" r="7" />
                </svg>
              </div>

              <div class="trip-info-main">
                <span class="trip-info-label">
                  여행 기본 정보
                </span>

                <h2>{{ tripDestination }}</h2>

                <p>{{ tripPeriod }}</p>

                <p
                  v-if="tripDescription"
                  class="trip-description"
                >
                  {{ tripDescription }}
                </p>
              </div>

              <div class="trip-top-actions">
                <button
                  v-if="isOwner"
                  class="trip-edit-button"
                  type="button"
                  aria-label="여행 정보 수정"
                  @click="openTripEdit"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z"
                    />
                    <path d="m13.5 6.5 4 4" />
                  </svg>

                  <span>수정</span>
                </button>

                <div class="trip-more-wrapper">
                  <button
                    class="trip-more-button"
                    type="button"
                    aria-label="여행 메뉴 열기"
                    aria-haspopup="menu"
                    :aria-expanded="isTripMenuOpen"
                    @click="openTripMenu"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="5" r="1.3" />
                      <circle cx="12" cy="12" r="1.3" />
                      <circle cx="12" cy="19" r="1.3" />
                    </svg>
                  </button>

                  <div
                    v-if="isTripMenuOpen"
                    class="trip-menu-popup"
                    role="menu"
                  >
                    <button
                      v-if="isOwner"
                      class="danger-menu-item"
                      type="button"
                      role="menuitem"
                      @click="handleDeleteTrip"
                    >
                      여행 삭제
                    </button>

                    <button
                      v-else
                      type="button"
                      role="menuitem"
                      @click="handleLeaveTrip"
                    >
                      여행 나가기
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 아래쪽: 메타 정보와 주요 기능 -->
            <div class="trip-info-bottom">
              <div class="trip-info-meta">
                <div class="trip-info-item">
                  <span>여행 기간</span>
                  <strong>{{ tripDuration }}</strong>
                </div>

                <div class="trip-info-divider"></div>

                <div class="trip-info-item">
                  <span>여행 생성자</span>
                  <strong>{{ trip.ownerNickname }}</strong>
                </div>

                <div
                  class="
                    trip-info-divider
                    desktop-participant-divider
                  "
                ></div>

                <div class="desktop-participant-item">
                  <span class="desktop-participant-label">
                    참여자
                  </span>

                  <button
                    class="desktop-participant-summary"
                    type="button"
                    @click="openParticipantModal"
                  >
                    <span
                      class="participant-avatars"
                      aria-hidden="true"
                    >
                      <span
                        v-for="participant in visibleParticipants"
                        :key="participant.id"
                        class="participant-avatar"
                        :class="participant.avatarClass"
                      >
                        <img
                          v-if="participant.profileImageUrl"
                          :src="participant.profileImageUrl"
                          :alt="`${participant.nickname} 프로필`"
                        />

                        <span v-else>
                          {{ participant.nickname.slice(0, 1) }}
                        </span>
                      </span>

                      <span
                        v-if="remainingParticipantCount > 0"
                        class="
                          participant-avatar
                          remaining-avatar
                        "
                      >
                        +{{ remainingParticipantCount }}
                      </span>
                    </span>

                    <strong>
                      {{ participantCount }}명
                    </strong>
                  </button>
                </div>
              </div>

              <div class="trip-info-actions">
                <button
                  v-if="isOwner"
                  class="desktop-invite-button"
                  type="button"
                  @click="openParticipantModal"
                >
                  + 초대
                </button>

                <button
                  class="desktop-photo-button"
                  type="button"
                  @click="openPhotoUpload"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>

                  <span>사진 추가</span>
                </button>
              </div>
            </div>
          </section>

          <!-- 모바일 참여자 영역 -->
          <section class="mobile-participant-card">
            <button
              class="mobile-participant-summary"
              type="button"
              @click="openParticipantModal"
            >
              <span class="mobile-participant-label">
                참여자
                <strong>{{ participantCount }}명</strong>
              </span>

              <span class="mobile-participant-avatars">
                <span
                  v-for="participant in visibleParticipants"
                  :key="participant.id"
                  class="participant-avatar"
                  :class="participant.avatarClass"
                  :title="participant.nickname"
                >
                  <img
                    v-if="participant.profileImageUrl"
                    :src="participant.profileImageUrl"
                    :alt="`${participant.nickname} 프로필`"
                  />

                  <span v-else>
                    {{ participant.nickname.slice(0, 1) }}
                  </span>
                </span>

                <span
                  v-if="remainingParticipantCount > 0"
                  class="participant-avatar remaining-avatar"
                >
                  +{{ remainingParticipantCount }}
                </span>
              </span>
            </button>

            <button
              v-if="isOwner"
              class="mobile-invite-button"
              type="button"
              @click="openParticipantModal"
            >
              + 초대
            </button>
          </section>

          <!-- 지도 미리보기 -->
          <section class="map-card">
            <div class="map-canvas">
              <div class="map-grid"></div>

              <svg
                class="map-route"
                viewBox="0 0 500 700"
                aria-hidden="true"
              >
                <path
                  d="M120 120 C 170 180, 240 150, 270 240 S 330 360, 290 460 S 180 560, 220 640"
                />
              </svg>

              <span class="map-pin pin-1"></span>
              <span class="map-pin pin-2"></span>
              <span class="map-pin pin-3"></span>
              <span class="map-pin pin-4"></span>
              <span class="map-pin pin-5"></span>
            </div>
          </section>

          <!-- 타임라인 미리보기 -->
          <section class="timeline-side-card">
            <div class="timeline-card-header">
              <h2>타임라인</h2>

              <button
                type="button"
                @click="goToTimelineTab"
              >
                전체보기 <span>›</span>
              </button>
            </div>

            <div class="timeline-group-list">
              <section
                v-for="group in timelineGroups"
                :key="group.dateLabel"
                class="timeline-group"
              >
                <h3>
                  {{ group.dateLabel }}
                  <span>{{ group.dayLabel }}</span>
                </h3>

                <article
                  v-for="entry in group.entries"
                  :key="entry.id"
                  class="timeline-row"
                >
                  <div class="timeline-time">
                    {{ entry.time }}
                  </div>

                  <div class="timeline-dot-line">
                    <span class="timeline-dot"></span>
                  </div>

                  <div class="timeline-entry-content">
                    <strong>{{ entry.title }}</strong>

                    <div
                      class="timeline-thumbnail"
                      :class="entry.thumbnailClass"
                    ></div>
                  </div>
                </article>
              </section>
            </div>
          </section>
        </div>

        <!-- 타임라인 탭 -->
        <section
          v-else-if="activeTab === 'timeline'"
          class="panel-card"
        >
          <div class="panel-heading">
            <h2>타임라인</h2>
          </div>

          <div
            class="timeline-group-list timeline-group-list-full"
          >
            <section
              v-for="group in timelineGroups"
              :key="group.dateLabel"
              class="timeline-group"
            >
              <h3>
                {{ group.dateLabel }}
                <span>{{ group.dayLabel }}</span>
              </h3>

              <article
                v-for="entry in group.entries"
                :key="entry.id"
                class="timeline-row"
              >
                <div class="timeline-time">
                  {{ entry.time }}
                </div>

                <div class="timeline-dot-line">
                  <span class="timeline-dot"></span>
                </div>

                <div class="timeline-entry-content">
                  <div class="timeline-texts">
                    <strong>{{ entry.title }}</strong>
                    <p>여행 중 기록된 일정입니다.</p>
                  </div>

                  <div
                    class="timeline-thumbnail"
                    :class="entry.thumbnailClass"
                  ></div>
                </div>
              </article>
            </section>
          </div>
        </section>

        <!-- 사진 탭 -->
        <section
          v-else-if="activeTab === 'photos'"
          class="panel-card"
        >
          <div class="panel-heading">
            <h2>사진</h2>
          </div>

          <div class="photo-grid">
            <article
              v-for="photo in photos"
              :key="photo.id"
              class="photo-card"
              :class="photo.className"
            >
              <div class="photo-overlay">
                <strong>{{ photo.title }}</strong>
                <span>{{ photo.location }}</span>
              </div>
            </article>
          </div>
        </section>

        <!-- 지도 탭 -->
        <section
          v-else-if="activeTab === 'map'"
          class="panel-card"
        >
          <div class="panel-heading">
            <h2>지도</h2>
          </div>

          <div class="map-card map-card-large">
            <div class="map-canvas">
              <div class="map-grid"></div>

              <svg
                class="map-route"
                viewBox="0 0 500 700"
                aria-hidden="true"
              >
                <path
                  d="M120 120 C 170 180, 240 150, 270 240 S 330 360, 290 460 S 180 560, 220 640"
                />
              </svg>

              <span class="map-pin pin-1"></span>
              <span class="map-pin pin-2"></span>
              <span class="map-pin pin-3"></span>
              <span class="map-pin pin-4"></span>
              <span class="map-pin pin-5"></span>
            </div>
          </div>
        </section>

        <!-- AI 여행기 탭 -->
        <section
          v-else
          class="panel-card ai-panel"
        >
          <div class="panel-heading">
            <h2>AI 여행기</h2>
          </div>

          <div class="ai-box">
            <div class="ai-badge">AI</div>

            <div class="ai-content">
              <strong>
                사진과 타임라인을 바탕으로 여행기를 생성해보세요.
              </strong>

              <p>
                사진, 장소, 시간, 메모를 종합하여 자연스러운 여행
                기록을 자동으로 만들어줍니다.
              </p>

              <button
                type="button"
                class="primary-action-button"
              >
                AI 여행기 만들기
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>

    <!-- 참여자 관리 및 초대 모달 -->
    <div
      v-if="isParticipantModalOpen"
      class="participant-modal-backdrop"
      @click.self="closeParticipantModal"
    >
      <section
        class="participant-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-modal-title"
      >
        <header class="participant-modal-header">
          <div>
            <p>TRIP MEMBERS</p>
            <h2 id="participant-modal-title">
              참여자 관리
            </h2>
          </div>

          <button
            class="participant-modal-close"
            type="button"
            aria-label="참여자 관리 닫기"
            @click="closeParticipantModal"
          >
            ×
          </button>
        </header>

        <div class="participant-modal-summary">
          <strong>
            현재 참여자 {{ participantCount }}명
          </strong>

          <span>
            여행 생성자와 초대를 수락한 회원이 포함됩니다.
          </span>
        </div>

        <div class="participant-modal-list">
          <article
            v-for="participant in participants"
            :key="participant.id"
          >
            <span
              class="participant-avatar"
              :class="participant.avatarClass"
            >
              {{ participant.nickname.slice(0, 1) }}
            </span>

            <div>
              <strong>{{ participant.nickname }}</strong>
              <span>
                {{
                  participant.id === trip?.ownerId
                    ? '여행 생성자'
                    : '참여자'
                }}
              </span>
            </div>
          </article>

          <p
            v-if="
              participantCount
                > participants.length
            "
            class="participant-list-guide"
          >
            나머지 참여자 {{ participantCount - participants.length }}명의
            닉네임은 참여자 목록 API를 추가한 뒤 표시됩니다.
          </p>
        </div>

        <form
          v-if="isOwner"
          class="participant-invite-form"
          @submit.prevent="sendInvitation"
        >
          <label for="invite-nickname">
            친구 초대
          </label>

          <div class="participant-invite-row">
            <input
              id="invite-nickname"
              v-model="inviteNickname"
              type="text"
              maxlength="20"
              placeholder="초대할 회원의 닉네임"
              :disabled="isInviting"
            />

            <button
              type="submit"
              :disabled="isInviting"
            >
              {{
                isInviting
                  ? '보내는 중'
                  : '초대 보내기'
              }}
            </button>
          </div>

          <p
            v-if="invitationMessage"
            class="participant-action-message"
          >
            {{ invitationMessage }}
          </p>

          <p
            v-if="invitationErrorMessage"
            class="participant-action-error"
          >
            {{ invitationErrorMessage }}
          </p>
        </form>
      </section>
    </div>

    <!-- 숨겨진 사진 선택창 -->
    <input
      v-if="trip"
      ref="photoInputRef"
      class="photo-file-input"
      type="file"
      accept="image/*"
      multiple
      @change="handlePhotoSelect"
    />

    <!-- 모바일 사진 추가 버튼 -->
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

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 18px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.sidebar-trip-info h1 {
  margin: 0;
  font-size: 20px;
  color: #212734;
}

.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-tabs button {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #687383;
  background: transparent;
  cursor: pointer;
}

.sidebar-tabs button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.sidebar-tabs button.active {
  color: #3160ee;
  background: #eef3ff;
}

.detail-main {
  min-width: 0;
}

.mobile-tabs {
  display: none;
}

.overview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

/* =========================
   여행 기본 정보
========================= */
.trip-info-card {
  display: flex;
  grid-column: 1 / -1;
  flex-direction: column;
  padding: 18px 20px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.trip-info-top {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr) auto;
  align-items: start;
  gap: 20px;
}

.trip-cover-preview {
  display: flex;
  width: 94px;
  height: 94px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background: #edf1f5;
}

.trip-cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-cover-preview svg {
  width: 42px;
  fill: #ffffff;
  opacity: 0.9;
}

.trip-cover-preview-empty {
  background: linear-gradient(145deg, #a8bcd2, #7896b6);
}

.trip-info-main {
  min-width: 0;
  padding-top: 2px;
}

.trip-info-label {
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  font-weight: 700;
  color: #5273db;
}

.trip-info-main h2 {
  margin: 0;
  font-size: 19px;
  color: #222934;
}

.trip-info-main p {
  margin: 7px 0 0;
  font-size: 12px;
  color: #8a93a0;
}

.trip-info-main .trip-description {
  max-width: 620px;
  margin-top: 9px;
  overflow: hidden;
  line-height: 1.55;
  color: #5f6875;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trip-top-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trip-edit-button {
  display: inline-flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 10px;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  color: #596575;
  background: #ffffff;
  cursor: pointer;
}

.trip-edit-button:hover {
  color: #315fe8;
  border-color: #bdcaef;
  background: #f4f7ff;
}

.trip-edit-button svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.trip-info-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
  margin-top: 16px;
  padding-top: 15px;
  border-top: 1px solid #edf0f4;
}

.trip-info-meta {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 22px;
}

.trip-info-item {
  display: flex;
  min-width: 78px;
  flex-direction: column;
  gap: 6px;
}

.trip-info-item span,
.desktop-participant-label {
  font-size: 10px;
  color: #929aa5;
}

.trip-info-item strong {
  font-size: 13px;
  color: #313844;
}

.trip-info-divider {
  width: 1px;
  height: 34px;
  flex: 0 0 auto;
  background: #e6eaf0;
}

/* =========================
   참여자 및 여행 기능
========================= */
.desktop-participant-item {
  display: flex;
  min-width: 150px;
  flex-direction: column;
  gap: 5px;
}

.desktop-participant-summary {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 9px;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  cursor: pointer;
}

.desktop-participant-summary strong {
  font-size: 12px;
  color: #4f5967;
  white-space: nowrap;
}

.participant-avatars {
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.participant-avatar {
  display: grid;
  width: 30px;
  height: 30px;
  margin-left: -8px;
  place-items: center;
  overflow: hidden;
  padding: 0;
  border: 2px solid #ffffff;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
}

.participant-avatar:first-child {
  margin-left: 0;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-blue {
  background: #6f91c1;
}

.avatar-green {
  background: #72a584;
}

.avatar-orange {
  background: #c88d61;
}

.remaining-avatar {
  color: #5e6b7a;
  background: #eef1f5;
}

.trip-info-actions {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.desktop-invite-button {
  display: inline-flex;
  height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid #cfdaff;
  border-radius: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #315fe8;
  background: #eef3ff;
  cursor: pointer;
}

.desktop-invite-button:hover {
  background: #e4ebff;
}

.desktop-photo-button {
  display: inline-flex;
  height: 38px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #3464ee;
  cursor: pointer;
}

.desktop-photo-button:hover {
  background: #2857df;
}

.desktop-photo-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.trip-more-wrapper {
  position: relative;
}

.trip-more-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #5f6977;
  background: transparent;
  cursor: pointer;
}

.trip-more-button:hover {
  background: #f1f3f7;
}

.trip-more-button svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.trip-menu-popup {
  position: absolute;
  top: calc(100% + 7px);
  right: 0;
  z-index: 50;
  display: flex;
  width: 130px;
  overflow: hidden;
  flex-direction: column;
  padding: 5px;
  border: 1px solid #e2e7ee;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(38, 48, 67, 0.15);
}

.trip-menu-popup button {
  height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  font-size: 11px;
  color: #46505e;
  text-align: left;
  background: transparent;
  cursor: pointer;
}

.trip-menu-popup button:hover {
  background: #f3f6fa;
}

.trip-menu-popup .danger-menu-item {
  color: #d54b5d;
}

.trip-menu-popup .danger-menu-item:hover {
  background: #fff1f3;
}

.mobile-participant-card {
  display: none;
}

.photo-file-input {
  display: none;
}

/* =========================
   지도
========================= */
.map-card,
.timeline-side-card,
.panel-card {
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.map-card {
  padding: 14px;
}

.map-canvas {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 610px;
  border-radius: 12px;
  background: #ebe6d8;
}

.map-grid {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.3) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle at 20% 20%,
      rgba(123, 176, 232, 0.35),
      transparent 18%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(123, 176, 232, 0.28),
      transparent 18%
    ),
    linear-gradient(135deg, #f1ebdd, #e6dece);
  background-size:
    32px 32px,
    32px 32px,
    auto,
    auto,
    auto;
}

.map-route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.map-route path {
  fill: none;
  stroke: #2f68f2;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.map-pin {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: #2f68f2;
  box-shadow: 0 4px 10px rgba(47, 104, 242, 0.35);
}

.pin-1 {
  top: 90px;
  left: 95px;
}

.pin-2 {
  top: 205px;
  left: 245px;
}

.pin-3 {
  top: 330px;
  left: 285px;
}

.pin-4 {
  top: 460px;
  left: 225px;
}

.pin-5 {
  top: 580px;
  left: 195px;
}

/* =========================
   타임라인
========================= */
.timeline-side-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 18px 16px;
}

.timeline-card-header,
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.timeline-card-header h2,
.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #222834;
}

.timeline-card-header button {
  border: 0;
  font-size: 12px;
  font-weight: 600;
  color: #4b74f0;
  background: transparent;
  cursor: pointer;
}

.timeline-card-header button span {
  font-size: 16px;
}

.timeline-group-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 22px;
}

.timeline-group h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #303743;
}

.timeline-group h3 span {
  margin-left: 4px;
  font-size: 12px;
  color: #8a92a0;
}

.timeline-row {
  display: grid;
  grid-template-columns: 54px 18px minmax(0, 1fr);
  align-items: start;
  min-width: 0;
}

.timeline-row + .timeline-row {
  margin-top: 14px;
}

.timeline-time {
  padding-top: 4px;
  font-size: 11px;
  color: #8a92a0;
}

.timeline-dot-line {
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 72px;
}

.timeline-dot-line::after {
  position: absolute;
  top: 14px;
  bottom: -14px;
  width: 1px;
  background: #dbe1eb;
  content: '';
}

.timeline-group
  .timeline-row:last-child
  .timeline-dot-line::after {
  display: none;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  background: #4c74ee;
}

.timeline-entry-content {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.timeline-entry-content strong {
  display: block;
  min-width: 0;
  font-size: 13px;
  color: #262d38;
}

.timeline-texts {
  min-width: 0;
  flex: 1;
}

.timeline-texts p {
  margin: 6px 0 0;
  font-size: 11px;
  color: #8d95a1;
}

.timeline-thumbnail {
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border-radius: 10px;
}

.thumb-blue {
  background: linear-gradient(145deg, #88aeda, #4d7cbd);
}

.thumb-green {
  background: linear-gradient(145deg, #96c09e, #5d8c66);
}

.thumb-orange {
  background: linear-gradient(145deg, #f0b98c, #ba7d58);
}

.thumb-purple {
  background: linear-gradient(145deg, #b4a6d8, #7d6ca8);
}

.thumb-sky {
  background: linear-gradient(145deg, #8fd1ea, #5f99c7);
}

/* =========================
   공통 패널
========================= */
.panel-card {
  padding: 18px;
}

.timeline-group-list-full {
  gap: 28px;
}

/* =========================
   사진
========================= */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-card {
  position: relative;
  min-height: 200px;
  overflow: hidden;
  border-radius: 14px;
}

.photo-blue {
  background: linear-gradient(145deg, #89bbe1, #4e7aa9);
}

.photo-green {
  background: linear-gradient(145deg, #9ac7a3, #61896c);
}

.photo-orange {
  background: linear-gradient(145deg, #f0b98d, #b57753);
}

.photo-purple {
  background: linear-gradient(145deg, #bfaedc, #796aab);
}

.photo-sky {
  background: linear-gradient(145deg, #93d4ed, #689dc4);
}

.photo-gray {
  background: linear-gradient(145deg, #c9ced8, #7f8795);
}

.photo-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 34px 14px 14px;
  color: #ffffff;
  background: linear-gradient(
    transparent,
    rgba(19, 27, 39, 0.7)
  );
}

.photo-overlay strong {
  display: block;
  font-size: 13px;
}

.photo-overlay span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
}

/* =========================
   AI 여행기
========================= */
.ai-panel {
  padding-bottom: 22px;
}

.ai-box {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  padding: 24px;
  border-radius: 14px;
  background: linear-gradient(145deg, #eef2ff, #fafbff);
}

.ai-badge {
  display: grid;
  width: 100px;
  height: 100px;
  place-items: center;
  border-radius: 24px;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(145deg, #5c79f0, #7d63c9);
}

.ai-content strong {
  font-size: 18px;
  color: #252b37;
}

.ai-content p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #6e7887;
}

.primary-action-button {
  height: 44px;
  margin-top: 18px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: #3565f3;
  cursor: pointer;
}

.participant-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.participant-modal {
  width: min(460px, 100%);
  max-height: min(680px, calc(100vh - 40px));
  overflow-y: auto;
  padding: 22px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
}

.participant-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.participant-modal-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #4c6fea;
}

.participant-modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222a36;
}

.participant-modal-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: #747e8c;
  background: #f3f5f8;
  cursor: pointer;
}

.participant-modal-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 20px;
  padding: 14px;
  border-radius: 10px;
  background: #f5f7fb;
}

.participant-modal-summary strong {
  font-size: 13px;
  color: #343c48;
}

.participant-modal-summary span {
  font-size: 10px;
  color: #8b94a0;
}

.participant-modal-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.participant-modal-list article {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 2px;
  border-bottom: 1px solid #edf0f4;
}

.participant-modal-list article > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.participant-modal-list article strong {
  font-size: 12px;
  color: #303743;
}

.participant-modal-list article div span {
  font-size: 9px;
  color: #939ba6;
}

.participant-list-guide {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 9px;
  line-height: 1.6;
  color: #7e8793;
  background: #f7f8fa;
}

.participant-invite-form {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e8ecf1;
}

.participant-invite-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #495362;
}

.participant-invite-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.participant-invite-row input {
  min-width: 0;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #dce2ea;
  border-radius: 9px;
  outline: none;
  font-size: 12px;
}

.participant-invite-row input:focus {
  border-color: #5878e9;
  box-shadow: 0 0 0 3px rgba(88, 120, 233, 0.11);
}

.participant-invite-row button {
  height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #3565ef;
  cursor: pointer;
}

.participant-invite-row button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.participant-action-message,
.participant-action-error {
  margin: 9px 0 0;
  font-size: 10px;
}

.participant-action-message {
  color: #28745c;
}

.participant-action-error {
  color: #c74658;
}

.mobile-floating-button {
  display: none;
}

/* =========================
   모바일
========================= */
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

  .detail-sidebar {
    display: none;
  }

  .detail-main {
    padding-top: 0;
  }

  /* 모바일 상세 탭 */
  .mobile-tabs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    overflow: visible;
    padding: 0 8px;
    border-bottom: 1px solid #e7ebf1;
    background: #ffffff;
  }

  .mobile-tabs button {
    position: relative;
    min-width: 0;
    height: 38px;
    overflow: hidden;
    padding: 0 2px;
    border: 0;
    font-size: 10px;
    font-weight: 600;
    color: #8993a1;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: transparent;
    cursor: pointer;
  }

  .mobile-tabs button.active {
    color: #3163ed;
  }

  .mobile-tabs button.active::after {
    position: absolute;
    right: 8px;
    bottom: 0;
    left: 8px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: #3163ed;
    content: '';
  }

  /* 모바일 전용 구성 */
  .desktop-participant-item,
  .desktop-participant-divider,
  .trip-info-actions {
    display: none;
  }

  .mobile-participant-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    padding: 10px 12px;
    border: 1px solid #e6eaf2;
    border-radius: 10px;
    background: #ffffff;
  }

  .mobile-participant-summary {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
    border: 0;
    color: inherit;
    text-align: left;
    background: transparent;
    cursor: pointer;
  }

  .mobile-participant-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 8px;
    color: #8c95a1;
  }

  .mobile-participant-label strong {
    font-size: 10px;
    color: #343c48;
  }

  .mobile-participant-avatars {
    display: flex;
    align-items: center;
    padding-left: 7px;
  }

  .mobile-participant-avatars .participant-avatar {
    width: 27px;
    height: 27px;
    font-size: 9px;
  }

  .mobile-invite-button {
    height: 32px;
    flex: 0 0 auto;
    padding: 0 11px;
    border: 1px solid #cfdaff;
    border-radius: 8px;
    font-size: 9px;
    font-weight: 700;
    color: #315fe8;
    background: #eef3ff;
    cursor: pointer;
  }

  /* 개요 */
  .overview-layout {
    display: block;
    padding: 10px 10px 0;
  }

  .trip-info-card {
    margin-bottom: 10px;
    padding: 12px;
    border-radius: 10px;
  }

  .trip-info-top {
    grid-template-columns:
      76px minmax(0, 1fr) auto;
    gap: 12px;
  }

  .trip-cover-preview {
    width: 76px;
    height: 76px;
    border-radius: 9px;
  }

  .trip-cover-preview svg {
    width: 34px;
  }

  .trip-info-main {
    padding-top: 0;
  }

  .trip-info-label {
    margin-bottom: 5px;
    font-size: 8px;
  }

  .trip-top-actions {
    gap: 4px;
  }

  .trip-edit-button {
    width: 29px;
    height: 29px;
    padding: 0;
  }

  .trip-top-actions .trip-more-button {
    width: 29px;
    height: 29px;
  }

  .trip-edit-button span {
    display: none;
  }

  .trip-edit-button svg {
    width: 13px;
    height: 13px;
  }

  .trip-info-main h2 {
    font-size: 13px;
  }

  .trip-info-main p {
    margin-top: 5px;
    font-size: 9px;
  }

  .trip-info-main .trip-description {
    max-width: none;
    white-space: normal;
  }

  .trip-info-bottom {
    display: block;
    margin-top: 11px;
    padding-top: 10px;
  }

  .trip-info-meta {
    width: 100%;
    gap: 12px;
  }

  .trip-info-item {
    min-width: 54px;
    gap: 4px;
  }

  .trip-info-item span {
    font-size: 7px;
  }

  .trip-info-item strong {
    font-size: 9px;
  }

  .trip-info-divider {
    height: 26px;
  }

  .map-card,
  .timeline-side-card,
  .panel-card {
    border-radius: 10px;
  }

  .map-card {
    padding: 7px;
  }

  .map-canvas {
    height: 170px;
    border-radius: 8px;
  }

  .map-route path {
    stroke-width: 8;
  }

  .map-pin {
    width: 14px;
    height: 14px;
    border-width: 3px;
    box-shadow: 0 3px 8px rgba(47, 104, 242, 0.3);
  }

  .pin-1 {
    top: 18%;
    left: 20%;
  }

  .pin-2 {
    top: 36%;
    left: 49%;
  }

  .pin-3 {
    top: 53%;
    left: 62%;
  }

  .pin-4 {
    top: 69%;
    left: 50%;
  }

  .pin-5 {
    top: 84%;
    left: 38%;
  }

  /* 개요 안 타임라인 */
  .timeline-side-card {
    margin-top: 10px;
    padding: 12px 11px;
  }

  .timeline-card-header,
  .panel-heading {
    margin-bottom: 10px;
  }

  .timeline-card-header h2,
  .panel-heading h2 {
    font-size: 14px;
  }

  .timeline-card-header button {
    padding: 3px 0;
    font-size: 9px;
  }

  .timeline-card-header button span {
    font-size: 12px;
  }

  .timeline-group-list {
    gap: 16px;
  }

  .timeline-group h3 {
    margin-bottom: 8px;
    font-size: 11px;
  }

  .timeline-group h3 span {
    margin-left: 3px;
    font-size: 9px;
  }

  .timeline-row {
    grid-template-columns: 40px 12px minmax(0, 1fr);
  }

  .timeline-row + .timeline-row {
    margin-top: 8px;
  }

  .timeline-time {
    padding-top: 3px;
    font-size: 8px;
  }

  .timeline-dot-line {
    min-height: 44px;
  }

  .timeline-dot-line::after {
    top: 11px;
    bottom: -8px;
  }

  .timeline-dot {
    width: 6px;
    height: 6px;
    margin-top: 5px;
  }

  .timeline-entry-content {
    gap: 8px;
  }

  .timeline-entry-content strong {
    font-size: 10px;
  }

  .timeline-texts p {
    margin-top: 4px;
    font-size: 8px;
  }

  .timeline-thumbnail {
    width: 34px;
    height: 34px;
    border-radius: 6px;
  }

  /* 나머지 탭 */
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
  }

  .timeline-group-list-full {
    gap: 20px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .photo-card {
    min-height: 120px;
    border-radius: 8px;
  }

  .photo-overlay {
    padding: 28px 10px 10px;
  }

  .photo-overlay strong {
    font-size: 10px;
  }

  .photo-overlay span {
    margin-top: 3px;
    font-size: 8px;
  }

  .map-card-large {
    padding: 7px;
  }

  .map-card-large .map-canvas {
    height: 320px;
  }

  .ai-box {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 15px;
  }

  .ai-badge {
    width: 58px;
    height: 58px;
    border-radius: 15px;
    font-size: 18px;
  }

  .ai-content strong {
    font-size: 13px;
    line-height: 1.5;
  }

  .ai-content p {
    margin-top: 7px;
    font-size: 10px;
  }

  .primary-action-button {
    height: 39px;
    margin-top: 13px;
    font-size: 11px;
  }

  .participant-modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .participant-modal {
    width: 100%;
    max-height: 82vh;
    padding: 18px 17px 22px;
    border-radius: 18px 18px 0 0;
  }

  .participant-modal-header h2 {
    font-size: 17px;
  }

  .participant-invite-row {
    grid-template-columns: 1fr;
  }

  .participant-invite-row button {
    width: 100%;
  }

  /* 모바일 사진 추가 버튼 */
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

@media (min-width: 761px) {
  .trip-cover-preview {
    align-self: center;
  }

  .trip-info-bottom {
    margin-top: 18px;
  }
}
</style>
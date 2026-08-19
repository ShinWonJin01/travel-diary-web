<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import {
  getStoredMember,
  logout as clearStoredLogin,
  type Member,
} from '@/api/auth'
import { getTripDetail } from '@/api/trips'
import useNotifications from '@/composables/notifications/useNotifications'

import AppNotificationPopup from './layout/AppNotificationPopup.vue'
import MobileBottomNavigation from './layout/MobileBottomNavigation.vue'

const route = useRoute()
const router = useRouter()

const currentMember = ref<Member | null>(getStoredMember())
const tripDetailTitle = ref('여행 상세')

const {
  isNotificationOpen,
  notifications,
  unreadCount,
  loadUnreadCount,
  toggleNotificationPopup,
  closeNotificationPopup,
  markAllAsRead,
  openNotification,
} = useNotifications(currentMember)

const memberNickname = computed(
  () => currentMember.value?.nickname ?? '마이페이지',
)

const isHomePage = computed(() => route.name === 'home')
const isTripsPage = computed(() => route.name === 'trips')
const isTripDetailPage = computed(() => route.name === 'trip-detail')

const mobileTitle = computed(() => {
  switch (route.name) {
    case 'trips':
      return '여행 기록'
    case 'invitations':
      return '초대 관리'
    case 'mypage':
      return '마이페이지'
    case 'trip-create':
      return '여행 만들기'
    case 'trip-detail':
      return tripDetailTitle.value
    default:
      return '공동 여행기록장'
  }
})

const loadTripDetailTitle = async () => {
  if (route.name !== 'trip-detail') {
    tripDetailTitle.value = '여행 상세'
    return
  }

  const routeId = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id

  const tripId = Number(routeId)

  if (!Number.isInteger(tripId) || tripId <= 0) {
    tripDetailTitle.value = '여행 상세'
    return
  }

  try {
    const trip = await getTripDetail(tripId)
    tripDetailTitle.value = trip.title
  } catch {
    tripDetailTitle.value = '여행 상세'
  }
}

const closeNotificationOnOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) return

  const clickedInsideNotification = target.closest(
    '.notification-wrapper, .mobile-notification-wrapper',
  )

  if (!clickedInsideNotification) {
    closeNotificationPopup()
  }
}

const goBack = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }

  void router.push('/')
}

const goToCreateTrip = () => {
  void router.push('/trips/create')
}

const handleLogout = async () => {
  clearStoredLogin()
  currentMember.value = null
  closeNotificationPopup()

  await router.replace('/login')
}

watch(
  () => route.fullPath,
  () => {
    closeNotificationPopup()
    void loadUnreadCount()
  },
)

watch(
  () => [route.name, route.params.id],
  () => {
    void loadTripDetailTitle()
  },
  { immediate: true },
)

onMounted(() => {
  void loadUnreadCount()
  document.addEventListener('click', closeNotificationOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeNotificationOnOutsideClick)
})
</script>

<template>
  <!-- PC 헤더 -->
  <header class="desktop-header">
    <RouterLink class="brand" to="/">
      <span class="brand-symbol">
        <span></span>
        <span></span>
      </span>
      <strong>공동 여행기록장</strong>
    </RouterLink>

    <nav class="desktop-navigation">
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/trips">여행 기록</RouterLink>
      <RouterLink to="/invitations">초대 관리</RouterLink>
    </nav>

    <div class="desktop-actions">
      <div class="notification-wrapper">
        <button
          class="notification-button"
          type="button"
          aria-label="알림 열기"
          :aria-expanded="isNotificationOpen"
          @click="toggleNotificationPopup"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>

          <span v-if="unreadCount > 0" class="notification-count">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <AppNotificationPopup
          v-if="isNotificationOpen"
          :notifications="notifications"
          :unread-count="unreadCount"
          @mark-all-read="markAllAsRead"
          @open="openNotification"
        />
      </div>

      <div class="account-actions">
        <RouterLink class="mypage-button" to="/mypage" :title="memberNickname">
          {{ memberNickname }}
        </RouterLink>

        <button class="logout-button" type="button" @click="handleLogout">
          로그아웃
        </button>
      </div>
    </div>
  </header>

  <!-- 모바일 상단 헤더 -->
  <header
    class="mobile-header"
    :class="{ 'trip-detail-header': isTripDetailPage }"
  >
    <button
      v-if="isHomePage"
      class="mobile-header-button"
      type="button"
      aria-label="전체 메뉴 열기"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>

    <button
      v-else
      class="mobile-header-button"
      type="button"
      aria-label="이전 화면으로 이동"
      @click="goBack"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <strong class="mobile-header-title">
      {{ mobileTitle }}
    </strong>

    <div v-if="isHomePage" class="mobile-notification-wrapper">
      <button
        class="mobile-notification"
        type="button"
        aria-label="알림 열기"
        :aria-expanded="isNotificationOpen"
        @click="toggleNotificationPopup"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>

        <span v-if="unreadCount > 0" class="notification-count">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <AppNotificationPopup
        v-if="isNotificationOpen"
        mobile
        :notifications="notifications"
        :unread-count="unreadCount"
        @mark-all-read="markAllAsRead"
        @open="openNotification"
      />
    </div>

    <button
      v-else-if="isTripsPage"
      class="mobile-header-button"
      type="button"
      aria-label="새 여행 만들기"
      @click="goToCreateTrip"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <span v-else class="mobile-header-side"></span>
  </header>

  <MobileBottomNavigation v-if="!isTripDetailPage" />
</template>

<style scoped>
/* =========================
   PC 헤더
========================= */
.desktop-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 76px;
  padding: 0 48px;
  border-bottom: 1px solid #e6ebf1;
  background: #ffffff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  color: #6b89ad;
}

.brand strong {
  font-size: 17px;
  font-weight: 700;
}

.brand-symbol {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 28px;
}

.brand-symbol span {
  height: 9px;
  border-radius: 10px;
  background: #d5e0ec;
}

.brand-symbol span:last-child {
  width: 20px;
}

.desktop-navigation {
  display: flex;
  align-items: stretch;
  gap: 92px;
  height: 100%;
}

.desktop-navigation a {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #536477;
}

.desktop-navigation a:hover,
.desktop-navigation a.router-link-exact-active {
  color: #3157e8;
}

.desktop-navigation a.router-link-exact-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #3157e8;
  content: '';
}

.desktop-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 28px;
}

.account-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mypage-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  max-width: 150px;
  height: 42px;
  padding: 0 18px;
  overflow: hidden;
  border-radius: 24px;
  font-size: 13px;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #4e6688;
}

.logout-button {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #d7e0ea;
  border-radius: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #536477;
  background: #ffffff;
  cursor: pointer;
}

.logout-button:hover {
  border-color: #b8c5d4;
  background: #f6f8fb;
}

/* =========================
   알림 버튼
========================= */
.notification-wrapper,
.mobile-notification-wrapper {
  position: relative;
}

.notification-button,
.mobile-notification {
  position: relative;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  color: #27364a;
  background: transparent;
  cursor: pointer;
}

.notification-button svg,
.mobile-notification svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.notification-count {
  position: absolute;
  top: -6px;
  right: -7px;
  display: flex;
  min-width: 17px;
  height: 17px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #ffffff;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 700;
  color: #ffffff;
  background: #ff4058;
}

/* PC에서는 모바일 헤더 숨김 */
.mobile-header {
  display: none;
}

/* =========================
   모바일
========================= */
@media (max-width: 760px) {
  .desktop-header {
    display: none;
  }

  .mobile-header {
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr) 36px;
    align-items: center;
    height: 58px;
    padding: 0 17px;
    border-bottom: 1px solid #eef1f5;
    background: #ffffff;
  }

  .mobile-header.trip-detail-header {
    height: 52px;
    padding: 0 12px;
  }

  .mobile-header-title {
    overflow: hidden;
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #202734;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trip-detail-header .mobile-header-title {
    font-size: 14px;
  }

  .mobile-header-button {
    display: flex;
    width: 24px;
    height: 24px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    color: #27364a;
    background: transparent;
    cursor: pointer;
  }

  .mobile-header-button svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .mobile-header > .mobile-header-button:first-child {
    justify-self: start;
  }

  .mobile-header > .mobile-header-button:last-child {
    justify-self: end;
  }

  .mobile-header-side {
    display: block;
    width: 24px;
    height: 24px;
    justify-self: end;
  }

  .mobile-notification-wrapper {
    justify-self: end;
  }

  .mobile-notification {
    width: 24px;
    height: 24px;
  }

  .mobile-notification svg {
    width: 20px;
    height: 20px;
  }

  .mobile-notification .notification-count {
    top: -7px;
    right: -8px;
    min-width: 16px;
    height: 16px;
    font-size: 7px;
  }
}
</style>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

type NotificationType = 'invitation' | 'trip-change' | 'activity' | 'ai'

interface NotificationItem {
  id: number
  type: NotificationType
  message: string
  tripTitle: string
  time: string
  isRead: boolean
  to: string
}

const route = useRoute()
const router = useRouter()

const isHomePage = computed(() => route.name === 'home')
const isTripsPage = computed(() => route.name === 'trips')

const isNotificationOpen = ref(false)

const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    type: 'invitation',
    message: '새로운 여행 초대가 도착했습니다.',
    tripTitle: '유럽 배낭여행',
    time: '5분 전',
    isRead: false,
    to: '/invitations',
  },
  {
    id: 2,
    type: 'trip-change',
    message: '여행 일정이 변경되었습니다.',
    tripTitle: '제주도 가족여행',
    time: '30분 전',
    isRead: false,
    to: '/trips',
  },
  {
    id: 3,
    type: 'activity',
    message: '김민수님이 사진 8장을 추가했습니다.',
    tripTitle: '제주도 가족여행',
    time: '1시간 전',
    isRead: false,
    to: '/trips?filter=participating',
  },
  {
    id: 4,
    type: 'ai',
    message: 'AI 여행기가 완성되었습니다.',
    tripTitle: '도쿄 여행',
    time: '어제',
    isRead: true,
    to: '/trips',
  },
])

const unreadCount = computed(() => {
  return notifications.value.filter((notification) => !notification.isRead).length
})

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

    default:
      return '공동 여행기록장'
  }
})

const getNotificationTypeLabel = (type: NotificationType) => {
  switch (type) {
    case 'invitation':
      return '초대'

    case 'trip-change':
      return '여행 변경'

    case 'activity':
      return '참여자 활동'

    case 'ai':
      return 'AI 여행기'
  }
}

const toggleNotificationPopup = () => {
  isNotificationOpen.value = !isNotificationOpen.value
}

const closeNotificationOnOutsideClick = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Element)) {
    return
  }

  const clickedInsideNotification = target.closest(
    '.notification-wrapper, .mobile-notification-wrapper',
  )

  if (clickedInsideNotification) {
    return
  }

  isNotificationOpen.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.isRead = true
  })
}

const openNotification = async (notification: NotificationItem) => {
  notification.isRead = true
  isNotificationOpen.value = false

  await router.push(notification.to)
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

watch(
  () => route.fullPath,
  () => {
    isNotificationOpen.value = false
  },
)

onMounted(() => {
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
      <!-- PC 알림 -->
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

        <div v-if="isNotificationOpen" class="notification-popup">
          <div class="notification-popup-header">
            <div>
              <h2>알림</h2>
              <p>읽지 않은 알림 {{ unreadCount }}개</p>
            </div>

            <button type="button" :disabled="unreadCount === 0" @click="markAllAsRead">
              모두 읽음
            </button>
          </div>

          <div v-if="notifications.length > 0" class="notification-list">
            <button
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.isRead }"
              type="button"
              @click="openNotification(notification)"
            >
              <span class="notification-unread-dot" :class="{ hidden: notification.isRead }"></span>

              <span class="notification-information">
                <span class="notification-type" :class="notification.type">
                  {{ getNotificationTypeLabel(notification.type) }}
                </span>

                <strong>
                  {{ notification.message }}
                </strong>

                <span class="notification-meta">
                  {{ notification.tripTitle }}
                  <span>·</span>
                  {{ notification.time }}
                </span>
              </span>
            </button>
          </div>

          <div v-else class="empty-notification">
            <p>새로운 알림이 없습니다.</p>
          </div>
        </div>
      </div>

      <RouterLink class="mypage-button" to="/mypage"> mypage </RouterLink>
    </div>
  </header>

  <!-- 모바일 상단 헤더 -->
  <header class="mobile-header">
    <!-- 홈: 삼단바 -->
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

    <!-- 홈 이외 화면: 뒤로가기 -->
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

    <!-- 모바일 홈 알림 -->
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

      <div v-if="isNotificationOpen" class="notification-popup">
        <div class="notification-popup-header">
          <div>
            <h2>알림</h2>
            <p>읽지 않은 알림 {{ unreadCount }}개</p>
          </div>

          <button type="button" :disabled="unreadCount === 0" @click="markAllAsRead">
            모두 읽음
          </button>
        </div>

        <div v-if="notifications.length > 0" class="notification-list">
          <button
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.isRead }"
            type="button"
            @click="openNotification(notification)"
          >
            <span class="notification-unread-dot" :class="{ hidden: notification.isRead }"></span>

            <span class="notification-information">
              <span class="notification-type" :class="notification.type">
                {{ getNotificationTypeLabel(notification.type) }}
              </span>

              <strong>
                {{ notification.message }}
              </strong>

              <span class="notification-meta">
                {{ notification.tripTitle }}
                <span>·</span>
                {{ notification.time }}
              </span>
            </span>
          </button>
        </div>

        <div v-else class="empty-notification">
          <p>새로운 알림이 없습니다.</p>
        </div>
      </div>
    </div>

    <!-- 여행 기록: 여행 추가 -->
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

  <!-- 모바일 하단 메뉴 -->
  <nav class="mobile-bottom-navigation">
    <RouterLink to="/">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />
      </svg>

      <span>홈</span>
    </RouterLink>

    <RouterLink to="/trips">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16v14H4zM8 6V4h8v2" />
      </svg>

      <span>여행 기록</span>
    </RouterLink>

    <RouterLink to="/invitations">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 20c0-4 2-6 6-6s6 2 6 6M15 15c4 0 6 2 6 5" />
      </svg>

      <span>초대 관리</span>
    </RouterLink>

    <RouterLink to="/mypage">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
      </svg>

      <span>마이페이지</span>
    </RouterLink>
  </nav>
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

.mypage-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  height: 42px;
  border-radius: 24px;
  font-size: 13px;
  color: #ffffff;
  background: #4e6688;
}

/* =========================
   알림
========================= */
.notification-wrapper,
.mobile-notification-wrapper {
  position: relative;
}

.notification-button,
.mobile-notification {
  position: relative;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
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

.notification-popup {
  position: absolute;
  top: calc(100% + 17px);
  right: 0;
  z-index: 300;
  width: 370px;
  overflow: hidden;
  border: 1px solid #e2e7ed;
  border-radius: 13px;
  background: #ffffff;
  box-shadow: 0 16px 45px rgba(31, 43, 61, 0.18);
}

.notification-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 19px;
  border-bottom: 1px solid #edf0f4;
}

.notification-popup-header h2 {
  margin: 0;
  font-size: 16px;
  color: #252c36;
}

.notification-popup-header p {
  margin: 5px 0 0;
  font-size: 10px;
  color: #949ca7;
}

.notification-popup-header > button {
  padding: 5px;
  border: 0;
  font-size: 11px;
  font-weight: 600;
  color: #4164e9;
  background: transparent;
  cursor: pointer;
}

.notification-popup-header > button:disabled {
  color: #b6bcc4;
  cursor: default;
}

.notification-list {
  max-height: 390px;
  overflow-y: auto;
}

.notification-item {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 15px 18px;
  border: 0;
  border-bottom: 1px solid #f0f2f5;
  text-align: left;
  background: #ffffff;
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item.unread {
  background: #f8faff;
}

.notification-item:hover {
  background: #f4f7fb;
}

.notification-unread-dot {
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: #3f67ef;
}

.notification-unread-dot.hidden {
  visibility: hidden;
}

.notification-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.notification-type {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
}

.notification-type.invitation {
  color: #315ce8;
  background: #eaf0ff;
}

.notification-type.trip-change {
  color: #8a6415;
  background: #fff4d5;
}

.notification-type.activity {
  color: #28745c;
  background: #e7f7f0;
}

.notification-type.ai {
  color: #7052b4;
  background: #f0eaff;
}

.notification-information strong {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #303741;
}

.notification-meta {
  margin-top: 6px;
  font-size: 10px;
  color: #979fa9;
}

.notification-meta span {
  margin: 0 4px;
  color: #c1c6cd;
}

.empty-notification {
  display: flex;
  min-height: 170px;
  align-items: center;
  justify-content: center;
}

.empty-notification p {
  margin: 0;
  font-size: 12px;
  color: #959da7;
}

/* PC에서는 모바일 요소 숨김 */
.mobile-header,
.mobile-bottom-navigation {
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

  .mobile-header-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
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

  .mobile-notification-wrapper .notification-popup {
    position: fixed;
    top: 66px;
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100vh - 150px);
  }

  .notification-popup-header {
    padding: 15px 16px;
  }

  .notification-popup-header h2 {
    font-size: 14px;
  }

  .notification-popup-header p {
    font-size: 9px;
  }

  .notification-popup-header > button {
    font-size: 10px;
  }

  .notification-list {
    max-height: calc(100vh - 235px);
  }

  .notification-item {
    padding: 13px 15px;
  }

  .notification-information strong {
    font-size: 11px;
  }

  .notification-meta {
    font-size: 9px;
  }

  /* =========================
     모바일 하단 내비게이션
  ========================= */
  .mobile-bottom-navigation {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    height: 68px;
    padding-bottom: env(safe-area-inset-bottom);
    border-top: 1px solid #e6ebf1;
    background: #ffffff;
  }

  .mobile-bottom-navigation a {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 10px;
    color: #6b7582;
  }

  .mobile-bottom-navigation svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.7;
  }

  .mobile-bottom-navigation a.router-link-active {
    font-weight: 700;
    color: #2864ed;
  }

  .mobile-bottom-navigation a:first-child svg {
    fill: currentColor;
  }
}
</style>

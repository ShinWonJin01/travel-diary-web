<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isHomePage = computed(() => route.name === 'home')
const isTripsPage = computed(() => route.name === 'trips')

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
      <button class="notification-button" type="button" aria-label="알림">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>

        <span class="notification-dot"></span>
      </button>

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

    <!-- 홈: 알림 -->
    <button v-if="isHomePage" class="mobile-notification" type="button" aria-label="알림">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>

      <span></span>
    </button>

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

    <!-- 오른쪽 버튼이 없는 화면 -->
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

/* =========================
   알림 버튼
========================= */
.notification-button,
.mobile-notification {
  position: relative;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
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

.notification-dot {
  position: absolute;
  top: -2px;
  right: -3px;
  width: 7px;
  height: 7px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: #ff3d56;
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

  /* 왼쪽 버튼 / 가운데 제목 / 오른쪽 버튼 */
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

  /* 삼단바, 뒤로가기, 추가 버튼 공통 */
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

  /* 왼쪽 버튼은 왼쪽 정렬 */
  .mobile-header > .mobile-header-button:first-child {
    justify-self: start;
  }

  /* 오른쪽 버튼은 오른쪽 정렬 */
  .mobile-header > .mobile-header-button:last-child {
    justify-self: end;
  }

  /* 버튼이 없는 자리를 채워 제목을 가운데로 유지 */
  .mobile-header-side {
    display: block;
    width: 24px;
    height: 24px;
    justify-self: end;
  }

  .mobile-notification {
    justify-self: end;
  }

  .mobile-notification svg {
    width: 20px;
    height: 20px;
  }

  .mobile-notification span {
    position: absolute;
    top: -1px;
    right: -2px;
    width: 6px;
    height: 6px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: #ff4158;
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

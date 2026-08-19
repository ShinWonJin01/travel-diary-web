<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="mobile-bottom-navigation">
    <RouterLink to="/">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />
      </svg>

      <span>홈</span>
    </RouterLink>

    <RouterLink to="/trips">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M4 6h16v14H4zM8 6V4h8v2" />
      </svg>

      <span>여행 기록</span>
    </RouterLink>

    <RouterLink to="/invitations">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="9"
          cy="8"
          r="3"
        />
        <circle
          cx="17"
          cy="9"
          r="2"
        />
        <path d="M3 20c0-4 2-6 6-6s6 2 6 6M15 15c4 0 6 2 6 5" />
      </svg>

      <span>초대 관리</span>
    </RouterLink>

    <RouterLink to="/mypage">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="8"
          r="4"
        />
        <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
      </svg>

      <span>마이페이지</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-bottom-navigation {
  display: none;
}

@media (max-width: 760px) {
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
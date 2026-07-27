<script setup lang="ts">
import { computed } from 'vue'
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

const route = useRoute()
const router = useRouter()

const tripTitle = '도쿄 여행'
const tripPeriod = '2024.04.10 - 04.14'
const participantCount = 3

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

  if (typeof tab === 'string' && validTabs.includes(tab as TripTab)) {
    return tab as TripTab
  }

  return 'overview'
})

const selectTab = (tab: TripTab) => {
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

const showMobilePhotoButton = computed(() =>
  ['overview', 'timeline', 'photos'].includes(activeTab.value),
)

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
    <!-- 모바일용 상단 여행 정보 -->
    <section class="mobile-trip-summary">
      <h1>{{ tripTitle }}</h1>
      <p>{{ tripPeriod }} · 참여자 {{ participantCount }}명</p>
    </section>

    <div class="detail-layout">
      <!-- PC 좌측 사이드 -->
      <aside class="detail-sidebar">
        <div class="sidebar-trip-info">
          <h1>{{ tripTitle }}</h1>
          <p>{{ tripPeriod }} · 참여자 {{ participantCount }}명</p>
        </div>

        <nav class="sidebar-tabs" aria-label="여행 상세 메뉴">
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

      <!-- 메인 -->
      <section class="detail-main">
        <!-- 모바일 가로 탭 -->
        <nav class="mobile-tabs" aria-label="여행 상세 메뉴">
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
        <div v-if="activeTab === 'overview'" class="overview-layout">
          <section class="map-card">
            <div class="map-canvas">
              <div class="map-grid"></div>

              <svg class="map-route" viewBox="0 0 500 700" aria-hidden="true">
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

          <section class="timeline-side-card">
            <div class="timeline-card-header">
              <h2>타임라인</h2>

              <button type="button" @click="goToTimelineTab">
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
                  <div class="timeline-time">{{ entry.time }}</div>

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

        <!-- 타임라인 -->
        <section v-else-if="activeTab === 'timeline'" class="panel-card">
          <div class="panel-heading">
            <h2>타임라인</h2>
          </div>

          <div class="timeline-group-list timeline-group-list-full">
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
                <div class="timeline-time">{{ entry.time }}</div>

                <div class="timeline-dot-line">
                  <span class="timeline-dot"></span>
                </div>

                <div class="timeline-entry-content timeline-entry-content-full">
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

        <!-- 사진 -->
        <section v-else-if="activeTab === 'photos'" class="panel-card">
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

        <!-- 지도 -->
        <section v-else-if="activeTab === 'map'" class="panel-card">
          <div class="panel-heading">
            <h2>지도</h2>
          </div>

          <div class="map-card map-card-large">
            <div class="map-canvas">
              <div class="map-grid"></div>

              <svg class="map-route" viewBox="0 0 500 700" aria-hidden="true">
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

        <!-- AI 여행기 -->
        <section v-else class="panel-card ai-panel">
          <div class="panel-heading">
            <h2>AI 여행기</h2>
          </div>

          <div class="ai-box">
            <div class="ai-badge">AI</div>

            <div class="ai-content">
              <strong>사진과 타임라인을 바탕으로 여행기를 생성해보세요.</strong>
              <p>
                사진, 장소, 시간, 메모를 종합하여 자연스러운 여행 기록을 자동으로 만들어줍니다.
              </p>

              <button type="button" class="primary-action-button">
                AI 여행기 만들기
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>

    <!-- 모바일 플로팅 버튼 -->
    <button
      v-if="showMobilePhotoButton"
      class="mobile-floating-button"
      type="button"
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

.mobile-trip-summary {
  display: none;
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

.sidebar-trip-info p {
  margin: 8px 0 0;
  font-size: 12px;
  color: #8f97a3;
}

.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-tabs button {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
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

.map-card-large {
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
    linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 20% 20%, rgba(123, 176, 232, 0.35), transparent 18%),
    radial-gradient(circle at 80% 70%, rgba(123, 176, 232, 0.28), transparent 18%),
    linear-gradient(135deg, #f1ebdd, #e6dece);
  background-size: 32px 32px, 32px 32px, auto, auto, auto;
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

.timeline-group .timeline-row:last-child .timeline-dot-line::after {
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
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.timeline-entry-content strong {
  display: block;
  min-width: 0;
  font-size: 13px;
  color: #262d38;
}

.timeline-entry-content-full {
  align-items: center;
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

.panel-card {
  padding: 18px;
}

.timeline-group-list-full {
  gap: 28px;
}

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
  background: linear-gradient(transparent, rgba(19, 27, 39, 0.7));
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

.ai-panel {
  padding-bottom: 22px;
}

.ai-box {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
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

.mobile-floating-button {
  display: none;
}

@media (max-width: 760px) {
  .trip-detail-page {
    padding: 0 0 94px;
  }

  .mobile-trip-summary {
    display: block;
    padding: 14px 17px 0;
  }

  .mobile-trip-summary h1 {
    margin: 0;
    font-size: 20px;
    color: #232934;
  }

  .mobile-trip-summary p {
    margin: 7px 0 0;
    font-size: 11px;
    color: #8f97a3;
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
    padding-top: 12px;
  }

  .mobile-tabs {
    display: flex;
    gap: 18px;
    overflow-x: auto;
    padding: 0 17px;
    border-bottom: 1px solid #e6eaf2;
    background: #ffffff;
    scrollbar-width: none;
  }

  .mobile-tabs::-webkit-scrollbar {
    display: none;
  }

  .mobile-tabs button {
    position: relative;
    flex: 0 0 auto;
    height: 42px;
    padding: 0;
    border: 0;
    font-size: 11px;
    font-weight: 600;
    color: #87909d;
    background: transparent;
    white-space: nowrap;
  }

  .mobile-tabs button.active {
    color: #3466f3;
  }

  .mobile-tabs button.active::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: #3466f3;
    content: '';
  }

  .overview-layout {
    display: block;
    padding: 14px 17px 0;
  }

  .map-card,
  .timeline-side-card,
  .panel-card {
    border-radius: 12px;
  }

  .map-card {
    padding: 10px;
  }

  .map-canvas {
    height: 260px;
    border-radius: 10px;
  }

  .pin-1 {
    top: 36px;
    left: 48px;
  }

  .pin-2 {
    top: 78px;
    left: 130px;
  }

  .pin-3 {
    top: 118px;
    left: 165px;
  }

  .pin-4 {
    top: 170px;
    left: 132px;
  }

  .pin-5 {
    top: 220px;
    left: 106px;
  }

  .timeline-side-card {
    margin-top: 14px;
    padding: 16px 14px;
  }

  .timeline-card-header,
  .panel-heading {
    margin-bottom: 14px;
  }

  .timeline-card-header h2,
  .panel-heading h2 {
    font-size: 16px;
  }

  .timeline-card-header button {
    font-size: 11px;
  }

  .timeline-group h3 {
    font-size: 13px;
  }

  .timeline-row {
    grid-template-columns: 46px 14px minmax(0, 1fr);
  }

  .timeline-time {
    font-size: 10px;
  }

  .timeline-thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .timeline-entry-content strong {
    font-size: 12px;
  }

  .panel-card {
    margin: 14px 17px 0;
    padding: 16px 14px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .photo-card {
    min-height: 140px;
    border-radius: 10px;
  }

  .photo-overlay strong {
    font-size: 12px;
  }

  .photo-overlay span {
    font-size: 9px;
  }

  .ai-box {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .ai-badge {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    font-size: 22px;
  }

  .ai-content strong {
    font-size: 16px;
  }

  .ai-content p {
    font-size: 12px;
  }

  .mobile-floating-button {
    position: fixed;
    right: 17px;
    bottom: 84px;
    z-index: 30;
    display: inline-flex;
    height: 46px;
    align-items: center;
    justify-content: center;
    padding: 0 18px;
    border: 0;
    border-radius: 23px;
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    background: #3160ee;
    box-shadow: 0 10px 24px rgba(49, 96, 238, 0.3);
    cursor: pointer;
  }
}
</style>
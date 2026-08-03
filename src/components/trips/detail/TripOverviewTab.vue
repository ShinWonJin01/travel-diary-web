<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Participant {
  id: number
  nickname: string
  profileImageUrl: string | null
  avatarClass: string
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

defineProps<{
  tripTitle: string
  tripDestination: string
  tripPeriod: string
  tripDuration: string
  tripDescription: string
  ownerNickname: string
  coverImageUrl: string
  participantCount: number
  visibleParticipants: Participant[]
  remainingParticipantCount: number
  timelineGroups: TimelineGroup[]
  isOwner: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  leave: []
  'open-participants': []
  'add-photo': []
  timeline: []
  'cover-error': []
}>()

const isTripMenuOpen = ref(false)

const openTripMenu = () => {
  isTripMenuOpen.value = !isTripMenuOpen.value
}

const closeTripMenu = () => {
  isTripMenuOpen.value = false
}

const handleEdit = () => {
  closeTripMenu()
  emit('edit')
}

const handleDelete = () => {
  closeTripMenu()
  emit('delete')
}

const handleLeave = () => {
  closeTripMenu()
  emit('leave')
}

const closeTripMenuOnOutsideClick = (event: MouseEvent) => {
  if (!isTripMenuOpen.value) return

  const target = event.target

  if (!(target instanceof Element)) return

  if (target.closest('.trip-more-wrapper')) return

  closeTripMenu()
}

onMounted(() => {
  document.addEventListener('click', closeTripMenuOnOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeTripMenuOnOutsideClick)
})
</script>

<template>
  <div class="overview-layout">
    <!-- 여행 기본 정보 -->
    <section class="trip-info-card">
      <div class="trip-info-top">
        <div
          class="trip-cover-preview"
          :class="{ 'trip-cover-preview-empty': !coverImageUrl }"
        >
          <img
            v-if="coverImageUrl"
            :src="coverImageUrl"
            :alt="`${tripTitle} 대표 이미지`"
            @error="emit('cover-error')"
          />

          <svg
            v-else
            viewBox="0 0 64 52"
            aria-hidden="true"
          >
            <path d="M4 48 22 26l10 12 9-11 19 21z" />
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
            @click="handleEdit"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16z" />
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
                @click="handleDelete"
              >
                여행 삭제
              </button>

              <button
                v-else
                type="button"
                role="menuitem"
                @click="handleLeave"
              >
                여행 나가기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="trip-info-bottom">
        <div class="trip-info-meta">
          <div class="trip-info-item">
            <span>여행 기간</span>
            <strong>{{ tripDuration }}</strong>
          </div>

          <div class="trip-info-divider"></div>

          <div class="trip-info-item">
            <span>여행 생성자</span>
            <strong>{{ ownerNickname }}</strong>
          </div>

          <div class="trip-info-divider desktop-participant-divider"></div>

          <div class="desktop-participant-item">
            <span class="desktop-participant-label">
              참여자
            </span>

            <button
              class="desktop-participant-summary"
              type="button"
              @click="emit('open-participants')"
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
                  class="participant-avatar remaining-avatar"
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
            @click="emit('open-participants')"
          >
            + 초대
          </button>

          <button
            class="desktop-photo-button"
            type="button"
            @click="emit('add-photo')"
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
        @click="emit('open-participants')"
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
        @click="emit('open-participants')"
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
          @click="emit('timeline')"
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
</template>

<style scoped>
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

/* =========================
   지도
========================= */
.map-card,
.timeline-side-card {
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

.timeline-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.timeline-card-header h2 {
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

@media (max-width: 760px) {
  .overview-layout {
    display: block;
    padding: 10px 10px 0;
  }

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

  .trip-info-card {
    margin-bottom: 10px;
    padding: 12px;
    border-radius: 10px;
  }

  .trip-info-top {
    grid-template-columns: 76px minmax(0, 1fr) auto;
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
  .timeline-side-card {
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

  .timeline-side-card {
    margin-top: 10px;
    padding: 12px 11px;
  }

  .timeline-card-header {
    margin-bottom: 10px;
  }

  .timeline-card-header h2 {
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

  .timeline-thumbnail {
    width: 34px;
    height: 34px;
    border-radius: 6px;
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
<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import type { Participant } from '@/composables/trips/useTripParticipants'

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
  isOwner: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  leave: []
  'open-participants': []
  'add-photo': []
  'cover-error': []
}>()

const isTripMenuOpen = ref(false)

const toggleTripMenu = () => {
  isTripMenuOpen.value =
    !isTripMenuOpen.value
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

const handleOutsideClick = (
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
    handleOutsideClick,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleOutsideClick,
  )
})
</script>

<template>
  <section class="trip-info-card">
    <div class="trip-info-top">
      <div
        class="trip-cover-preview"
        :class="{
          'trip-cover-preview-empty': !coverImageUrl,
        }"
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
            @click="toggleTripMenu"
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

        <div
          class="trip-info-divider desktop-participant-divider"
        ></div>

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
</template>

<style scoped>
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

.trip-description {
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

@media (max-width: 760px) {
  .desktop-participant-item,
  .desktop-participant-divider,
  .trip-info-actions {
    display: none;
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

  .trip-edit-button span {
    display: none;
  }

  .trip-edit-button svg {
    width: 13px;
    height: 13px;
  }

  .trip-more-button {
    width: 29px;
    height: 29px;
  }

  .trip-info-main h2 {
    font-size: 13px;
  }

  .trip-info-main p {
    margin-top: 5px;
    font-size: 9px;
  }

  .trip-description {
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
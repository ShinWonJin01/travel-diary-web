<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { apiBlobRequest } from '@/api/http'
import { type TripListItem, type TripRole } from '@/api/trips'

const props = defineProps<{
  trip: TripListItem
}>()

const router = useRouter()
const coverImageUrl = ref('')

const thumbnailClasses = [
  'thumbnail-tokyo',
  'thumbnail-jeju',
  'thumbnail-busan',
]

const getRoleLabel = (role: TripRole) =>
  role === 'OWNER' ? '내가 만든 여행' : '참여 중'

const formatDate = (date: string) => date.replaceAll('-', '.')

const formatPeriod = (trip: TripListItem) => {
  const startDate = formatDate(trip.startDate)

  if (!trip.endDate) return `${startDate} - 종료일 미정`

  return `${startDate} - ${formatDate(trip.endDate)}`
}

const getThumbnailClass = (tripId: number) => {
  const index = Math.abs(tripId - 1) % thumbnailClasses.length
  return thumbnailClasses[index]
}

const revokeCoverImageUrl = () => {
  if (coverImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(coverImageUrl.value)
  }

  coverImageUrl.value = ''
}

const loadCoverImage = async () => {
  revokeCoverImageUrl()

  const coverImagePath = props.trip.coverImagePath
  if (!coverImagePath) return

  if (
    coverImagePath.startsWith('http://') ||
    coverImagePath.startsWith('https://')
  ) {
    coverImageUrl.value = coverImagePath
    return
  }

  try {
    const blob = await apiBlobRequest(
      `/api/trips/${props.trip.id}/cover-image/file`,
    )

    coverImageUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('대표 이미지를 불러오지 못했습니다.', error)
  }
}

const goToTripDetail = (tripId: number) => {
  void router.push({
    name: 'trip-detail',
    params: { id: tripId },
  })
}

watch(
  [() => props.trip.id, () => props.trip.coverImagePath],
  () => {
    void loadCoverImage()
  },
  { immediate: true },
)

onBeforeUnmount(revokeCoverImageUrl)
</script>

<template>
  <article
    class="trip-list-item"
    tabindex="0"
    role="link"
    @click="goToTripDetail(trip.id)"
    @keydown.enter="goToTripDetail(trip.id)"
    @keydown.space.prevent="goToTripDetail(trip.id)"
  >
    <div class="trip-thumbnail" :class="getThumbnailClass(trip.id)">
      <img
        v-if="trip.coverImagePath && coverImageUrl"
        :src="coverImageUrl"
        :alt="`${trip.title} 대표 이미지`"
      />

      <template v-else>
        <span class="mountain mountain-back"></span>
        <span class="mountain mountain-front"></span>
        <span class="thumbnail-sun"></span>
      </template>
    </div>

    <div class="trip-information">
      <div class="trip-title-row">
        <h2>{{ trip.title }}</h2>

        <span
          class="trip-role-badge"
          :class="{
            owner: trip.role === 'OWNER',
            participant: trip.role === 'MEMBER',
          }"
        >
          {{ getRoleLabel(trip.role) }}
        </span>
      </div>

      <p class="trip-destination">{{ trip.destination }}</p>
      <p class="trip-period">{{ formatPeriod(trip) }}</p>
      <p class="trip-participants">
        참여자 {{ trip.participantCount }}명
      </p>
    </div>
  </article>
</template>

<style scoped>
.trip-list-item {
  position: relative;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  min-height: 150px;
  align-items: center;
  gap: 22px;
  padding: 20px 12px;
  border-bottom: 1px solid var(--tmr-border);
  border-radius: 12px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.trip-list-item:hover {
  background: var(--tmr-surface-soft);
}

.trip-list-item:active {
  transform: scale(0.995);
}

.trip-list-item:focus-visible {
  outline: 2px solid var(--tmr-primary);
  outline-offset: -2px;
}

.trip-list-item:last-child {
  border-bottom: 0;
}

.trip-thumbnail {
  position: relative;
  width: 132px;
  height: 100px;
  overflow: hidden;
  border-radius: 12px;
  background: #9dbcf3;
}

.trip-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-tokyo {
  background: linear-gradient(145deg, #91b6ff, #f0b8a8);
}

.thumbnail-jeju {
  background: linear-gradient(145deg, #8ed3bd, #c9df96);
}

.thumbnail-busan {
  background: linear-gradient(145deg, #78a7dc, #f2bd91);
}

.mountain {
  position: absolute;
  bottom: -23px;
  width: 100px;
  height: 80px;
  transform: rotate(45deg);
  border-radius: 8px;
}

.mountain-back {
  right: -20px;
  background: rgba(255, 255, 255, 0.28);
}

.mountain-front {
  bottom: -38px;
  left: -5px;
  width: 115px;
  height: 92px;
  background: rgba(255, 255, 255, 0.5);
}

.thumbnail-sun {
  position: absolute;
  top: 17px;
  right: 20px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}

.trip-information {
  min-width: 0;
}

.trip-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
}

.trip-title-row h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--tmr-text);
}

.trip-role-badge {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.trip-role-badge.owner {
  color: var(--tmr-primary-dark);
  background: var(--tmr-surface-soft);
}

.trip-role-badge.participant {
  color: #2f8068;
  background: #e9f7f2;
}

.trip-destination {
  margin: 9px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--tmr-text);
}

.trip-period {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--tmr-text-sub);
}

.trip-participants {
  margin: 7px 0 0;
  font-size: 12px;
  color: var(--tmr-text-sub);
}

@media (max-width: 760px) {
  .trip-list-item {
    grid-template-columns: 92px minmax(0, 1fr);
    min-height: 112px;
    gap: 13px;
    padding: 14px 0;
    border-radius: 0;
  }

  .trip-list-item:hover {
    background: transparent;
  }

  .trip-thumbnail {
    width: 92px;
    height: 74px;
    border-radius: 9px;
  }

  .mountain {
    width: 70px;
    height: 60px;
  }

  .mountain-front {
    width: 82px;
    height: 65px;
  }

  .thumbnail-sun {
    top: 12px;
    right: 13px;
    width: 12px;
    height: 12px;
  }

  .trip-title-row {
    align-items: flex-start;
    gap: 5px;
  }

  .trip-title-row h2 {
    font-size: 13px;
  }

  .trip-role-badge {
    min-height: 19px;
    padding: 0 6px;
    font-size: 8px;
  }

  .trip-destination {
    margin-top: 6px;
    font-size: 10px;
  }

  .trip-period {
    margin-top: 4px;
    font-size: 10px;
  }

  .trip-participants {
    margin-top: 5px;
    font-size: 9px;
  }
}
</style>
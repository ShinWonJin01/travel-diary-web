<script setup lang="ts">
import { useRouter } from 'vue-router'

import {
  type TripListItem,
  type TripRole,
} from '@/api/trips'

defineProps<{
  trip: TripListItem
}>()

const router = useRouter()

const backendBaseUrl = (() => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined

  if (!configuredUrl || configuredUrl.startsWith('/')) {
    return `${window.location.protocol}//${window.location.hostname}:8080`
  }

  return configuredUrl
    .replace(/\/api\/?$/, '')
    .replace(/\/$/, '')
})()

const thumbnailClasses = [
  'thumbnail-tokyo',
  'thumbnail-jeju',
  'thumbnail-busan',
]

const getRoleLabel = (role: TripRole) => {
  return role === 'OWNER'
    ? '내가 만든 여행'
    : '참여 중'
}

const formatDate = (date: string) => {
  return date.replaceAll('-', '.')
}

const formatPeriod = (trip: TripListItem) => {
  const startDate = formatDate(trip.startDate)

  if (!trip.endDate) {
    return `${startDate} - 종료일 미정`
  }

  const endDate = formatDate(trip.endDate)

  return `${startDate} - ${endDate}`
}

const getThumbnailClass = (tripId: number) => {
  const index =
    Math.abs(tripId - 1)
    % thumbnailClasses.length

  return thumbnailClasses[index]
}

const getCoverImageUrl = (coverImagePath: string) => {
  if (
    coverImagePath.startsWith('http://')
    || coverImagePath.startsWith('https://')
  ) {
    return coverImagePath
  }

  const cleanedPath = coverImagePath.replaceAll('\\', '/')

  const normalizedPath =
    cleanedPath.startsWith('/')
      ? cleanedPath
      : `/${cleanedPath}`

  return `${backendBaseUrl}${normalizedPath}`
}

const goToTripDetail = (tripId: number) => {
  void router.push({
    name: 'trip-detail',
    params: {
      id: tripId,
    },
  })
}
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
    <div
      class="trip-thumbnail"
      :class="getThumbnailClass(trip.id)"
    >
      <img
        v-if="trip.coverImagePath"
        :src="getCoverImageUrl(trip.coverImagePath)"
        :alt="`${trip.title} 대표 이미지`"
      />

      <template v-else>
        <span
          class="mountain mountain-back"
        ></span>

        <span
          class="mountain mountain-front"
        ></span>

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

      <p class="trip-destination">
        {{ trip.destination }}
      </p>

      <p class="trip-period">
        {{ formatPeriod(trip) }}
      </p>

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
  align-items: center;
  gap: 22px;
  min-height: 150px;
  padding: 20px 8px;
  border-bottom: 1px solid #e8ebf0;
  cursor: pointer;
}

.trip-list-item:hover {
  background: #fafbfe;
}

.trip-list-item:focus-visible {
  outline: 2px solid #3264ed;
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
  border-radius: 10px;
  background: #aac3da;
}

.trip-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-tokyo {
  background: linear-gradient(
    145deg,
    #9db6d0 0%,
    #d7c0b2 100%
  );
}

.thumbnail-jeju {
  background: linear-gradient(
    145deg,
    #82b8a5 0%,
    #c8d892 100%
  );
}

.thumbnail-busan {
  background: linear-gradient(
    145deg,
    #7090b7 0%,
    #d4b48d 100%
  );
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
  background: rgba(255, 255, 255, 0.8);
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
  color: #242a34;
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
  color: #315ce8;
  background: #edf1ff;
}

.trip-role-badge.participant {
  color: #28745c;
  background: #e8f7f1;
}

.trip-destination {
  margin: 9px 0 0;
  font-size: 13px;
  color: #555f6d;
}

.trip-period {
  margin: 6px 0 0;
  font-size: 13px;
  color: #707986;
}

.trip-participants {
  margin: 7px 0 0;
  font-size: 12px;
  color: #9ba2ac;
}

@media (max-width: 760px) {
  .trip-list-item {
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 13px;
    min-height: 112px;
    padding: 14px 0;
  }

  .trip-thumbnail {
    width: 92px;
    height: 74px;
    border-radius: 8px;
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
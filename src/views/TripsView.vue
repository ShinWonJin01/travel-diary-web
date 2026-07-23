<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type TripFilter = 'all' | 'owned' | 'participating'
type TripRole = 'owner' | 'participant'

interface Trip {
  id: number
  title: string
  period: string
  participants: number
  role: TripRole
  thumbnailClass: string
}

const route = useRoute()
const router = useRouter()

const getFilterFromQuery = (): TripFilter => {
  const filter = route.query.filter

  if (filter === 'owned' || filter === 'participating') {
    return filter
  }

  return 'all'
}

const activeFilter = ref<TripFilter>(getFilterFromQuery())

const trips: Trip[] = [
  {
    id: 1,
    title: '도쿄 여행',
    period: '2024.04.10 - 04.14',
    participants: 3,
    role: 'owner',
    thumbnailClass: 'thumbnail-tokyo',
  },
  {
    id: 2,
    title: '제주도 가족여행',
    period: '2024.03.20 - 03.23',
    participants: 4,
    role: 'participant',
    thumbnailClass: 'thumbnail-jeju',
  },
  {
    id: 3,
    title: '부산 1박2일',
    period: '2024.02.18 - 02.19',
    participants: 2,
    role: 'owner',
    thumbnailClass: 'thumbnail-busan',
  },
]

const filteredTrips = computed(() => {
  if (activeFilter.value === 'owned') {
    return trips.filter((trip) => trip.role === 'owner')
  }

  if (activeFilter.value === 'participating') {
    return trips.filter((trip) => trip.role === 'participant')
  }

  return trips
})

const changeFilter = (filter: TripFilter) => {
  activeFilter.value = filter

  void router.replace({
    query: {
      ...route.query,
      filter: filter === 'all' ? undefined : filter,
    },
  })
}

const getRoleLabel = (role: TripRole) => {
  return role === 'owner' ? '내가 만든 여행' : '참여 중'
}

watch(
  () => route.query.filter,
  () => {
    activeFilter.value = getFilterFromQuery()
  },
)
</script>

<template>
  <section class="trips-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <div>
        <p>TRAVEL RECORDS</p>
        <h1>여행 기록</h1>
      </div>

      <RouterLink class="desktop-create-button" to="/trips/create"> + 여행 만들기 </RouterLink>
    </div>

    <!-- 여행 필터 -->
    <div class="trip-filters">
      <button
        type="button"
        :class="{ active: activeFilter === 'all' }"
        :aria-pressed="activeFilter === 'all'"
        @click="changeFilter('all')"
      >
        전체
      </button>

      <button
        type="button"
        :class="{ active: activeFilter === 'owned' }"
        :aria-pressed="activeFilter === 'owned'"
        @click="changeFilter('owned')"
      >
        내가 만든 여행
      </button>

      <button
        type="button"
        :class="{ active: activeFilter === 'participating' }"
        :aria-pressed="activeFilter === 'participating'"
        @click="changeFilter('participating')"
      >
        참여 중
      </button>
    </div>

    <!-- 여행 목록 -->
    <div v-if="filteredTrips.length > 0" class="trip-list">
      <article v-for="trip in filteredTrips" :key="trip.id" class="trip-list-item">
        <div class="trip-thumbnail" :class="trip.thumbnailClass">
          <span class="mountain mountain-back"></span>
          <span class="mountain mountain-front"></span>
          <span class="thumbnail-sun"></span>
        </div>

        <div class="trip-information">
          <div class="trip-title-row">
            <h2>{{ trip.title }}</h2>

            <span
              class="trip-role-badge"
              :class="{
                owner: trip.role === 'owner',
                participant: trip.role === 'participant',
              }"
            >
              {{ getRoleLabel(trip.role) }}
            </span>
          </div>

          <p class="trip-period">
            {{ trip.period }}
          </p>

          <p class="trip-participants">참여자 {{ trip.participants }}명</p>
        </div>

        <button class="trip-more-button" type="button" aria-label="여행 메뉴 열기">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </article>
    </div>

    <!-- 여행이 없을 때 -->
    <div v-else class="empty-trips">
      <p>해당하는 여행이 없습니다.</p>

      <RouterLink v-if="activeFilter === 'owned'" class="empty-create-button" to="/trips/create">
        여행 만들기
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.trips-page {
  padding: 42px 48px 70px;
}

.desktop-page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 34px;
}

.desktop-page-heading p {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4566e8;
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: #1d2430;
}

.desktop-create-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
}

/* 여행 필터 */
.trip-filters {
  display: grid;
  grid-template-columns: repeat(3, 150px);
  border-bottom: 1px solid #e5e9ef;
}

.trip-filters button {
  position: relative;
  height: 48px;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  color: #9299a4;
  background: transparent;
  cursor: pointer;
}

.trip-filters button.active {
  color: #3264ed;
}

.trip-filters button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #3264ed;
  content: '';
}

/* 여행 목록 */
.trip-list {
  border-bottom: 1px solid #e8ebf0;
}

.trip-list-item {
  position: relative;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr) 36px;
  align-items: center;
  gap: 22px;
  min-height: 150px;
  padding: 20px 8px;
  border-bottom: 1px solid #e8ebf0;
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

.thumbnail-tokyo {
  background: linear-gradient(145deg, #9db6d0 0%, #d7c0b2 100%);
}

.thumbnail-jeju {
  background: linear-gradient(145deg, #82b8a5 0%, #c8d892 100%);
}

.thumbnail-busan {
  background: linear-gradient(145deg, #7090b7 0%, #d4b48d 100%);
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
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.trip-title-row h2 {
  margin: 0;
  font-size: 17px;
  color: #242a34;
}

.trip-role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
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

.trip-period {
  margin: 9px 0 0;
  font-size: 13px;
  color: #707986;
}

.trip-participants {
  margin: 7px 0 0;
  font-size: 12px;
  color: #9ba2ac;
}

.trip-more-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.trip-more-button span {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #9ba2ac;
}

/* 빈 목록 */
.empty-trips {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border-bottom: 1px solid #e8ebf0;
}

.empty-trips p {
  margin: 0;
  font-size: 14px;
  color: #8d95a0;
}

.empty-create-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 17px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
}

@media (max-width: 760px) {
  .trips-page {
    padding: 0 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .trip-filters {
    grid-template-columns: repeat(3, 1fr);
    margin: 0 -17px;
    padding: 0 17px;
  }

  .trip-filters button {
    height: 46px;
    font-size: 11px;
  }

  .trip-list {
    border-bottom: 0;
  }

  .trip-list-item {
    grid-template-columns: 92px minmax(0, 1fr) 24px;
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

  .trip-period {
    margin-top: 6px;
    font-size: 10px;
  }

  .trip-participants {
    margin-top: 5px;
    font-size: 9px;
  }

  .trip-more-button {
    padding: 6px;
  }

  .empty-trips {
    min-height: 220px;
  }

  .empty-trips p {
    font-size: 12px;
  }
}
</style>

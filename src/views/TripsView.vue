<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TripFilters from '@/components/trips/TripFilters.vue'
import TripListItemCard from '@/components/trips/TripListItem.vue'

import {
  getTrips,
  type TripListItem,
} from '@/api/trips'

type TripFilter = 'all' | 'owned' | 'participating'

const route = useRoute()
const router = useRouter()

const trips = ref<TripListItem[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const activeFilter = computed<TripFilter>(() => {
  const filter = route.query.filter

  if (filter === 'owned' || filter === 'participating') {
    return filter
  }

  return 'all'
})

const filteredTrips = computed(() => {
  if (activeFilter.value === 'owned') {
    return trips.value.filter((trip) => trip.role === 'OWNER')
  }

  if (activeFilter.value === 'participating') {
    return trips.value.filter((trip) => trip.role === 'MEMBER')
  }

  return trips.value
})

const loadTrips = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    trips.value = await getTrips()
  } catch (error) {
    console.error('여행 목록 조회 실패:', error)

    errorMessage.value =
      error instanceof Error
        ? error.message
        : '여행 목록을 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

const changeFilter = (filter: TripFilter) => {
  void router.replace({
    query: {
      ...route.query,
      filter: filter === 'all' ? undefined : filter,
    },
  })
}

onMounted(() => {
  void loadTrips()
})
</script>

<template>
  <section class="trips-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <div>
        <p>TRAVEL RECORDS</p>
        <h1>여행 기록</h1>
      </div>

      <RouterLink
        class="desktop-create-button"
        to="/trips/create"
      >
        + 여행 만들기
      </RouterLink>
    </div>

    <!-- 여행 필터 -->
    <TripFilters
      :active-filter="activeFilter"
      @change="changeFilter"
    />

    <!-- 로딩 중 -->
    <div
      v-if="isLoading"
      class="loading-state"
      aria-live="polite"
    >
      여행 목록을 불러오는 중입니다.
    </div>

    <!-- 조회 오류 -->
    <div
      v-else-if="errorMessage"
      class="error-state"
      role="alert"
    >
      <p>{{ errorMessage }}</p>

      <button
        type="button"
        @click="loadTrips"
      >
        다시 불러오기
      </button>
    </div>

    <!-- 여행 목록 -->
    <div
      v-else-if="filteredTrips.length > 0"
      class="trip-list"
    >
      <TripListItemCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :trip="trip"
      />
    </div>

    <!-- 여행이 없을 때 -->
    <div
      v-else
      class="empty-trips"
    >
      <p>해당하는 여행이 없습니다.</p>

      <RouterLink
        v-if="activeFilter !== 'participating'"
        class="empty-create-button"
        to="/trips/create"
      >
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
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  background: #405bf4;
}

/* 여행 목록 */
.trip-list {
  border-bottom: 1px solid #e8ebf0;
}

/* 로딩 및 오류 */
.loading-state,
.error-state {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border-bottom: 1px solid #e8ebf0;
  font-size: 14px;
  color: #8d95a0;
}

.error-state p {
  margin: 0;
}

.error-state button {
  height: 38px;
  padding: 0 17px;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
  cursor: pointer;
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
  height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0 17px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  background: #405bf4;
}

/* 모바일 */
@media (max-width: 760px) {
  .trips-page {
    padding: 0 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .trip-list {
    border-bottom: 0;
  }

  .loading-state,
  .error-state,
  .empty-trips {
    min-height: 220px;
  }

  .loading-state,
  .error-state {
    font-size: 12px;
  }

  .empty-trips p {
    font-size: 12px;
  }
}
</style>
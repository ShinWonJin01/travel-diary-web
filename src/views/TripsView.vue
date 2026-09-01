<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { getTrips, type TripListItem } from '@/api/trips'
import TripFilters from '@/components/trips/TripFilters.vue'
import TripListItemCard from '@/components/trips/TripListItem.vue'

type TripFilter = 'all' | 'owned' | 'participating'

const route = useRoute()
const router = useRouter()

const trips = ref<TripListItem[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const activeFilter = computed<TripFilter>(() => {
  const filter = route.query.filter

  return filter === 'owned' || filter === 'participating' ? filter : 'all'
})

const filteredTrips = computed(() => {
  switch (activeFilter.value) {
    case 'owned':
      return trips.value.filter((trip) => trip.role === 'OWNER')
    case 'participating':
      return trips.value.filter((trip) => trip.role === 'MEMBER')
    default:
      return trips.value
  }
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
    <div class="desktop-page-heading">
      <div>
        <p>TRAVEL RECORDS</p>
        <h1>여행 기록</h1>
      </div>

      <RouterLink class="desktop-create-button" to="/trips/create">
        <span>+</span>
        여행 만들기
      </RouterLink>
    </div>

    <TripFilters
      :active-filter="activeFilter"
      @change="changeFilter"
    />

    <div v-if="isLoading" class="loading-state" aria-live="polite">
      <div class="state-icon loading-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
        </svg>
      </div>
      <p>여행 목록을 불러오는 중입니다.</p>
    </div>

    <div v-else-if="errorMessage" class="error-state" role="alert">
      <div class="state-icon error-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5M12 16.5v.5" />
        </svg>
      </div>

      <p>{{ errorMessage }}</p>
      <button type="button" @click="loadTrips">다시 불러오기</button>
    </div>

    <div v-else-if="filteredTrips.length > 0" class="trip-list">
      <TripListItemCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :trip="trip"
      />
    </div>

    <div v-else class="empty-trips">
      <div class="state-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.5 7V5.8C8.5 4.8 9.3 4 10.3 4h3.4c1 0 1.8.8 1.8 1.8V7" />
          <rect x="4" y="7" width="16" height="12" rx="2.5" />
          <path d="M4 11h16M9 11v2M15 11v2" />
        </svg>
      </div>

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
  color: var(--tmr-primary);
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: var(--tmr-text);
}

.desktop-create-button,
.empty-create-button,
.error-state button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  font-weight: 700;
  color: var(--tmr-surface);
  background: var(--tmr-primary);
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.desktop-create-button {
  height: 44px;
  gap: 7px;
  padding: 0 22px;
  border-radius: 10px;
  font-size: 14px;
}

.desktop-create-button span {
  font-size: 19px;
  font-weight: 400;
  line-height: 1;
}

.desktop-create-button:hover,
.empty-create-button:hover,
.error-state button:hover {
  background: var(--tmr-primary-dark);
}

.desktop-create-button:active,
.empty-create-button:active,
.error-state button:active {
  transform: scale(0.98);
}

.trip-list {
  border-bottom: 1px solid var(--tmr-border);
}

.loading-state,
.error-state,
.empty-trips {
  display: flex;
  min-height: 260px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.loading-state p,
.error-state p,
.empty-trips p {
  margin: 0;
  font-size: 13px;
}

.state-icon {
  display: flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface);
}

.state-icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.loading-icon svg {
  animation: loading-spin 1s linear infinite;
  stroke-dasharray: 35 15;
}

.error-icon {
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.error-state button,
.empty-create-button {
  height: 38px;
  padding: 0 17px;
  border-radius: 8px;
  font-size: 12px;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

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
    border: 0;
    border-radius: 12px;
    background: var(--tmr-surface);
  }

  .loading-state p,
  .error-state p,
  .empty-trips p {
    font-size: 12px;
  }

  .state-icon {
    background: var(--tmr-surface-soft);
  }

  .error-icon {
    background: var(--tmr-accent-soft);
  }
}
</style>
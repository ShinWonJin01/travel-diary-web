<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface RecentTrip {
  id: number
  title: string
  period: string
  theme: string
  coverImageUrl: string
}

defineProps<{
  trips: RecentTrip[]
}>()
</script>

<template>
  <section class="recent-trip-section">
    <div class="section-heading">
      <h1>최근 여행</h1>

      <RouterLink
        :to="{
          path: '/trips',
          query: { filter: 'all' },
        }"
      >
        더보기
        <span>›</span>
      </RouterLink>
    </div>

    <div class="recent-trip-content">
      <div v-if="trips.length > 0" class="recent-trip-list">
        <RouterLink
          v-for="trip in trips"
          :key="trip.id"
          class="recent-trip-card"
          :to="`/trips/${trip.id}`"
        >
          <div
            class="recent-trip-image"
            :class="{ [trip.theme]: !trip.coverImageUrl }"
          >
            <img
              v-if="trip.coverImageUrl"
              :src="trip.coverImageUrl"
              :alt="`${trip.title} 대표 이미지`"
            />

            <svg v-else viewBox="0 0 64 52" aria-hidden="true">
              <path d="M4 48 22 26l10 12 9-11 19 21z" />
              <circle cx="45" cy="14" r="7" />
            </svg>
          </div>

          <div class="recent-trip-information">
            <h2>{{ trip.title }}</h2>
            <p>{{ trip.period }}</p>
          </div>
        </RouterLink>
      </div>

      <div v-else class="recent-trip-empty">
        <div class="recent-trip-empty-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8.5 7V5.8C8.5 4.8 9.3 4 10.3 4h3.4c1 0 1.8.8 1.8 1.8V7" />
            <rect x="4" y="7" width="16" height="12" rx="2.5" />
            <path d="M4 11h16M9 11v2M15 11v2" />
          </svg>
        </div>

        <p>아직 등록된 여행이 없습니다.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-heading h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: var(--tmr-text);
}

.section-heading a {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--tmr-primary);
}

.section-heading a:hover {
  color: var(--tmr-primary-dark);
}

.section-heading a span {
  font-size: 20px;
  line-height: 1;
}

.recent-trip-content {
  padding: 24px 28px 22px;
  border: 1px solid var(--tmr-border);
  border-radius: 22px;
  background: var(--tmr-surface-soft);
}

.recent-trip-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.recent-trip-card {
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
  box-shadow: 0 3px 0 var(--tmr-border);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.recent-trip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 16px rgba(49, 95, 217, 0.12);
}

.recent-trip-image {
  display: flex;
  height: 126px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.recent-trip-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-trip-image svg {
  width: 58px;
  fill: var(--tmr-surface);
  opacity: 0.9;
}

.trip-theme-blue {
  background: linear-gradient(145deg, #91b6ff, #5d86e8);
}

.trip-theme-green {
  background: linear-gradient(145deg, #9bd8c7, #63ad9a);
}

.trip-theme-purple {
  background: linear-gradient(145deg, #b5acf1, #8275d1);
}

.trip-theme-sky {
  background: linear-gradient(145deg, #a5dcf3, #6db6d6);
}

.recent-trip-information {
  padding: 13px 11px 12px;
}

.recent-trip-information h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--tmr-text);
}

.recent-trip-information p {
  margin: 7px 0 0;
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.recent-trip-empty {
  display: flex;
  min-height: 130px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.recent-trip-empty-icon {
  display: flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface);
}

.recent-trip-empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.recent-trip-empty p {
  margin: 0;
  font-size: 11px;
  color: var(--tmr-text-sub);
}

@media (max-width: 900px) {
  .recent-trip-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .recent-trip-card:last-child {
    display: none;
  }
}

@media (max-width: 760px) {
  .section-heading {
    margin-bottom: 14px;
  }

  .section-heading h1 {
    font-size: 15px;
  }

  .section-heading a {
    font-size: 11px;
  }

  .section-heading a span {
    font-size: 16px;
  }

  .recent-trip-content {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .recent-trip-list {
    display: flex;
    gap: 9px;
    overflow-x: auto;
    padding-bottom: 4px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .recent-trip-list::-webkit-scrollbar {
    display: none;
  }

  .recent-trip-card {
    flex: 0 0 132px;
    border-radius: 10px;
    box-shadow: none;
    scroll-snap-align: start;
  }

  .recent-trip-card:last-child {
    display: block;
  }

  .recent-trip-image {
    height: 86px;
  }

  .recent-trip-image svg {
    width: 39px;
  }

  .recent-trip-information {
    padding: 8px 8px 7px;
  }

  .recent-trip-information h2 {
    font-size: 11px;
  }

  .recent-trip-information p {
    margin-top: 4px;
    font-size: 8px;
  }

  .recent-trip-empty {
    min-height: 110px;
    border: 1px solid var(--tmr-border);
    border-radius: 12px;
    background: var(--tmr-surface-soft);
  }

  .recent-trip-empty-icon {
    width: 36px;
    height: 36px;
    margin-bottom: 8px;
  }

  .recent-trip-empty-icon svg {
    width: 18px;
    height: 18px;
  }

  .recent-trip-empty p {
    font-size: 10px;
  }
}
</style>
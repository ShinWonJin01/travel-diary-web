<script setup lang="ts">
import { RouterLink } from 'vue-router'

interface RecentTrip {
  id: number
  title: string
  period: string
  theme: string
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
          query: {
            filter: 'all',
          },
        }"
      >
        더보기
        <span>›</span>
      </RouterLink>
    </div>

    <div class="recent-trip-list">
      <RouterLink
        v-for="trip in trips"
        :key="trip.id"
        class="recent-trip-card"
        :to="`/trips/${trip.id}`"
      >
        <div
          class="recent-trip-image"
          :class="trip.theme"
        >
          <svg
            viewBox="0 0 64 52"
            aria-hidden="true"
          >
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
  color: #171c24;
}

.section-heading a {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: #3f63f0;
}

.section-heading a span {
  font-size: 20px;
  line-height: 1;
}

/* 최근 여행 */
.recent-trip-section {
  padding: 24px 28px 22px;
  border-radius: 22px;
  background: #f6fafc;
}

.recent-trip-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.recent-trip-card {
  overflow: hidden;
  border-radius: 14px 14px 0 0;
  background: #ffffff;
  box-shadow: 0 3px 0 #c9d0d7;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.recent-trip-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(47, 69, 96, 0.13);
}

.recent-trip-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 126px;
}

.recent-trip-image svg {
  width: 58px;
  fill: #ffffff;
  opacity: 0.9;
}

.trip-theme-blue {
  background: linear-gradient(145deg, #9eb8d3, #7897b9);
}

.trip-theme-green {
  background: linear-gradient(145deg, #abcbbd, #6b9c8b);
}

.trip-theme-purple {
  background: linear-gradient(145deg, #a8a5cc, #7778ab);
}

.trip-theme-sky {
  background: linear-gradient(145deg, #acd5e8, #6eafca);
}

.recent-trip-information {
  padding: 13px 11px 12px;
}

.recent-trip-information h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #252a33;
}

.recent-trip-information p {
  margin: 7px 0 0;
  font-size: 10px;
  color: #808894;
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

  .recent-trip-section {
    padding: 0;
    border-radius: 0;
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
    border-radius: 8px;
    box-shadow: none;
    scroll-snap-align: start;
  }

  .recent-trip-card:last-child {
    display: block;
  }

  .recent-trip-image {
    height: 86px;
    border-radius: 8px;
  }

  .recent-trip-image svg {
    width: 39px;
  }

  .recent-trip-information {
    padding: 8px 1px 3px;
  }

  .recent-trip-information h2 {
    font-size: 11px;
  }

  .recent-trip-information p {
    margin-top: 4px;
    font-size: 8px;
  }
}
</style>
<script setup lang="ts">
type TripFilter =
  | 'all'
  | 'owned'
  | 'participating'

defineProps<{
  activeFilter: TripFilter
}>()

const emit = defineEmits<{
  change: [filter: TripFilter]
}>()

const handleFilterClick = (filter: TripFilter) => {
  emit('change', filter)
}
</script>

<template>
  <div class="trip-filters">
    <button
      type="button"
      :class="{ active: activeFilter === 'all' }"
      :aria-pressed="activeFilter === 'all'"
      @click="handleFilterClick('all')"
    >
      전체
    </button>

    <button
      type="button"
      :class="{ active: activeFilter === 'owned' }"
      :aria-pressed="activeFilter === 'owned'"
      @click="handleFilterClick('owned')"
    >
      내가 만든 여행
    </button>

    <button
      type="button"
      :class="{ active: activeFilter === 'participating' }"
      :aria-pressed="activeFilter === 'participating'"
      @click="handleFilterClick('participating')"
    >
      참여 중
    </button>
  </div>
</template>

<style scoped>
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

@media (max-width: 760px) {
  .trip-filters {
    grid-template-columns: repeat(3, 1fr);
    margin: 0 -17px;
    padding: 0 17px;
  }

  .trip-filters button {
    height: 46px;
    font-size: 11px;
  }
}
</style>
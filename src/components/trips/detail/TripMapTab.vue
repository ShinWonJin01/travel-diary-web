<script setup lang="ts">
import TripPhotoMap from '@/components/trips/detail/map/TripPhotoMap.vue'
import type { MapPhoto } from '@/composables/trips/useTripPhotos'

defineProps<{
  photos: MapPhoto[]
}>()
</script>

<template>
  <div class="map-card">
    <TripPhotoMap :photos="photos" mode="full" />
  </div>
</template>

<style scoped>
.map-card {
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
}

@media (max-width: 760px) {
  .map-card {
    margin: 10px 10px 0;
    border-radius: 10px;
  }
}
</style>
<script setup lang="ts">
import TripPhotoMap from '@/components/trips/detail/map/TripPhotoMap.vue'
import type { MapPhoto } from '@/composables/trips/useTripPhotos'

defineProps<{
  photos: MapPhoto[]
}>()
</script>

<template>
  <section class="map-preview-card">
    <TripPhotoMap :photos="photos" mode="preview" />
  </section>
</template>

<style scoped>
.map-preview-card {
  position: relative;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  padding: 14px;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
}

@media (max-width: 760px) {
  .map-preview-card {
    padding: 7px;
    border-radius: 10px;
  }
}
</style>
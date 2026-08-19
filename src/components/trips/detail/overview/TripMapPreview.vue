<script setup lang="ts">
import type { MapPhoto } from '@/composables/trips/useTripPhotos'

import TripPhotoMap from '@/components/trips/detail/map/TripPhotoMap.vue'

defineProps<{
  photos: MapPhoto[]
}>()
</script>

<template>
  <section class="map-preview-card">
    <TripPhotoMap
      :photos="photos"
      mode="preview"
    />
  </section>
</template>

<style scoped>
.map-preview-card {
  position: relative;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  padding: 14px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

@media (max-width: 760px) {
  .map-preview-card {
    padding: 7px;
    border-radius: 10px;
  }
}
</style>
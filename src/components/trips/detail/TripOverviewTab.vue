<script setup lang="ts">
import type { Participant } from '@/composables/trips/useTripParticipants'
import type {
  MapPhoto,
  TimelineGroup,
} from '@/composables/trips/useTripPhotos'

import TripInfoCard from '@/components/trips/detail/overview/TripInfoCard.vue'
import TripMapPreview from '@/components/trips/detail/overview/TripMapPreview.vue'
import TripParticipantCard from '@/components/trips/detail/overview/TripParticipantCard.vue'
import TripTimelinePreview from '@/components/trips/detail/overview/TripTimelinePreview.vue'

defineProps<{
  tripTitle: string
  tripDestination: string
  tripPeriod: string
  tripDuration: string
  tripDescription: string
  ownerNickname: string
  coverImageUrl: string
  participantCount: number
  visibleParticipants: Participant[]
  remainingParticipantCount: number
  timelineGroups: TimelineGroup[]
  mapPhotos: MapPhoto[]
  isOwner: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  leave: []
  'open-participants': []
  'add-photo': []
  timeline: []
  'cover-error': []
}>()
</script>

<template>
  <div class="overview-layout">
    <TripInfoCard
      :trip-title="tripTitle"
      :trip-destination="tripDestination"
      :trip-period="tripPeriod"
      :trip-duration="tripDuration"
      :trip-description="tripDescription"
      :owner-nickname="ownerNickname"
      :cover-image-url="coverImageUrl"
      :participant-count="participantCount"
      :visible-participants="visibleParticipants"
      :remaining-participant-count="remainingParticipantCount"
      :is-owner="isOwner"
      @edit="emit('edit')"
      @delete="emit('delete')"
      @leave="emit('leave')"
      @open-participants="emit('open-participants')"
      @add-photo="emit('add-photo')"
      @cover-error="emit('cover-error')"
    />

    <TripParticipantCard
      :participant-count="participantCount"
      :visible-participants="visibleParticipants"
      :remaining-participant-count="remainingParticipantCount"
      :is-owner="isOwner"
      @open-participants="emit('open-participants')"
    />

    <TripMapPreview :photos="mapPhotos" />

    <TripTimelinePreview
      :timeline-groups="timelineGroups"
      @view-all="emit('timeline')"
    />
  </div>
</template>

<style scoped>
.overview-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

@media (max-width: 760px) {
  .overview-layout {
    display: block;
    padding: 10px 10px 0;
  }
}
</style>
<script setup lang="ts">
import type { TimelineGroup } from '@/composables/trips/useTripPhotos'

defineProps<{
  timelineGroups: TimelineGroup[]
}>()

const emit = defineEmits<{
  'view-all': []
}>()
</script>

<template>
  <section class="timeline-side-card">
    <div class="timeline-card-header">
      <h2>타임라인</h2>

      <button
        type="button"
        @click="emit('view-all')"
      >
        전체보기 <span>›</span>
      </button>
    </div>

    <div
      v-if="timelineGroups.length > 0"
      class="timeline-group-list"
    >
      <section
        v-for="group in timelineGroups"
        :key="group.dateLabel"
        class="timeline-group"
      >
        <h3>
          {{ group.dateLabel }}
          <span>{{ group.dayLabel }}</span>
        </h3>

        <article
          v-for="entry in group.entries"
          :key="entry.id"
          class="timeline-row"
        >
          <div class="timeline-time">
            {{ entry.time }}
          </div>

          <div class="timeline-dot-line">
            <span class="timeline-dot"></span>
          </div>

          <div class="timeline-entry-content">
            <strong>{{ entry.title }}</strong>

            <div
              class="timeline-thumbnail"
              :class="{ [entry.thumbnailClass]: !entry.imageUrl }"
            >
              <img
                v-if="entry.imageUrl"
                :src="entry.imageUrl"
                :alt="entry.title"
              />
            </div>
          </div>
        </article>
      </section>
    </div>

    <div
      v-else
      class="timeline-empty"
    >
      <p>아직 등록된 사진이 없습니다.</p>
    </div>
  </section>
</template>

<style scoped>
.timeline-side-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 18px 16px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.timeline-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.timeline-card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #222834;
}

.timeline-card-header button {
  border: 0;
  font-size: 12px;
  font-weight: 600;
  color: #4b74f0;
  background: transparent;
  cursor: pointer;
}

.timeline-card-header button span {
  font-size: 16px;
}

.timeline-group-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 22px;
}

.timeline-group h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #303743;
}

.timeline-group h3 span {
  margin-left: 4px;
  font-size: 12px;
  color: #8a92a0;
}

.timeline-row {
  display: grid;
  grid-template-columns: 54px 18px minmax(0, 1fr);
  align-items: start;
  min-width: 0;
}

.timeline-row + .timeline-row {
  margin-top: 14px;
}

.timeline-time {
  padding-top: 4px;
  font-size: 11px;
  color: #8a92a0;
}

.timeline-dot-line {
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 72px;
}

.timeline-dot-line::after {
  position: absolute;
  top: 14px;
  bottom: -14px;
  width: 1px;
  background: #dbe1eb;
  content: '';
}

.timeline-group .timeline-row:last-child .timeline-dot-line::after {
  display: none;
}

.timeline-dot {
  position: relative;
  z-index: 1;
  width: 8px;
  height: 8px;
  margin-top: 7px;
  border-radius: 50%;
  background: #4c74ee;
}

.timeline-entry-content {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.timeline-entry-content strong {
  min-width: 0;
  font-size: 13px;
  color: #262d38;
}

.timeline-thumbnail {
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 10px;
  background: #edf1f5;
}

.timeline-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-empty {
  display: grid;
  min-height: 160px;
  place-items: center;
}

.timeline-empty p {
  margin: 0;
  font-size: 12px;
  color: #98a1ad;
}

.thumb-blue {
  background: linear-gradient(145deg, #88aeda, #4d7cbd);
}

.thumb-green {
  background: linear-gradient(145deg, #96c09e, #5d8c66);
}

.thumb-orange {
  background: linear-gradient(145deg, #f0b98c, #ba7d58);
}

.thumb-purple {
  background: linear-gradient(145deg, #b4a6d8, #7d6ca8);
}

.thumb-sky {
  background: linear-gradient(145deg, #8fd1ea, #5f99c7);
}

@media (max-width: 760px) {
  .timeline-side-card {
    margin-top: 10px;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .timeline-card-header {
    margin-bottom: 10px;
  }

  .timeline-card-header h2 {
    font-size: 14px;
  }

  .timeline-card-header button {
    padding: 3px 0;
    font-size: 9px;
  }

  .timeline-card-header button span {
    font-size: 12px;
  }

  .timeline-group-list {
    gap: 16px;
  }

  .timeline-group h3 {
    margin-bottom: 8px;
    font-size: 11px;
  }

  .timeline-group h3 span {
    margin-left: 3px;
    font-size: 9px;
  }

  .timeline-row {
    grid-template-columns: 40px 12px minmax(0, 1fr);
  }

  .timeline-row + .timeline-row {
    margin-top: 8px;
  }

  .timeline-time {
    padding-top: 3px;
    font-size: 8px;
  }

  .timeline-dot-line {
    min-height: 44px;
  }

  .timeline-dot-line::after {
    top: 11px;
    bottom: -8px;
  }

  .timeline-dot {
    width: 6px;
    height: 6px;
    margin-top: 5px;
  }

  .timeline-entry-content {
    gap: 8px;
  }

  .timeline-entry-content strong {
    font-size: 10px;
  }

  .timeline-thumbnail {
    width: 34px;
    height: 34px;
    border-radius: 6px;
  }

  .timeline-empty {
    min-height: 100px;
  }

  .timeline-empty p {
    font-size: 9px;
  }
}
</style>
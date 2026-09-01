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

      <button type="button" @click="emit('view-all')">
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

    <div v-else class="timeline-empty">
      <span class="timeline-empty-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4v16M18 4v16M8 8h8M8 12h5M8 16h7" />
        </svg>
      </span>
      <p>아직 등록된 사진이 없습니다.</p>
    </div>
  </section>
</template>

<style scoped>
.timeline-side-card {
  display: flex;
  min-width: 0;
  height: 640px;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 18px 16px;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
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
  color: var(--tmr-text);
}

.timeline-card-header button {
  border: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--tmr-primary);
  background: transparent;
  transition: color 0.2s ease;
}

.timeline-card-header button:hover {
  color: var(--tmr-primary-dark);
}

.timeline-card-header button span {
  font-size: 16px;
}

.timeline-group-list {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--tmr-border) transparent;
}

.timeline-group-list::-webkit-scrollbar {
  width: 6px;
}

.timeline-group-list::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-group-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--tmr-border);
}

.timeline-group-list::-webkit-scrollbar-thumb:hover {
  background: var(--tmr-text-sub);
}

.timeline-group h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--tmr-text);
}

.timeline-group h3 span {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--tmr-text-sub);
}

.timeline-row {
  display: grid;
  grid-template-columns: 54px 18px minmax(0, 1fr);
  min-width: 0;
  align-items: start;
}

.timeline-row + .timeline-row {
  margin-top: 14px;
}

.timeline-time {
  padding-top: 4px;
  font-size: 11px;
  color: var(--tmr-text-sub);
}

.timeline-dot-line {
  position: relative;
  display: flex;
  min-height: 72px;
  justify-content: center;
}

.timeline-dot-line::after {
  position: absolute;
  top: 14px;
  bottom: -14px;
  width: 1px;
  background: var(--tmr-border);
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
  background: var(--tmr-primary);
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
  overflow: hidden;
  font-size: 13px;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-thumbnail {
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 10px;
  background: var(--tmr-surface-soft);
}

.timeline-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-empty {
  display: flex;
  min-height: 160px;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--tmr-text-sub);
}

.timeline-empty-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.timeline-empty-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.timeline-empty p {
  margin: 0;
  font-size: 12px;
}

.thumb-blue {
  background: linear-gradient(145deg, #91b6ff, #5d86e8);
}

.thumb-green {
  background: linear-gradient(145deg, #9bd8c7, #63ad9a);
}

.thumb-orange {
  background: linear-gradient(145deg, #ffc2af, #ff8a6b);
}

.thumb-purple {
  background: linear-gradient(145deg, #b5acf1, #8275d1);
}

.thumb-sky {
  background: linear-gradient(145deg, #a5dcf3, #6db6d6);
}

@media (max-width: 760px) {
  .timeline-side-card {
    height: auto;
    overflow: visible;
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
    min-height: auto;
    flex: none;
    gap: 16px;
    overflow-y: visible;
    padding-right: 0;
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
    gap: 7px;
  }

  .timeline-empty-icon {
    width: 34px;
    height: 34px;
  }

  .timeline-empty-icon svg {
    width: 16px;
    height: 16px;
  }

  .timeline-empty p {
    font-size: 9px;
  }
}
</style>
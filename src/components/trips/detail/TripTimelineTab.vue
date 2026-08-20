<script setup lang="ts">
interface TimelineEntry {
  id: number
  time: string
  title: string
  thumbnailClass: string
  imageUrl: string
  memo: string | null
}

interface TimelineGroup {
  dateLabel: string
  dayLabel: string
  entries: TimelineEntry[]
}

defineProps<{
  timelineGroups: TimelineGroup[]
}>()
</script>

<template>
  <section class="panel-card">
    <div class="panel-heading">
      <h2>타임라인</h2>
    </div>

    <div
      v-if="timelineGroups.length"
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
            <div class="timeline-texts">
              <strong>{{ entry.title }}</strong>
              <p v-if="entry.memo">{{ entry.memo }}</p>
              <p v-else>메모가 없습니다.</p>
            </div>

            <img
              class="timeline-thumbnail"
              :src="entry.imageUrl"
              :alt="entry.title"
            />
          </div>
        </article>
      </section>
    </div>

    <div
      v-else
      class="timeline-empty"
    >
      <span class="timeline-empty-icon">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>

      <p>아직 타임라인이 없습니다.</p>

      <span class="timeline-empty-description">
        사진의 촬영 시간이 등록되면 시간순으로 표시됩니다.
      </span>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  padding: 18px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #222834;
}

.timeline-group-list {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 28px;
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
  display: block;
  min-width: 0;
  font-size: 13px;
  color: #262d38;
}

.timeline-texts {
  min-width: 0;
  flex: 1;
}

.timeline-texts p {
  margin: 6px 0 0;
  font-size: 11px;
  color: #8d95a1;
}

.timeline-thumbnail {
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border-radius: 10px;
  object-fit: cover;
}

.timeline-empty {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px dashed #d9dee7;
  border-radius: 12px;
  color: #8c95a3;
  background: #fafbfd;
}

.timeline-empty-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  border-radius: 50%;
  color: #8794a3;
  background: #eef2f6;
}

.timeline-empty-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.timeline-empty p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #596270;
}

.timeline-empty-description {
  font-size: 10px;
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading {
    margin-bottom: 10px;
  }

  .panel-heading h2 {
    font-size: 14px;
  }

  .timeline-group-list {
    gap: 20px;
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

  .timeline-texts p {
    margin-top: 4px;
    font-size: 8px;
  }

  .timeline-thumbnail {
    width: 34px;
    height: 34px;
    border-radius: 6px;
  }

  .timeline-empty {
    min-height: 170px;
    border-radius: 8px;
  }

  .timeline-empty-icon {
    width: 38px;
    height: 38px;
  }

  .timeline-empty-icon svg {
    width: 20px;
    height: 20px;
  }

  .timeline-empty p {
    font-size: 11px;
  }

  .timeline-empty-description {
    font-size: 9px;
  }
}
</style>
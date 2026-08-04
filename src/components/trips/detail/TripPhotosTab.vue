<script setup lang="ts">
interface PhotoItem {
  id: number
  title: string
  location: string
  className: string
  imageUrl: string
  canDelete: boolean
}

defineProps<{
  photos: PhotoItem[]
}>()

const emit = defineEmits<{
  addPhoto: []
  deletePhoto: [photoId: number]
}>()
</script>

<template>
  <section class="panel-card">
    <div class="panel-heading">
      <h2>사진</h2>

      <button
        class="photo-add-button"
        type="button"
        @click="emit('addPhoto')"
      >
        + 사진 추가
      </button>
    </div>

    <div v-if="photos.length > 0" class="photo-grid">
      <article
        v-for="photo in photos"
        :key="photo.id"
        class="photo-card"
        :class="photo.className"
      >
        <img
          v-if="photo.imageUrl"
          class="photo-card-image"
          :src="photo.imageUrl"
          :alt="photo.title"
        />

        <button
          v-if="photo.canDelete"
          class="photo-delete-button"
          type="button"
          :aria-label="`${photo.title} 삭제`"
          @click="emit('deletePhoto', photo.id)"
        >
          ×
        </button>

        <div class="photo-overlay">
          <strong>{{ photo.title }}</strong>
          <span>{{ photo.location }}</span>
        </div>
      </article>
    </div>

    <div v-else class="photo-empty">
      <span class="photo-empty-icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m4 18 5-5 4 4 3-3 4 4" />
        </svg>
      </span>

      <p>아직 등록된 사진이 없습니다.</p>
      <span class="photo-empty-description">
        여행의 순간을 사진으로 남겨보세요.
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

.photo-add-button {
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #405bf4;
  cursor: pointer;
}

.photo-add-button:hover {
  background: #304bea;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-card {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 14px;
}

.photo-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-blue {
  background: linear-gradient(145deg, #89bbe1, #4e7aa9);
}

.photo-green {
  background: linear-gradient(145deg, #9ac7a3, #61896c);
}

.photo-orange {
  background: linear-gradient(145deg, #f0b98d, #b57753);
}

.photo-purple {
  background: linear-gradient(145deg, #bfaedc, #796aab);
}

.photo-delete-button {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 2;
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.65);
  cursor: pointer;
}

.photo-delete-button:hover {
  background: rgba(20, 26, 36, 0.85);
}

.photo-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 34px 14px 14px;
  color: #ffffff;
  background: linear-gradient(transparent, rgba(19, 27, 39, 0.7));
}

.photo-overlay strong {
  display: block;
  font-size: 13px;
}

.photo-overlay span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
}

.photo-empty {
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

.photo-empty-icon {
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

.photo-empty-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.photo-empty p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #596270;
}

.photo-empty-description {
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

  .photo-add-button {
    display: none;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .photo-card {
    height: 120px;
    border-radius: 8px;
  }

  .photo-delete-button {
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .photo-overlay {
    padding: 28px 10px 10px;
  }

  .photo-overlay strong {
    font-size: 10px;
  }

  .photo-overlay span {
    margin-top: 3px;
    font-size: 8px;
  }

  .photo-empty {
    min-height: 170px;
    border-radius: 8px;
  }

  .photo-empty-icon {
    width: 38px;
    height: 38px;
  }

  .photo-empty-icon svg {
    width: 20px;
    height: 20px;
  }

  .photo-empty p {
    font-size: 11px;
  }

  .photo-empty-description {
    font-size: 9px;
  }
}
</style>
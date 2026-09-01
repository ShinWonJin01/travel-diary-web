<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import PhotoDetailModal from '@/components/trips/detail/photos/PhotoDetailModal.vue'
import TripPhotoCard from '@/components/trips/detail/photos/TripPhotoCard.vue'
import type { PhotoItem } from '@/composables/trips/useTripPhotos'

const props = defineProps<{
  photos: PhotoItem[]
}>()

const emit = defineEmits<{
  addPhoto: []
  deletePhotos: [photoIds: number[]]
  updateMemo: [photoId: number, memo: string]
  updateTakenAt: [photoId: number, takenAt: string | null]
  updateLocation: [
    photoId: number,
    latitude: number,
    longitude: number,
    locationName: string | null,
  ]
}>()

const selectedPhotoId = ref<number | null>(null)
const menuPhotoId = ref<number | null>(null)
const isSelectionMode = ref(false)
const selectedPhotoIds = ref<number[]>([])

const selectedPhoto = computed(
  () =>
    props.photos.find((photo) => photo.id === selectedPhotoId.value) ?? null,
)

const selectablePhotoCount = computed(
  () => props.photos.filter((photo) => photo.canDelete).length,
)

const selectedPhotoCount = computed(() => selectedPhotoIds.value.length)

const isPhotoSelected = (photoId: number) =>
  selectedPhotoIds.value.includes(photoId)

const closePhotoMenu = () => {
  menuPhotoId.value = null
}

const closePhotoModal = () => {
  selectedPhotoId.value = null
  closePhotoMenu()
}

const handlePhotoClick = (photo: PhotoItem) => {
  if (isSelectionMode.value) {
    togglePhotoSelection(photo)
    return
  }

  closePhotoMenu()
  selectedPhotoId.value = photo.id
}

const toggleSelectionMode = () => {
  closePhotoMenu()

  if (isSelectionMode.value) {
    isSelectionMode.value = false
    selectedPhotoIds.value = []
    return
  }

  closePhotoModal()
  isSelectionMode.value = true
}

const togglePhotoSelection = (photo: PhotoItem) => {
  if (!isSelectionMode.value || !photo.canDelete) return

  if (isPhotoSelected(photo.id)) {
    selectedPhotoIds.value = selectedPhotoIds.value.filter(
      (id) => id !== photo.id,
    )
    return
  }

  selectedPhotoIds.value.push(photo.id)
}

const deleteSelectedPhotos = () => {
  if (selectedPhotoCount.value === 0) return

  emit('deletePhotos', [...selectedPhotoIds.value])
  isSelectionMode.value = false
  selectedPhotoIds.value = []
}

const togglePhotoMenu = (photoId: number) => {
  menuPhotoId.value = menuPhotoId.value === photoId ? null : photoId
}

const openPhotoEdit = (photoId: number) => {
  closePhotoMenu()
  selectedPhotoId.value = photoId
}

const deleteSinglePhoto = (photoId: number) => {
  closePhotoMenu()
  emit('deletePhotos', [photoId])
}

const handleModalMemoUpdate = (photoId: number, memo: string) => {
  emit('updateMemo', photoId, memo)
}

const handleModalTakenAtUpdate = (
  photoId: number,
  takenAt: string | null,
) => {
  emit('updateTakenAt', photoId, takenAt)
}

const handleModalLocationUpdate = (
  photoId: number,
  latitude: number,
  longitude: number,
  locationName: string | null,
) => {
  emit('updateLocation', photoId, latitude, longitude, locationName)
}

onMounted(() => {
  document.addEventListener('click', closePhotoMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closePhotoMenu)
})
</script>

<template>
  <section class="panel-card">
    <div class="panel-heading">
      <h2>사진</h2>

      <div class="photo-heading-actions">
        <template v-if="isSelectionMode">
          <span class="selected-count">
            {{ selectedPhotoCount }}개 선택
          </span>

          <button
            class="photo-delete-selected-button"
            type="button"
            :disabled="selectedPhotoCount === 0"
            @click="deleteSelectedPhotos"
          >
            삭제
          </button>

          <button
            class="photo-select-button"
            type="button"
            @click="toggleSelectionMode"
          >
            취소
          </button>
        </template>

        <template v-else>
          <button
            v-if="selectablePhotoCount > 0"
            class="photo-select-button"
            type="button"
            @click="toggleSelectionMode"
          >
            선택
          </button>

          <button
            class="photo-add-button"
            type="button"
            @click="emit('addPhoto')"
          >
            + 사진 추가
          </button>
        </template>
      </div>
    </div>

    <div v-if="photos.length > 0" class="photo-grid">
      <TripPhotoCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :is-selection-mode="isSelectionMode"
        :is-selected="isPhotoSelected(photo.id)"
        :is-menu-open="menuPhotoId === photo.id"
        @click="handlePhotoClick(photo)"
        @toggle-menu="togglePhotoMenu(photo.id)"
        @edit="openPhotoEdit(photo.id)"
        @delete="deleteSinglePhoto(photo.id)"
        @toggle-selection="togglePhotoSelection(photo)"
      />
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

  <PhotoDetailModal
    v-if="selectedPhoto"
    :photo="selectedPhoto"
    @close="closePhotoModal"
    @update-memo="handleModalMemoUpdate"
    @update-taken-at="handleModalTakenAtUpdate"
    @update-location="handleModalLocationUpdate"
  />
</template>

<style scoped>
.panel-card {
  padding: 18px;
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  color: var(--tmr-text);
}

.photo-heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-select-button {
  height: 34px;
  padding: 0 13px;
  border: 1px solid var(--tmr-border);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.photo-select-button:hover {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.photo-add-button {
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--tmr-surface);
  background: var(--tmr-primary);
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.photo-add-button:hover {
  background: var(--tmr-primary-dark);
}

.photo-add-button:active {
  transform: scale(0.98);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-empty {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px dashed var(--tmr-border);
  border-radius: 12px;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.photo-empty-icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  border-radius: 50%;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.photo-empty-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.photo-empty p {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--tmr-text);
}

.photo-empty-description {
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.selected-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--tmr-text-sub);
}

.photo-delete-selected-button {
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #d94b5b;
  transition:
    background 0.2s ease,
    opacity 0.2s ease;
}

.photo-delete-selected-button:hover:not(:disabled) {
  background: #c83c4c;
}

.photo-delete-selected-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
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

  .photo-select-button,
  .photo-delete-selected-button {
    height: 30px;
    padding: 0 10px;
    font-size: 10px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
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

  .photo-empty-description,
  .selected-count {
    font-size: 9px;
  }
}
</style>
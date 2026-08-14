<script setup lang="ts">
import { computed, ref } from 'vue'
import PhotoDetailModal from './PhotoDetailModal.vue'

interface PhotoItem {
  id: number
  title: string
  location: string
  imageUrl: string
  memo: string | null
  takenAt: string | null
  latitude: number | null
  longitude: number | null
  canDelete: boolean
  canEditMemo: boolean
  canEditLocation: boolean
}

const props = defineProps<{ photos: PhotoItem[] }>()

const emit = defineEmits<{
  addPhoto: []
  deletePhotos: [photoIds: number[]]
  updateMemo: [photoId: number, memo: string]
  updateTakenAt: [photoId: number, takenAt: string | null]
  updateLocation: [photoId: number, latitude: number, longitude: number]
}>()

const selectedPhotoId = ref<number | null>(null)
const isSelectionMode = ref(false)
const selectedPhotoIds = ref<number[]>([])

const selectedPhoto = computed(() =>
  props.photos.find((photo) => photo.id === selectedPhotoId.value) ?? null,
)

const selectablePhotoCount = computed(
  () => props.photos.filter((photo) => photo.canDelete).length,
)

const handlePhotoClick = (photo: PhotoItem) => {
  if (isSelectionMode.value) {
    togglePhotoSelection(photo)
    return
  }

  selectedPhotoId.value = photo.id
}

const closePhotoModal = () => {
  selectedPhotoId.value = null
}

const toggleSelectionMode = () => {
  menuPhotoId.value = null

  if (isSelectionMode.value) {
    isSelectionMode.value = false
    selectedPhotoIds.value = []
    return
  }

  closePhotoModal()
  isSelectionMode.value = true
}

const isPhotoSelected = (photoId: number) => {
  return selectedPhotoIds.value.includes(photoId)
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

const selectedPhotoCount = computed(() => selectedPhotoIds.value.length)

const deleteSelectedPhotos = () => {
  if (!selectedPhotoIds.value.length) return

  emit('deletePhotos', [...selectedPhotoIds.value])
  isSelectionMode.value = false
  selectedPhotoIds.value = []
}

const menuPhotoId = ref<number | null>(null)

const togglePhotoMenu = (photoId: number) => {
  menuPhotoId.value = menuPhotoId.value === photoId ? null : photoId
}

const openPhotoEdit = (photoId: number) => {
  menuPhotoId.value = null
  selectedPhotoId.value = photoId
}

const deleteSinglePhoto = (photoId: number) => {
  menuPhotoId.value = null
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
) => {
  emit('updateLocation', photoId, latitude, longitude)
}
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

    <div v-if="photos.length" class="photo-grid">
      <article
        v-for="photo in photos"
        :key="photo.id"
        class="photo-card"
        :class="{ 'photo-card-selected': isPhotoSelected(photo.id) }"
        @click="handlePhotoClick(photo)"
      >
        <img class="photo-card-image" :src="photo.imageUrl" :alt="photo.title" />

        <button
          v-if="!isSelectionMode && (photo.canEditMemo || photo.canEditLocation || photo.canDelete)"
          class="photo-menu-button"
          type="button"
          :aria-label="`${photo.title} 메뉴`"
          @click.stop="togglePhotoMenu(photo.id)"
        >
          ⋯
        </button>

        <div
          v-if="!isSelectionMode && menuPhotoId === photo.id"
          class="photo-menu"
          @click.stop
        >
          <button type="button" @click="openPhotoEdit(photo.id)">수정</button>

          <button
            v-if="photo.canDelete"
            class="delete"
            type="button"
            @click="deleteSinglePhoto(photo.id)"
          >
            삭제
          </button>
        </div>

        <button
          v-if="isSelectionMode && photo.canDelete"
          class="photo-select-check"
          :class="{ selected: isPhotoSelected(photo.id) }"
          type="button"
          :aria-label="`${photo.title} 선택`"
          @click.stop="togglePhotoSelection(photo)"
        >
          <span v-if="isPhotoSelected(photo.id)">✓</span>
        </button>

        <div class="photo-overlay">
          <strong>{{ photo.title }}</strong>
          <span>{{ photo.location }}</span>
          <p v-if="photo.memo" class="photo-memo-text">{{ photo.memo }}</p>
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
      <span class="photo-empty-description">여행의 순간을 사진으로 남겨보세요.</span>
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

.photo-heading-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-select-button {
  height: 34px;
  padding: 0 13px;
  border: 1px solid #dfe3eb;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #4d5664;
  background: #ffffff;
  cursor: pointer;
}

.photo-select-button:hover { background: #f5f7fa; }

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

.photo-add-button:hover { background: #304bea; }

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
  cursor: pointer;
}

.photo-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.photo-card:hover .photo-card-image { transform: scale(1.02); }

.photo-menu-button {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 3;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.65);
  cursor: pointer;
}

.photo-menu-button:hover { background: rgba(20, 26, 36, 0.85); }

.photo-menu {
  position: absolute;
  top: 42px;
  right: 9px;
  z-index: 4;
  min-width: 80px;
  overflow: hidden;
  border: 1px solid #e1e5ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(20, 26, 36, 0.18);
}

.photo-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  font-size: 11px;
  text-align: left;
  color: #454d59;
  background: #ffffff;
  cursor: pointer;
}

.photo-menu button:hover { background: #f5f7fa; }
.photo-menu .delete { color: #e5484d; }

.photo-select-check {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.4);
  cursor: pointer;
}

.photo-select-check.selected {
  border-color: #405bf4;
  background: #405bf4;
}

.photo-card-selected::after {
  position: absolute;
  inset: 0;
  border: 3px solid #405bf4;
  border-radius: inherit;
  content: '';
  pointer-events: none;
}

.photo-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 34px 14px 14px;
  color: #ffffff;
  background: linear-gradient(transparent, rgba(19, 27, 39, 0.78));
}

.photo-overlay strong {
  display: block;
  font-size: 13px;
}

.photo-overlay > span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
}

.photo-memo-text {
  overflow: hidden;
  margin: 5px 0 0;
  font-size: 10px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.photo-empty-description { font-size: 10px; }

.selected-count {
  font-size: 11px;
  font-weight: 600;
  color: #687383;
}

.photo-delete-selected-button {
  height: 34px;
  padding: 0 13px;
  border: 0;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  background: #e5484d;
  cursor: pointer;
}

.photo-delete-selected-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading { margin-bottom: 10px; }
  .panel-heading h2 { font-size: 14px; }
  .photo-add-button { display: none; }

  .photo-select-button {
    height: 30px;
    padding: 0 10px;
    font-size: 10px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .photo-card {
    height: 120px;
    border-radius: 8px;
  }

  .photo-menu-button {
    top: 7px;
    right: 7px;
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .photo-menu {
    top: 35px;
    right: 7px;
  }

  .photo-menu button {
    padding: 7px 10px;
    font-size: 10px;
  }

  .photo-select-check {
    top: 7px;
    right: 7px;
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .photo-overlay { padding: 28px 10px 10px; }
  .photo-overlay strong { font-size: 10px; }

  .photo-overlay > span {
    margin-top: 3px;
    font-size: 8px;
  }

  .photo-memo-text {
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

  .photo-empty p { font-size: 11px; }
  .photo-empty-description { font-size: 9px; }

  .selected-count { font-size: 9px; }

  .photo-delete-selected-button {
    height: 30px;
    padding: 0 10px;
    font-size: 10px;
  }
}
</style>
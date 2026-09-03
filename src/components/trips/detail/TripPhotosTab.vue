<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import PhotoDetailModal from '@/components/trips/detail/photos/PhotoDetailModal.vue'
import TripPhotoCard from '@/components/trips/detail/photos/TripPhotoCard.vue'
import type { PhotoItem } from '@/composables/trips/useTripPhotos'

const DRAG_THRESHOLD = 5

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
  deleteLocation: [photoId: number]
}>()

const selectedPhotoId = ref<number | null>(null)
const menuPhotoId = ref<number | null>(null)
const isSelectionMode = ref(false)
const selectedPhotoIds = ref<number[]>([])

let draggingRow: HTMLElement | null = null
let dragStartX = 0
let dragStartScrollLeft = 0
let didDrag = false

const selectedPhoto = computed(
  () =>
    props.photos.find((photo) => photo.id === selectedPhotoId.value) ?? null,
)

const selectablePhotoCount = computed(
  () => props.photos.filter((photo) => photo.canDelete).length,
)

const selectedPhotoCount = computed(() => selectedPhotoIds.value.length)

const groupedPhotos = computed(() => {
  const groups = new Map<string, PhotoItem[]>()

  const sortedPhotos = [...props.photos].sort((a, b) => {
    if (!a.takenAt && !b.takenAt) return 0
    if (!a.takenAt) return 1
    if (!b.takenAt) return -1
    return a.takenAt.localeCompare(b.takenAt)
  })

  sortedPhotos.forEach((photo) => {
    const dateKey = photo.takenAt?.slice(0, 10) || 'unknown'
    const group = groups.get(dateKey)

    if (group) {
      group.push(photo)
      return
    }

    groups.set(dateKey, [photo])
  })

  return Array.from(groups, ([dateKey, photos]) => ({
    dateKey,
    photos,
  }))
})

const formatPhotoDate = (dateKey: string) => {
  if (dateKey === 'unknown') return '촬영일 미상'

  const month = Number(dateKey.slice(5, 7))
  const day = Number(dateKey.slice(8, 10))

  return `${month}월 ${day}일`
}

const isPhotoSelected = (photoId: number) =>
  selectedPhotoIds.value.includes(photoId)

const closePhotoMenu = () => {
  menuPhotoId.value = null
}

const closePhotoModal = () => {
  selectedPhotoId.value = null
  closePhotoMenu()
}

const clearSelection = () => {
  isSelectionMode.value = false
  selectedPhotoIds.value = []
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
    clearSelection()
    return
  }

  selectedPhotoId.value = null
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
  clearSelection()
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

const handleModalLocationDelete = (
  photoId: number,
) => {
  emit('deleteLocation', photoId)
}

const handlePhotoRowWheel = (event: WheelEvent) => {
  const target = event.currentTarget as HTMLElement
  const maxScrollLeft = target.scrollWidth - target.clientWidth

  if (maxScrollLeft <= 0) return

  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY * 1.6

  const canScroll =
    delta > 0
      ? target.scrollLeft < maxScrollLeft
      : target.scrollLeft > 0

  if (!canScroll) return

  event.preventDefault()
  target.scrollLeft += delta
}

const startPhotoRowDrag = (event: PointerEvent) => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return

  if (
    event.target instanceof Element &&
    event.target.closest('button, [role="menu"]')
  ) {
    return
  }

  const target = event.currentTarget as HTMLElement

  draggingRow = target
  dragStartX = event.clientX
  dragStartScrollLeft = target.scrollLeft
  didDrag = false

  target.setPointerCapture(event.pointerId)
}

const movePhotoRowDrag = (event: PointerEvent) => {
  if (!draggingRow) return

  const distance = event.clientX - dragStartX

  if (!didDrag && Math.abs(distance) < DRAG_THRESHOLD) return

  didDrag = true
  event.preventDefault()
  draggingRow.scrollLeft = dragStartScrollLeft - distance
}

const endPhotoRowDrag = (event: PointerEvent) => {
  if (!draggingRow) return

  if (draggingRow.hasPointerCapture(event.pointerId)) {
    draggingRow.releasePointerCapture(event.pointerId)
  }

  draggingRow = null

  window.setTimeout(() => {
    didDrag = false
  }, 0)
}

const preventPhotoClickAfterDrag = (event: MouseEvent) => {
  if (!didDrag) return

  event.preventDefault()
  event.stopPropagation()
  didDrag = false
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

    <div v-if="photos.length > 0" class="photo-date-groups">
      <section
        v-for="group in groupedPhotos"
        :key="group.dateKey"
        class="photo-date-group"
      >
        <div class="photo-date-heading">
          <strong>{{ formatPhotoDate(group.dateKey) }}</strong>
          <span>{{ group.photos.length }}장</span>
        </div>

        <div
          class="photo-stack-scroll"
          @wheel="handlePhotoRowWheel"
          @pointerdown="startPhotoRowDrag"
          @pointermove="movePhotoRowDrag"
          @pointerup="endPhotoRowDrag"
          @pointercancel="endPhotoRowDrag"
          @click.capture="preventPhotoClickAfterDrag"
          @dragstart.prevent
        >
          <div
            class="photo-stack"
            :class="{ 'photo-stack-selection': isSelectionMode }"
          >
            <div
              v-for="(photo, index) in group.photos"
              :key="photo.id"
              class="photo-stack-item"
              :style="{ zIndex: group.photos.length - index }"
            >
              <TripPhotoCard
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
          </div>
        </div>
      </section>
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
    @delete-location="handleModalLocationDelete"
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
  margin-bottom: 20px;
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

.photo-date-groups {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.photo-date-group {
  min-width: 0;
}

.photo-date-heading {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 11px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--tmr-border);
}

.photo-date-heading strong {
  font-size: 14px;
  font-weight: 700;
  color: var(--tmr-text);
}

.photo-date-heading span {
  font-size: 10px;
  font-weight: 500;
  color: var(--tmr-text-sub);
}

.photo-stack-scroll {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 8px;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.photo-stack-scroll::-webkit-scrollbar {
  display: none;
}

.photo-stack {
  --photo-overlap: 52px;

  display: flex;
  width: max-content;
  min-width: 100%;
  align-items: stretch;
}

.photo-stack-item {
  position: relative;
  width: 270px;
  flex: 0 0 270px;
  transition:
    margin 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.25s ease;
}

.photo-stack-item + .photo-stack-item {
  margin-left: calc(var(--photo-overlap) * -1);
}

.photo-stack-item:hover,
.photo-stack-item:focus-within {
  z-index: 100 !important;
  transform: translateY(-2px) scale(1.01);
}

.photo-stack-selection {
  gap: 12px;
}

.photo-stack-selection .photo-stack-item {
  margin-left: 0;
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

@media (hover: hover) and (pointer: fine) {
  .photo-stack-scroll {
    cursor: grab;
  }

  .photo-stack-scroll:active {
    cursor: grabbing;
  }
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading {
    margin-bottom: 14px;
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

  .photo-date-groups {
    gap: 20px;
  }

  .photo-date-heading {
    margin-bottom: 8px;
    padding-bottom: 6px;
  }

  .photo-date-heading strong {
    font-size: 12px;
  }

  .photo-date-heading span {
    font-size: 9px;
  }

  .photo-stack-scroll {
    margin-right: -11px;
    padding-right: 11px;
  }

  .photo-stack {
    --photo-overlap: 20px;
  }

  .photo-stack-item {
    width: 162px;
    flex-basis: 162px;
  }

  .photo-stack-selection {
    gap: 8px;
  }

  .photo-stack-item:hover,
  .photo-stack-item:focus-within {
    transform: none;
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
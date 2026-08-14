<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

type EditType = 'takenAt' | 'location' | 'memo' | null

const props = defineProps<{ photo: PhotoItem }>()

const emit = defineEmits<{
  close: []
  updateMemo: [photoId: number, memo: string]
  updateTakenAt: [photoId: number, takenAt: string | null]
  updateLocation: [photoId: number, latitude: number, longitude: number]
}>()

const editType = ref<EditType>(null)
const takenAtDraft = ref('')
const memoDraft = ref('')
const selectedLatitude = ref<number | null>(null)
const selectedLongitude = ref<number | null>(null)

let locationMap: L.Map | null = null
let locationMarker: L.CircleMarker | null = null

const destroyLocationMap = () => {
  locationMap?.remove()
  locationMap = null
  locationMarker = null
}

const resetEdit = () => {
  destroyLocationMap()
  editType.value = null
  takenAtDraft.value = ''
  memoDraft.value = ''
  selectedLatitude.value = null
  selectedLongitude.value = null
}

const closeModal = () => {
  resetEdit()
  emit('close')
}

const startTakenAtEdit = () => {
  editType.value = 'takenAt'
  takenAtDraft.value = props.photo.takenAt?.slice(0, 16) ?? ''
}

const saveTakenAt = () => {
  const takenAt = takenAtDraft.value ? `${takenAtDraft.value}:00` : null
  emit('updateTakenAt', props.photo.id, takenAt)
  resetEdit()
}

const startMemoEdit = () => {
  editType.value = 'memo'
  memoDraft.value = props.photo.memo ?? ''
}

const saveMemo = () => {
  emit('updateMemo', props.photo.id, memoDraft.value)
  resetEdit()
}

const updateLocationMarker = (latitude: number, longitude: number) => {
  if (!locationMap) return

  const position: L.LatLngTuple = [latitude, longitude]

  if (locationMarker) {
    locationMarker.setLatLng(position)
    return
  }

  locationMarker = L.circleMarker(position, {
    radius: 8,
    weight: 2,
    fillOpacity: 0.9,
  }).addTo(locationMap)
}

const startLocationEdit = async () => {
  editType.value = 'location'
  selectedLatitude.value = props.photo.latitude
  selectedLongitude.value = props.photo.longitude

  await nextTick()

  const mapElement = document.getElementById('photo-detail-location-map')
  if (!mapElement) return

  destroyLocationMap()

  const latitude = props.photo.latitude
  const longitude = props.photo.longitude
  const hasLocation = latitude !== null && longitude !== null

  let center: L.LatLngTuple = [36.5, 127.8]
  if (hasLocation) center = [latitude, longitude]

  locationMap = L.map(mapElement).setView(center, hasLocation ? 15 : 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(locationMap)

  if (hasLocation) updateLocationMarker(latitude, longitude)

  locationMap.on('click', (event) => {
    selectedLatitude.value = event.latlng.lat
    selectedLongitude.value = event.latlng.lng
    updateLocationMarker(event.latlng.lat, event.latlng.lng)
  })

  requestAnimationFrame(() => locationMap?.invalidateSize())
}

const saveLocation = () => {
  if (selectedLatitude.value === null || selectedLongitude.value === null) {
    window.alert('지도에서 위치를 선택해 주세요.')
    return
  }

  emit(
    'updateLocation',
    props.photo.id,
    selectedLatitude.value,
    selectedLongitude.value,
  )

  resetEdit()
}

onBeforeUnmount(destroyLocationMap)
</script>

<template>
  <div class="modal-backdrop" @click.self="closeModal">
    <section class="photo-modal">
      <button class="modal-close-button" type="button" aria-label="닫기" @click="closeModal">
        ×
      </button>

      <img class="photo-modal-image" :src="photo.imageUrl" :alt="photo.title" />

      <div class="photo-modal-content">
        <div class="photo-info">
          <strong>{{ photo.title }}</strong>
          <span>{{ photo.location }}</span>
        </div>

        <div v-if="editType === 'takenAt'" class="photo-editor">
          <input v-model="takenAtDraft" type="datetime-local" />

          <div class="editor-actions">
            <button type="button" @click="resetEdit">취소</button>
            <button class="save-button" type="button" @click="saveTakenAt">저장</button>
          </div>
        </div>

        <div v-else-if="editType === 'location'" class="photo-editor">
          <div id="photo-detail-location-map" class="photo-location-map"></div>

          <div class="editor-actions">
            <button type="button" @click="resetEdit">취소</button>
            <button class="save-button" type="button" @click="saveLocation">저장</button>
          </div>
        </div>

        <div v-else-if="editType === 'memo'" class="photo-editor">
          <textarea
            v-model="memoDraft"
            maxlength="1000"
            placeholder="이 순간에 대한 메모를 남겨보세요."
          ></textarea>

          <div class="editor-actions">
            <button type="button" @click="resetEdit">취소</button>
            <button class="save-button" type="button" @click="saveMemo">저장</button>
          </div>
        </div>

        <template v-else>
          <div class="photo-memo">
            <span>메모</span>
            <p v-if="photo.memo">{{ photo.memo }}</p>
            <p v-else class="empty-memo">메모가 없습니다.</p>
          </div>

          <div class="photo-actions">
            <button v-if="photo.canEditMemo" type="button" @click="startTakenAtEdit">
              시간 수정
            </button>

            <button v-if="photo.canEditLocation" type="button" @click="startLocationEdit">
              위치 수정
            </button>

            <button v-if="photo.canEditMemo" type="button" @click="startMemoEdit">
              {{ photo.memo ? '메모 수정' : '메모 추가' }}
            </button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 20, 30, 0.65);
}

.photo-modal {
  position: relative;
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  border-radius: 16px;
  background: #ffffff;
}

.modal-close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  font-size: 22px;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.7);
  cursor: pointer;
}

.photo-modal-image {
  display: block;
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: #111722;
}

.photo-modal-content { padding: 20px; }

.photo-info strong {
  display: block;
  font-size: 18px;
  color: #252b37;
}

.photo-info span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #77808d;
}

.photo-memo { margin-top: 18px; }

.photo-memo > span {
  font-size: 11px;
  font-weight: 700;
  color: #77808d;
}

.photo-memo p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #4f5865;
}

.photo-memo .empty-memo { color: #98a0ac; }

.photo-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.photo-actions button,
.editor-actions button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #dfe3eb;
  border-radius: 8px;
  font-size: 11px;
  color: #4d5664;
  background: #ffffff;
  cursor: pointer;
}

.photo-editor { margin-top: 18px; }

.photo-editor input,
.photo-editor textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9dee7;
  border-radius: 8px;
  box-sizing: border-box;
  font: inherit;
}

.photo-editor textarea {
  min-height: 100px;
  resize: vertical;
}

.photo-location-map {
  height: 300px;
  overflow: hidden;
  border-radius: 10px;
  background: #eef2f6;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.editor-actions .save-button {
  border-color: #3565f3;
  color: #ffffff;
  background: #3565f3;
}

@media (max-width: 760px) {
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .photo-modal {
    width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .photo-modal-image { max-height: 52vh; }
  .photo-modal-content { padding: 16px; }
  .photo-location-map { height: 260px; }

  .photo-actions {
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .photo-actions button,
  .editor-actions button {
    height: 32px;
    font-size: 10px;
  }
}
</style>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapPhoto {
  id: number
  title: string
  latitude: number
  longitude: number
  imageUrl: string
  takenAt: string | null
  memo: string | null
}

const props = defineProps<{
  photos: MapPhoto[]
}>()

const mapElement = ref<HTMLElement | null>(null)

let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null

const formatTakenAt = (takenAt: string | null) => {
  if (!takenAt) return '촬영시간 정보 없음'

  const [datePart, timePart] = takenAt.split('T')
  if (!datePart || !timePart) return '촬영시간 정보 없음'

  return `${datePart.replaceAll('-', '.')} ${timePart.slice(0, 5)}`
}

const createPhotoPopup = (photo: MapPhoto) => {
  const popup = document.createElement('div')
  popup.className = 'map-photo-popup'

  const image = document.createElement('img')
  image.className = 'map-photo-popup-image'
  image.src = photo.imageUrl
  image.alt = photo.title

  const title = document.createElement('strong')
  title.textContent = photo.title

  const takenAt = document.createElement('span')
  takenAt.textContent = formatTakenAt(photo.takenAt)

  popup.append(image, title, takenAt)

  if (photo.memo) {
    const memo = document.createElement('p')
    memo.className = 'map-photo-popup-memo'
    memo.textContent = photo.memo
    popup.append(memo)
  }

  return popup
}

const updateMarkers = () => {
  if (!map || !markerLayer) return

  const currentMarkerLayer = markerLayer

  currentMarkerLayer.clearLayers()

  if (props.photos.length === 0) {
    map.setView([36.5, 127.8], 7)
    return
  }

  const bounds: L.LatLngTuple[] = []

  const sortedPhotos = [...props.photos].sort((a, b) => {
    if (!a.takenAt && !b.takenAt) return 0
    if (!a.takenAt) return 1
    if (!b.takenAt) return -1

    return a.takenAt.localeCompare(b.takenAt)
  })

  sortedPhotos.forEach((photo, index) => {
    const position: L.LatLngTuple = [
      photo.latitude,
      photo.longitude,
    ]

    L.circleMarker(position, {
      radius: 10,
      weight: 2,
      fillOpacity: 0.9,
    })
      .bindTooltip(String(index + 1), {
        permanent: true,
        direction: 'center',
        className: 'map-photo-order',
      })
      .bindPopup(createPhotoPopup(photo))
      .addTo(currentMarkerLayer)

    bounds.push(position)
  })

  if (bounds.length >= 2) {
    L.polyline(bounds, {
      weight: 3,
      opacity: 0.7,
    }).addTo(currentMarkerLayer)
  }

  map.fitBounds(bounds, {
    padding: [40, 40],
    maxZoom: 15,
  })
}

onMounted(() => {
  if (!mapElement.value) return

  map = L.map(mapElement.value).setView(
    [36.5, 127.8],
    7,
  )

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors',
    },
  ).addTo(map)

  markerLayer = L.layerGroup().addTo(map)

  updateMarkers()
})

watch(
  () => props.photos,
  () => updateMarkers(),
  { deep: true },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  markerLayer = null
})
</script>

<template>
  <div class="map-card map-card-large">
    <div ref="mapElement" class="map-canvas"></div>
  </div>
</template>

<style scoped>
.map-card {
  overflow: hidden;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.map-canvas {
  width: 100%;
  height: 620px;
}

.map-canvas :deep(.map-photo-popup) {
  display: flex;
  width: 150px;
  flex-direction: column;
  gap: 5px;
}

.map-canvas :deep(.map-photo-popup-image) {
  width: 150px;
  height: 100px;
  border-radius: 7px;
  object-fit: cover;
}

.map-canvas :deep(.map-photo-popup strong) {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-canvas :deep(.map-photo-popup span) {
  font-size: 10px;
  color: #8a92a0;
}

.map-canvas :deep(.map-photo-popup-memo) {
  margin: 3px 0 0;
  padding-top: 6px;
  border-top: 1px solid #e6eaf2;
  font-size: 10px;
  line-height: 1.4;
  color: #596270;
}

.map-canvas :deep(.map-photo-order) {
  padding: 0;
  border: 0;
  box-shadow: none;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: transparent;
}

.map-canvas :deep(.map-photo-order::before) {
  display: none;
}

@media (max-width: 760px) {
  .map-card {
    margin: 10px 10px 0;
    border-radius: 10px;
  }

  .map-canvas {
    height: 480px;
  }
}
</style>
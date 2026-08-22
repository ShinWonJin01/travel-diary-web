<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { MapPhoto } from '@/composables/trips/useTripPhotos'

const props = withDefaults(
  defineProps<{
    photos: MapPhoto[]
    mode?: 'full' | 'preview'
  }>(),
  {
    mode: 'full',
  },
)

const mapElement = ref<HTMLElement | null>(null)
const isMapReady = ref(false)

let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null
let activeMarker: L.Marker | null = null

const formatTakenAt = (
  takenAt: string | null,
) => {
  if (!takenAt) {
    return '촬영시간 정보 없음'
  }

  const [datePart, timePart] =
    takenAt.split('T')

  if (!datePart || !timePart) {
    return '촬영시간 정보 없음'
  }

  return `${datePart.replaceAll('-', '.')} ${timePart.slice(0, 5)}`
}

const createPhotoPopup = (
  photo: MapPhoto,
  order: number,
) => {
  const popup =
    document.createElement('div')

  popup.className = 'map-photo-popup'

  const orderBadge =
    document.createElement('div')

  orderBadge.className =
    'map-photo-popup-order'

  orderBadge.textContent =
    `${order}번 마커`

  popup.append(orderBadge)

  if (photo.imageUrl) {
    const image =
      document.createElement('img')

    image.className =
      'map-photo-popup-image'
    image.src = photo.imageUrl
    image.alt = photo.title

    popup.append(image)
  }

  const title =
    document.createElement('strong')

  title.textContent = photo.title

  const takenAt =
    document.createElement('span')

  takenAt.textContent =
    formatTakenAt(photo.takenAt)

  popup.append(title, takenAt)

  if (photo.memo) {
    const memo =
      document.createElement('p')

    memo.className =
      'map-photo-popup-memo'
    memo.textContent = photo.memo

    popup.append(memo)
  }

  return popup
}

const createPhotoMarkerIcon = (order: number) => {
  return L.divIcon({
    className: 'map-photo-marker-wrapper',
    html: `
      <div class="map-photo-marker">
        <span>${order}</span>
      </div>
    `,
    iconSize: [26, 33],
    iconAnchor: [13, 33],
    popupAnchor: [0, -31],
  })
}

const updateMarkers = () => {
  if (!map || !markerLayer) {
    return
  }

  markerLayer.clearLayers()
  activeMarker = null

  if (props.photos.length === 0) {
    map.setView([36.5, 127.8], 7)
    return
  }

  const bounds: L.LatLngTuple[] = []

  const sortedPhotos = [
    ...props.photos,
  ].sort((a, b) => {
    if (!a.takenAt && !b.takenAt) {
      return 0
    }

    if (!a.takenAt) {
      return 1
    }

    if (!b.takenAt) {
      return -1
    }

    return a.takenAt.localeCompare(
      b.takenAt,
    )
  })

  sortedPhotos.forEach(
    (photo, index) => {
      const position: L.LatLngTuple = [
        photo.latitude,
        photo.longitude,
      ]

      const marker = L.marker(position, {
        icon: createPhotoMarkerIcon(index + 1),
      })
        .bindPopup(
          createPhotoPopup(
            photo,
            index + 1,
          ),
          {
            closeButton: false,
            autoClose: true,
            closeOnClick: true,
          },
        )
        .addTo(markerLayer!)

      marker.on('click', () => {
        if (
          activeMarker
          && activeMarker !== marker
        ) {
          activeMarker
            .getElement()
            ?.classList.remove(
              'map-photo-marker-active',
            )
        }

        activeMarker = marker

        requestAnimationFrame(() => {
          marker
            .getElement()
            ?.classList.add(
              'map-photo-marker-active',
            )
        })
      })

      marker.on('popupclose', () => {
        marker
          .getElement()
          ?.classList.remove(
            'map-photo-marker-active',
          )

        if (activeMarker === marker) {
          activeMarker = null
        }
      })

      bounds.push(position)
    },
  )

  if (bounds.length >= 2) {
    L.polyline(bounds, {
      weight:
        props.mode === 'preview'
          ? 2
          : 3,
      opacity: 0.7,
    }).addTo(markerLayer)
  }

  map.fitBounds(bounds, {
    padding:
      props.mode === 'preview'
        ? [20, 20]
        : [40, 40],
    maxZoom: 15,
  })
}

onMounted(() => {
  if (!mapElement.value) {
    return
  }

  isMapReady.value = false

  map = L.map(
    mapElement.value,
  ).setView(
    [36.5, 127.8],
    7,
  )

  const tileLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',
    },
  )

  tileLayer.once('load', () => {
    requestAnimationFrame(() => {
      map?.invalidateSize()
      isMapReady.value = true
    })
  })

  tileLayer.addTo(map)

  map.on('click', () => {
    map?.closePopup()
  })

  markerLayer =
    L.layerGroup().addTo(map)

  updateMarkers()
})

watch(
  () => props.photos,
  () => {
    updateMarkers()
  },
  {
    deep: true,
  },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  markerLayer = null
})
</script>

<template>
  <div
    class="trip-photo-map-wrapper"
    :class="{
      'trip-photo-map-wrapper-preview':
        mode === 'preview',
    }"
  >
    <div
      ref="mapElement"
      class="trip-photo-map"
      :class="{
        'trip-photo-map-ready': isMapReady,
      }"
    ></div>

    <div
      v-if="!isMapReady"
      class="map-loading"
    >
      지도를 불러오는 중입니다.
    </div>
  </div>
</template>

<style scoped>
.trip-photo-map-wrapper {
  position: relative;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  height: 620px;
  background: #f4f6f9;
}

.trip-photo-map-wrapper-preview {
  height: 610px;
  border-radius: 12px;
}

.trip-photo-map {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.trip-photo-map-ready {
  opacity: 1;
}

.trip-photo-map:not(.trip-photo-map-ready) {
  pointer-events: none;
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  font-size: 12px;
  color: #8a93a0;
  background: #f4f6f9;
}

.trip-photo-map :deep(.map-photo-popup) {
  display: flex;
  width: 150px;
  flex-direction: column;
  gap: 5px;
}

.trip-photo-map :deep(.map-photo-popup-image) {
  width: 150px;
  height: 100px;
  border-radius: 7px;
  object-fit: cover;
}

.trip-photo-map :deep(.map-photo-popup strong) {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trip-photo-map :deep(.map-photo-popup span) {
  font-size: 10px;
  color: #8a92a0;
}

.trip-photo-map :deep(.map-photo-popup-memo) {
  margin: 3px 0 0;
  padding-top: 6px;
  border-top: 1px solid #e6eaf2;
  font-size: 10px;
  line-height: 1.4;
  color: #596270;
}

.trip-photo-map :deep(.map-photo-order) {
  padding: 0;
  border: 0;
  box-shadow: none;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: transparent;
}

.trip-photo-map :deep(.map-photo-order::before) {
  display: none;
}

.trip-photo-map :deep(.map-photo-marker-wrapper) {
  border: 0;
  background: transparent;
}

.trip-photo-map :deep(.map-photo-marker) {
  position: relative;
  display: flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  border-radius: 50% 50% 50% 0;
  color: #ffffff;
  background: #3565f3;
  box-shadow: 0 2px 6px rgba(20, 26, 36, 0.28);
  transform: rotate(-45deg);
}

.trip-photo-map :deep(.map-photo-marker span) {
  font-size: 10px;
  font-weight: 500;
  transform: rotate(45deg);
}

.trip-photo-map
  :deep(
    .map-photo-marker-wrapper.map-photo-marker-active
    .map-photo-marker
  ) {
  box-shadow:
    0 0 0 4px rgba(53, 101, 243, 0.2),
    0 3px 8px rgba(20, 26, 36, 0.32);
  transform: rotate(-45deg) scale(1.15);
}

.trip-photo-map :deep(.map-photo-popup-order) {
  align-self: flex-start;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  color: #3565f3;
  background: #eef3ff;
}

@media (max-width: 760px) {
  .trip-photo-map-wrapper {
    height: 480px;
  }

  .trip-photo-map-wrapper-preview {
    height: 170px;
    border-radius: 8px;
  }

  .map-loading {
    font-size: 10px;
  }
}
</style>
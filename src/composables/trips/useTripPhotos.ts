import {
  computed,
  ref,
  type ComputedRef,
  type Ref,
} from 'vue'

import {
  deleteTripPhoto,
  updateTripPhotoLocation,
  updateTripPhotoMemo,
  updateTripPhotoTakenAt,
  uploadTripPhoto,
  type TripPhoto,
} from '@/api/trips'

export interface TimelineEntry {
  id: number
  time: string
  title: string
  thumbnailClass: string
  imageUrl: string
  memo: string | null
}

export interface TimelineGroup {
  dateLabel: string
  dayLabel: string
  entries: TimelineEntry[]
}

export interface PhotoItem {
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

export interface MapPhoto {
  id: number
  title: string
  latitude: number
  longitude: number
  imageUrl: string
  takenAt: string | null
  memo: string | null
}

interface UseTripPhotosOptions {
  tripId: ComputedRef<number | null>
  currentMemberId: number | null | undefined
  isOwner: ComputedRef<boolean>
  tripPhotoImageUrls: Ref<Record<number, string>>
  loadTripPhotoImageUrl: (
    photo: TripPhoto,
  ) => Promise<void>
  removeTripPhotoImageUrl: (
    photoId: number,
  ) => void
}

const timelineThumbnailClasses = [
  'thumb-blue',
  'thumb-green',
  'thumb-orange',
  'thumb-purple',
  'thumb-sky',
]

const weekdayLabels = [
  '(일)',
  '(월)',
  '(화)',
  '(수)',
  '(목)',
  '(금)',
  '(토)',
]

export function useTripPhotos({
  tripId,
  currentMemberId,
  isOwner,
  tripPhotoImageUrls,
  loadTripPhotoImageUrl,
  removeTripPhotoImageUrl,
}: UseTripPhotosOptions) {
  const tripPhotos = ref<TripPhoto[]>([])

  const formatPhotoTakenAt = (
    takenAt: string | null,
  ) => {
    if (!takenAt) {
      return '사진 기록'
    }

    return `${takenAt.slice(5, 10).replace('-', '.')} ${takenAt.slice(11, 16)}`
  }

  const timelineGroups = computed<TimelineGroup[]>(() => {
    const groups =
      new Map<string, TimelineEntry[]>()

    const sortedPhotos = [...tripPhotos.value]
      .filter((photo) => photo.takenAt)
      .sort((a, b) =>
        (a.takenAt ?? '').localeCompare(
          b.takenAt ?? '',
        ),
      )

    sortedPhotos.forEach((photo, index) => {
      if (!photo.takenAt) {
        return
      }

      const [datePart, timePart] =
        photo.takenAt.split('T')

      if (!datePart || !timePart) {
        return
      }

      const entries =
        groups.get(datePart) ?? []

      entries.push({
        id: photo.id,
        time: timePart.slice(0, 5),
        title:
          photo.locationName ?? '사진 기록',
        thumbnailClass:
          timelineThumbnailClasses[
            index % timelineThumbnailClasses.length
          ] ?? 'thumb-blue',
        imageUrl:
          tripPhotoImageUrls.value[
            photo.id
          ] ?? '',
        memo: photo.memo,
      })

      groups.set(datePart, entries)
    })

    return Array.from(
      groups.entries(),
    ).map(([datePart, entries]) => {
      const [
        yearText,
        monthText,
        dayText,
      ] = datePart.split('-')

      const date = new Date(
        Number(yearText),
        Number(monthText) - 1,
        Number(dayText),
      )

      return {
        dateLabel: `${monthText}.${dayText}`,
        dayLabel:
          weekdayLabels[date.getDay()] ?? '',
        entries,
      }
    })
  })

  const photos = computed<PhotoItem[]>(() =>
    tripPhotos.value.map((photo) => {
      const canManagePhoto =
        isOwner.value
        || photo.uploadedByMemberId
          === currentMemberId

      return {
        id: photo.id,
        title:
          formatPhotoTakenAt(
            photo.takenAt,
          ),
        location:
          photo.locationName
          ?? '위치 정보 없음',
        imageUrl:
          tripPhotoImageUrls.value[
            photo.id
          ] ?? '',
        memo: photo.memo,
        takenAt: photo.takenAt,
        latitude: photo.latitude,
        longitude: photo.longitude,
        canDelete: canManagePhoto,
        canEditMemo: canManagePhoto,
        canEditLocation: canManagePhoto,
      }
    }),
  )

  const mapPhotos = computed<MapPhoto[]>(() =>
    tripPhotos.value.flatMap((photo) => {
      if (
        photo.latitude === null
        || photo.longitude === null
      ) {
        return []
      }

      return [
        {
          id: photo.id,
          title:
            photo.locationName
            ?? '사진 기록',
          latitude: photo.latitude,
          longitude: photo.longitude,
          imageUrl:
            tripPhotoImageUrls.value[
              photo.id
            ] ?? '',
          takenAt: photo.takenAt,
          memo: photo.memo,
        },
      ]
    }),
  )

  const uploadPhotos = async (
    files: File[],
  ) => {
    const id = tripId.value

    if (id === null) {
      return []
    }

    const uploadedPhotos: TripPhoto[] = []

    for (const file of files) {
      const uploadedPhoto =
        await uploadTripPhoto(id, file)

      tripPhotos.value.push(uploadedPhoto)
      uploadedPhotos.push(uploadedPhoto)

      await loadTripPhotoImageUrl(uploadedPhoto)
    }

    return uploadedPhotos
  }

  const removePhotos = async (
    photoIds: number[],
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    for (const photoId of photoIds) {
      await deleteTripPhoto(
        id,
        photoId,
      )

      removeTripPhotoImageUrl(
        photoId,
      )
    }

    const deletedIds =
      new Set(photoIds)

    tripPhotos.value =
      tripPhotos.value.filter(
        (photo) =>
          !deletedIds.has(photo.id),
      )
  }

  const replacePhoto = (
    updatedPhoto: TripPhoto,
  ) => {
    tripPhotos.value =
      tripPhotos.value.map((photo) =>
        photo.id === updatedPhoto.id
          ? updatedPhoto
          : photo,
      )
  }

  const updatePhotoMemo = async (
    photoId: number,
    memo: string,
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    const updatedPhoto =
      await updateTripPhotoMemo(
        id,
        photoId,
        memo,
      )

    replacePhoto(updatedPhoto)
  }

  const updatePhotoTakenAt = async (
    photoId: number,
    takenAt: string | null,
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    const updatedPhoto =
      await updateTripPhotoTakenAt(
        id,
        photoId,
        takenAt,
      )

    replacePhoto(updatedPhoto)
  }

  const updatePhotoLocation = async (
    photoId: number,
    latitude: number,
    longitude: number,
    locationName: string | null,
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    const updatedPhoto =
      await updateTripPhotoLocation(
        id,
        photoId,
        latitude,
        longitude,
        locationName,
      )

    replacePhoto(updatedPhoto)
  }

  return {
    tripPhotos,
    timelineGroups,
    photos,
    mapPhotos,
    uploadPhotos,
    removePhotos,
    updatePhotoMemo,
    updatePhotoTakenAt,
    updatePhotoLocation,
  }
}
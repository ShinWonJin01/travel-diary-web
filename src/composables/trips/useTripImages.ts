import { onBeforeUnmount, ref, type ComputedRef } from 'vue'

import { apiBlobRequest } from '@/api/http'
import type { TripParticipant, TripPhoto } from '@/api/trips'

export function useTripImages(
  tripId: ComputedRef<number | null>,
) {
  const coverImageUrl = ref('')
  const tripPhotoImageUrls = ref<Record<number, string>>({})
  const participantProfileImageUrls = ref<Record<number, string>>({})

  const revokeObjectUrl = (url: string | null | undefined) => {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  const revokeCoverImageUrl = () => {
    revokeObjectUrl(coverImageUrl.value)
    coverImageUrl.value = ''
  }

  const revokeTripPhotoImageUrls = () => {
    Object.values(tripPhotoImageUrls.value).forEach(revokeObjectUrl)
    tripPhotoImageUrls.value = {}
  }

  const revokeParticipantProfileImageUrls = () => {
    Object.values(participantProfileImageUrls.value).forEach(revokeObjectUrl)
    participantProfileImageUrls.value = {}
  }

  const loadCoverImage = async (
    coverImagePath: string | null | undefined,
  ) => {
    revokeCoverImageUrl()

    const id = tripId.value

    if (id === null || !coverImagePath) {
      return
    }

    if (
      coverImagePath.startsWith('http://')
      || coverImagePath.startsWith('https://')
    ) {
      coverImageUrl.value = coverImagePath
      return
    }

    try {
      const blob = await apiBlobRequest(
        `/api/trips/${id}/cover-image/file`,
      )

      coverImageUrl.value = URL.createObjectURL(blob)
    } catch (error) {
      console.error(
        '여행 대표 이미지를 불러오지 못했습니다.',
        error,
      )
    }
  }

  const fetchTripPhotoImageUrl = async (
    id: number,
    photoId: number,
  ) => {
    try {
      const blob = await apiBlobRequest(
        `/api/trips/${id}/photos/${photoId}/file`,
      )

      return URL.createObjectURL(blob)
    } catch (error) {
      console.error(
        `사진 ${photoId}을 불러오지 못했습니다.`,
        error,
      )

      return ''
    }
  }

  const loadTripPhotoImageUrls = async (
    photos: TripPhoto[],
  ) => {
    revokeTripPhotoImageUrls()

    const id = tripId.value

    if (id === null || photos.length === 0) {
      return
    }

    const entries = await Promise.all(
      photos.map(async (photo) => [
        photo.id,
        await fetchTripPhotoImageUrl(id, photo.id),
      ] as const),
    )

    tripPhotoImageUrls.value = Object.fromEntries(entries)
  }

  const loadTripPhotoImageUrl = async (
    photo: TripPhoto,
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    revokeObjectUrl(
      tripPhotoImageUrls.value[photo.id],
    )

    const imageUrl = await fetchTripPhotoImageUrl(
      id,
      photo.id,
    )

    tripPhotoImageUrls.value = {
      ...tripPhotoImageUrls.value,
      [photo.id]: imageUrl,
    }
  }

  const removeTripPhotoImageUrl = (
    photoId: number,
  ) => {
    revokeObjectUrl(
      tripPhotoImageUrls.value[photoId],
    )

    const imageUrls = {
      ...tripPhotoImageUrls.value,
    }

    delete imageUrls[photoId]

    tripPhotoImageUrls.value = imageUrls
  }

  const loadParticipantProfileImageUrls = async (
    participants: TripParticipant[],
  ) => {
    revokeParticipantProfileImageUrls()

    const imageUrls: Record<number, string> = {}

    await Promise.all(
      participants.map(async (participant) => {
        const path = participant.profileImagePath

        if (!path) {
          imageUrls[participant.memberId] = ''
          return
        }

        if (
          path.startsWith('http://')
          || path.startsWith('https://')
        ) {
          imageUrls[participant.memberId] = path
          return
        }

        try {
          const blob = await apiBlobRequest(
            `/api/members/${participant.memberId}/profile-image/file`,
          )

          imageUrls[participant.memberId] =
            URL.createObjectURL(blob)
        } catch (error) {
          console.error(
            `참여자 ${participant.memberId}의 프로필 이미지를 불러오지 못했습니다.`,
            error,
          )

          imageUrls[participant.memberId] = ''
        }
      }),
    )

    participantProfileImageUrls.value = imageUrls
  }

  onBeforeUnmount(() => {
    revokeCoverImageUrl()
    revokeTripPhotoImageUrls()
    revokeParticipantProfileImageUrls()
  })

  return {
    coverImageUrl,
    tripPhotoImageUrls,
    participantProfileImageUrls,
    loadCoverImage,
    loadTripPhotoImageUrl,
    loadTripPhotoImageUrls,
    loadParticipantProfileImageUrls,
    removeTripPhotoImageUrl,
    revokeCoverImageUrl,
    revokeTripPhotoImageUrls,
    revokeParticipantProfileImageUrls,
  }
}
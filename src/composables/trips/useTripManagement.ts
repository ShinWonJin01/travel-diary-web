import {
  ref,
  type ComputedRef,
  type Ref,
} from 'vue'

import { ApiError } from '@/api/http'
import {
  deleteTrip,
  deleteTripCoverImage,
  leaveTrip,
  updateTrip,
  uploadTripCoverImage,
  type Trip,
} from '@/api/trips'

interface TripEditForm {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
  coverImageFile: File | null
  removeCoverImage: boolean
}

interface UseTripManagementOptions {
  tripId: ComputedRef<number | null>
  trip: Ref<Trip | null>
}

export function useTripManagement({
  tripId,
  trip,
}: UseTripManagementOptions) {
  const isTripEditModalOpen = ref(false)
  const isSavingTrip = ref(false)
  const tripEditErrorMessage = ref('')

  const openTripEdit = () => {
    tripEditErrorMessage.value = ''
    isTripEditModalOpen.value = true
  }

  const closeTripEdit = () => {
    if (isSavingTrip.value) {
      return
    }

    isTripEditModalOpen.value = false
    tripEditErrorMessage.value = ''
  }

  const updateCurrentTrip = async (
    form: TripEditForm,
  ) => {
    const id = tripId.value

    if (id === null) {
      return
    }

    if (!form.title) {
      tripEditErrorMessage.value =
        '여행 제목을 입력해 주세요.'
      return
    }

    if (!form.destination) {
      tripEditErrorMessage.value =
        '대표 지역을 입력해 주세요.'
      return
    }

    if (!form.startDate) {
      tripEditErrorMessage.value =
        '여행 시작일을 선택해 주세요.'
      return
    }

    if (
      form.endDate
      && form.endDate < form.startDate
    ) {
      tripEditErrorMessage.value =
        '종료일은 시작일보다 빠를 수 없습니다.'
      return
    }

    isSavingTrip.value = true
    tripEditErrorMessage.value = ''

    try {
      let updatedTrip = await updateTrip(id, {
        title: form.title,
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate || null,
        description: form.description,
      })

      if (form.coverImageFile) {
        updatedTrip = await uploadTripCoverImage(
          id,
          form.coverImageFile,
        )
      } else if (form.removeCoverImage) {
        updatedTrip = await deleteTripCoverImage(id)
      }

      trip.value = updatedTrip
      isTripEditModalOpen.value = false
    } catch (error: unknown) {
      tripEditErrorMessage.value =
        error instanceof ApiError
          ? error.message
          : '여행 정보를 수정하지 못했습니다.'
    } finally {
      isSavingTrip.value = false
    }
  }

  const deleteCurrentTrip = async () => {
    const id = tripId.value

    if (id === null) {
      return false
    }

    await deleteTrip(id)
    return true
  }

  const leaveCurrentTrip = async () => {
    const id = tripId.value

    if (id === null) {
      return false
    }

    await leaveTrip(id)
    return true
  }

  return {
    isTripEditModalOpen,
    isSavingTrip,
    tripEditErrorMessage,
    openTripEdit,
    closeTripEdit,
    updateCurrentTrip,
    deleteCurrentTrip,
    leaveCurrentTrip,
  }
}
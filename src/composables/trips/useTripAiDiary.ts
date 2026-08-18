import {
  ref,
  type ComputedRef,
} from 'vue'

import {
  generateTripAiDiary,
  getTripAiDiary,
  type TripAiDiary,
} from '@/api/trips'

interface UseTripAiDiaryOptions {
  tripId: ComputedRef<number | null>
}

export function useTripAiDiary({
  tripId,
}: UseTripAiDiaryOptions) {
  const aiDiary = ref<TripAiDiary | null>(null)
  const isGeneratingAiDiary = ref(false)

  const loadAiDiary = async () => {
    const id = tripId.value

    if (id === null) {
      aiDiary.value = null
      return
    }

    try {
      aiDiary.value =
        await getTripAiDiary(id)
    } catch {
      aiDiary.value = null
    }
  }

  const generateAiDiary = async () => {
    const id = tripId.value

    if (
      id === null
      || isGeneratingAiDiary.value
    ) {
      return
    }

    isGeneratingAiDiary.value = true

    try {
      aiDiary.value =
        await generateTripAiDiary(id)
    } finally {
      isGeneratingAiDiary.value = false
    }
  }

  const clearAiDiary = () => {
    aiDiary.value = null
  }

  return {
    aiDiary,
    isGeneratingAiDiary,
    loadAiDiary,
    generateAiDiary,
    clearAiDiary,
  }
}
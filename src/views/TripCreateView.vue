<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { ApiError } from '@/api/http'
import { createTrip, uploadTripCoverImage } from '@/api/trips'
import TripBasicInfoSection from '@/components/trips/create/TripBasicInfoSection.vue'
import TripCoverImageSection from '@/components/trips/create/TripCoverImageSection.vue'

interface TripForm {
  title: string
  startDate: string
  endDate: string
  isEndDateUnknown: boolean
  location: string
  description: string
}

const router = useRouter()

const tripForm = ref<TripForm>({
  title: '',
  startDate: '',
  endDate: '',
  isEndDateUnknown: false,
  location: '',
  description: '',
})

const selectedImage = ref<File | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleCoverImageChange = (file: File | null) => {
  selectedImage.value = file
}

const handleCoverImageError = (message: string) => {
  errorMessage.value = message
}

const validateForm = () => {
  const {
    title,
    startDate,
    endDate,
    isEndDateUnknown,
    location,
  } = tripForm.value

  if (!title.trim()) return '여행 제목을 입력해 주세요.'
  if (!startDate) return '여행 시작일을 선택해 주세요.'

  if (!isEndDateUnknown && !endDate) {
    return '여행 종료일을 선택하거나 종료일 미정을 체크해 주세요.'
  }

  if (!isEndDateUnknown && endDate < startDate) {
    return '종료일은 시작일보다 빠를 수 없습니다.'
  }

  if (!location.trim()) return '대표 지역을 입력해 주세요.'

  return ''
}

const handleCreateTrip = async () => {
  const validationMessage = validateForm()

  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  const {
    title,
    startDate,
    endDate,
    isEndDateUnknown,
    location,
    description,
  } = tripForm.value

  try {
    const createdTrip = await createTrip({
      title: title.trim(),
      destination: location.trim(),
      startDate,
      endDate: isEndDateUnknown ? null : endDate,
      description: description.trim(),
    })

    if (selectedImage.value) {
      try {
        await uploadTripCoverImage(createdTrip.id, selectedImage.value)
      } catch (error) {
        const uploadErrorMessage =
          error instanceof ApiError
            ? error.message
            : '대표 이미지를 업로드하지 못했습니다.'

        window.alert(
          `여행은 생성되었지만 대표 이미지 업로드에 실패했습니다.\n${uploadErrorMessage}`,
        )

        await router.push(`/trips/${createdTrip.id}`)
        return
      }
    }

    window.alert('여행이 생성되었습니다.')
    await router.push(`/trips/${createdTrip.id}`)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError
        ? error.message
        : '여행을 생성하는 중 오류가 발생했습니다.'
  } finally {
    isSubmitting.value = false
  }
}

const cancelCreate = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }

  void router.push('/trips')
}
</script>

<template>
  <section class="trip-create-page">
    <div class="desktop-page-heading">
      <p>CREATE TRIP</p>
      <h1>여행 만들기</h1>
    </div>

    <form class="trip-create-form" @submit.prevent="handleCreateTrip">
      <TripBasicInfoSection v-model="tripForm" />

      <TripCoverImageSection
        :selected-image="selectedImage"
        @change="handleCoverImageChange"
        @error="handleCoverImageError"
      />

      <p v-if="errorMessage" class="form-error" role="alert">
        {{ errorMessage }}
      </p>

      <div class="form-actions">
        <button
          class="cancel-button"
          type="button"
          :disabled="isSubmitting"
          @click="cancelCreate"
        >
          취소
        </button>

        <button
          class="submit-button"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '생성 중...' : '여행 만들기' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.trip-create-page {
  --form-input-height: 46px;
  --form-input-radius: 8px;

  padding: 42px 48px 72px;
}

.desktop-page-heading {
  margin-bottom: 32px;
}

.desktop-page-heading p {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--tmr-primary);
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: var(--tmr-text);
}

.trip-create-form {
  display: grid;
  width: 100%;
  gap: 22px;
}

.form-error {
  margin: 0;
  padding: 13px 15px;
  border: 1px solid var(--tmr-accent);
  border-radius: 8px;
  font-size: 12px;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 2px;
}

.form-actions button {
  height: 46px;
  padding: 0 26px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.form-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.cancel-button {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.cancel-button:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.submit-button {
  min-width: 128px;
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.submit-button:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.form-actions button:active:not(:disabled) {
  transform: scale(0.98);
}

@media (max-width: 760px) {
  .trip-create-page {
    --form-input-height: 42px;

    padding: 18px 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .trip-create-form {
    gap: 14px;
  }

  .form-error {
    padding: 11px 12px;
    font-size: 10px;
  }

  .form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .form-actions button {
    height: 43px;
    padding: 0 12px;
    font-size: 11px;
  }

  .submit-button {
    min-width: 0;
  }
}
</style>
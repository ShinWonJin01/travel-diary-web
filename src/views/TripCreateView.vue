<script setup lang="ts">
import {
  createTrip,
  uploadTripCoverImage,
} from '@/api/trips'
import { ApiError } from '@/api/http'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

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

const imageInput = ref<HTMLInputElement | null>(null)
const selectedImage = ref<File | null>(null)
const imagePreviewUrl = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const titleLength = computed(() => tripForm.value.title.length)
const descriptionLength = computed(() => tripForm.value.description.length)

const openImagePicker = () => {
  imageInput.value?.click()
}

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = '이미지 파일만 등록할 수 있습니다.'
    input.value = ''
    return
  }

  const maximumFileSize = 10 * 1024 * 1024

  if (file.size > maximumFileSize) {
    errorMessage.value = '대표 이미지는 10MB 이하로 등록해 주세요.'
    input.value = ''
    return
  }

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  selectedImage.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  errorMessage.value = ''
}

const removeImage = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  selectedImage.value = null
  imagePreviewUrl.value = ''

  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const handleEndDateUnknown = () => {
  tripForm.value.isEndDateUnknown = !tripForm.value.isEndDateUnknown

  if (tripForm.value.isEndDateUnknown) {
    tripForm.value.endDate = ''
  }
}

const validateForm = () => {
  if (!tripForm.value.title.trim()) {
    return '여행 제목을 입력해 주세요.'
  }

  if (!tripForm.value.startDate) {
    return '여행 시작일을 선택해 주세요.'
  }

  if (!tripForm.value.isEndDateUnknown && !tripForm.value.endDate) {
    return '여행 종료일을 선택하거나 종료일 미정을 체크해 주세요.'
  }

  if (!tripForm.value.isEndDateUnknown && tripForm.value.endDate < tripForm.value.startDate) {
    return '종료일은 시작일보다 빠를 수 없습니다.'
  }

  if (!tripForm.value.location.trim()) {
    return '대표 지역을 입력해 주세요.'
  }

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

  try {
    const createdTrip = await createTrip({
      title: tripForm.value.title.trim(),
      destination: tripForm.value.location.trim(),
      startDate: tripForm.value.startDate,

      endDate: tripForm.value.isEndDateUnknown
        ? null
        : tripForm.value.endDate,

      description: tripForm.value.description.trim(),
    })

    if (selectedImage.value) {
      try {
        await uploadTripCoverImage(
          createdTrip.id,
          selectedImage.value,
        )
      } catch (error: unknown) {
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
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      errorMessage.value = error.message
      return
    }

    errorMessage.value =
      '여행을 생성하는 중 오류가 발생했습니다.'
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

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
})
</script>

<template>
  <section class="trip-create-page">
    <!-- PC 화면 제목 -->
    <div class="desktop-page-heading">
      <p>CREATE TRIP</p>
      <h1>여행 만들기</h1>
    </div>

    <form class="trip-create-form" @submit.prevent="handleCreateTrip">
      <!-- 기본 정보 -->
      <section class="form-section">
        <div class="section-heading">
          <div>
            <h2>기본 정보</h2>
            <p>여행을 구분할 수 있는 기본 내용을 입력해 주세요.</p>
          </div>

          <span class="required-guide">
            <strong>*</strong>
            필수 입력
          </span>
        </div>

        <div class="form-grid">
          <div class="form-field form-field-full">
            <div class="field-heading">
              <label for="trip-title">
                여행 제목
                <strong>*</strong>
              </label>

              <span>{{ titleLength }}/30</span>
            </div>

            <input
              id="trip-title"
              v-model="tripForm.title"
              type="text"
              maxlength="30"
              placeholder="예: 제주도 가족여행"
            />
          </div>

          <div class="form-field">
            <label for="trip-start-date">
              시작일
              <strong>*</strong>
            </label>

            <input id="trip-start-date" v-model="tripForm.startDate" type="date" />
          </div>

          <div class="form-field">
            <label for="trip-end-date">
              종료일
              <strong v-if="!tripForm.isEndDateUnknown">*</strong>
            </label>

            <input
              id="trip-end-date"
              v-model="tripForm.endDate"
              type="date"
              :min="tripForm.startDate"
              :disabled="tripForm.isEndDateUnknown"
            />

            <button
              class="unknown-date-option"
              type="button"
              :class="{ checked: tripForm.isEndDateUnknown }"
              :aria-pressed="tripForm.isEndDateUnknown"
              @click="handleEndDateUnknown"
            >
              <span class="checkbox-icon">
                <svg v-if="tripForm.isEndDateUnknown" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>

              종료일 미정
            </button>
          </div>

          <div class="form-field form-field-full">
            <label for="trip-location">
              대표 지역
              <strong>*</strong>
            </label>

            <div class="location-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>

              <input
                id="trip-location"
                v-model="tripForm.location"
                type="text"
                maxlength="50"
                placeholder="예: 제주특별자치도"
              />
            </div>

            <p class="field-guide">세부 장소는 사진과 타임라인에서 나중에 추가할 수 있습니다.</p>
          </div>

          <div class="form-field form-field-full">
            <div class="field-heading">
              <label for="trip-description"> 한 줄 소개 </label>

              <span>{{ descriptionLength }}/100</span>
            </div>

            <textarea
              id="trip-description"
              v-model="tripForm.description"
              maxlength="100"
              rows="4"
              placeholder="이번 여행을 간단히 소개해 주세요."
            ></textarea>
          </div>
        </div>
      </section>

      <!-- 대표 이미지 -->
      <section class="form-section">
        <div class="section-heading">
          <div>
            <h2>대표 이미지</h2>
            <p>여행 기록 목록에 표시할 사진을 등록해 주세요.</p>
          </div>
        </div>

        <input
          ref="imageInput"
          class="hidden-file-input"
          type="file"
          accept="image/*"
          @change="handleImageChange"
        />

        <div v-if="imagePreviewUrl" class="image-preview">
          <img :src="imagePreviewUrl" alt="선택한 여행 대표 이미지" />

          <div class="image-preview-overlay">
            <button type="button" @click="openImagePicker">이미지 변경</button>

            <button class="remove-image-button" type="button" @click="removeImage">삭제</button>
          </div>
        </div>

        <button v-else class="image-upload-area" type="button" @click="openImagePicker">
          <span class="image-upload-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="m4 17 5-5 4 4 3-3 4 4" />
            </svg>
          </span>

          <strong>대표 이미지 추가</strong>
          <span>JPG, PNG 등 이미지 파일 · 최대 10MB</span>
        </button>
      </section>

      <p v-if="errorMessage" class="form-error" role="alert">
        {{ errorMessage }}
      </p>

      <div class="form-actions">
        <button class="cancel-button" type="button" :disabled="isSubmitting" @click="cancelCreate">
          취소
        </button>

        <button class="submit-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? '생성 중...' : '여행 만들기' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.trip-create-page {
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
  color: #4566e8;
}

.desktop-page-heading h1 {
  margin: 0;
  font-size: 30px;
  color: #1d2430;
}

.trip-create-form {
  display: grid;
  gap: 22px;
  width: 100%;
}

.form-section {
  padding: 26px;
  border: 1px solid #e3e8ef;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 18px rgba(37, 54, 78, 0.05);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #222934;
}

.section-heading p {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #8a929d;
}

.required-guide {
  flex-shrink: 0;
  font-size: 11px;
  color: #929aa5;
}

.required-guide strong,
.form-field label strong {
  color: #ef4b5d;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 23px 20px;
}

.form-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.form-field-full {
  grid-column: 1 / -1;
}

.field-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.form-field label {
  margin-bottom: 9px;
  font-size: 13px;
  font-weight: 700;
  color: #343b46;
}

.field-heading label {
  margin-bottom: 9px;
}

.field-heading > span {
  margin-bottom: 9px;
  font-size: 10px;
  color: #a1a8b1;
}

.form-field input,
.form-field textarea {
  width: 100%;
  border: 1px solid #dfe4eb;
  border-radius: 8px;
  outline: none;
  font: inherit;
  color: #303743;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field input {
  height: 46px;
  padding: 0 14px;
}

.form-field textarea {
  min-height: 112px;
  padding: 13px 14px;
  line-height: 1.6;
  resize: vertical;
}

.form-field input::placeholder,
.form-field textarea::placeholder {
  color: #b0b7c0;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: #5272ed;
  box-shadow: 0 0 0 3px rgba(82, 114, 237, 0.1);
}

.form-field input:disabled {
  color: #abb2bb;
  background: #f3f5f7;
  cursor: not-allowed;
}

.location-input {
  position: relative;
}

.location-input svg {
  position: absolute;
  top: 50%;
  left: 13px;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: #84909e;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  transform: translateY(-50%);
  pointer-events: none;
}

.location-input input {
  padding-left: 41px;
}

.field-guide {
  margin: 7px 0 0;
  font-size: 10px;
  color: #a0a7b0;
}

.unknown-date-option {
  display: flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  margin-top: 9px;
  padding: 0;
  border: 0;
  font-size: 11px;
  color: #747d89;
  background: transparent;
  cursor: pointer;
}

.checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #cbd1d9;
  border-radius: 4px;
  background: #ffffff;
}

.unknown-date-option.checked {
  color: #315ce8;
}

.unknown-date-option.checked .checkbox-icon {
  border-color: #315ce8;
  color: #ffffff;
  background: #315ce8;
}

.checkbox-icon svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

.hidden-file-input {
  display: none;
}

.image-upload-area {
  display: flex;
  width: 100%;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px dashed #cbd3de;
  border-radius: 11px;
  color: #76818e;
  background: #fafbfd;
  cursor: pointer;
}

.image-upload-area:hover {
  border-color: #6d86e8;
  background: #f7f9ff;
}

.image-upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 47px;
  height: 47px;
  border-radius: 50%;
  color: #5671dc;
  background: #eaf0ff;
}

.image-upload-icon svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.image-upload-area strong {
  font-size: 13px;
  color: #424b57;
}

.image-upload-area > span:last-child {
  font-size: 10px;
  color: #9ba3ad;
}

.image-preview {
  position: relative;
  height: 310px;
  overflow: hidden;
  border-radius: 11px;
  background: #edf1f5;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview-overlay {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 8px;
}

.image-preview-overlay button {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  color: #343c47;
  background: rgba(255, 255, 255, 0.94);
  cursor: pointer;
}

.image-preview-overlay .remove-image-button {
  color: #ffffff;
  background: rgba(42, 48, 58, 0.78);
}

.form-error {
  margin: 0;
  padding: 13px 15px;
  border: 1px solid #f3c5cb;
  border-radius: 8px;
  font-size: 12px;
  color: #c93d50;
  background: #fff5f6;
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
  cursor: pointer;
}

.form-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.cancel-button {
  border: 1px solid #d7dce4;
  color: #65707d;
  background: #ffffff;
}

.submit-button {
  min-width: 128px;
  border: 1px solid #405bf4;
  color: #ffffff;
  background: #405bf4;
}

.submit-button:hover:not(:disabled) {
  background: #304bea;
}

@media (max-width: 760px) {
  .trip-create-page {
    padding: 18px 17px 92px;
  }

  .desktop-page-heading {
    display: none;
  }

  .trip-create-form {
    gap: 14px;
  }

  .form-section {
    padding: 17px;
    border-radius: 11px;
    box-shadow: none;
  }

  .section-heading {
    margin-bottom: 19px;
  }

  .section-heading h2 {
    font-size: 14px;
  }

  .section-heading p {
    margin-top: 6px;
    font-size: 9px;
  }

  .required-guide {
    font-size: 8px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .form-field-full {
    grid-column: auto;
  }

  .form-field label {
    margin-bottom: 7px;
    font-size: 11px;
  }

  .field-heading label,
  .field-heading > span {
    margin-bottom: 7px;
  }

  .field-heading > span {
    font-size: 8px;
  }

  .form-field input {
    height: 42px;
    padding: 0 12px;
    font-size: 11px;
  }

  .form-field textarea {
    min-height: 96px;
    padding: 11px 12px;
    font-size: 11px;
  }

  .location-input input {
    padding-left: 38px;
  }

  .location-input svg {
    left: 12px;
    width: 16px;
    height: 16px;
  }

  .field-guide {
    font-size: 8px;
  }

  .unknown-date-option {
    font-size: 9px;
  }

  .checkbox-icon {
    width: 15px;
    height: 15px;
  }

  .image-upload-area {
    min-height: 150px;
  }

  .image-upload-icon {
    width: 41px;
    height: 41px;
  }

  .image-upload-icon svg {
    width: 21px;
    height: 21px;
  }

  .image-upload-area strong {
    font-size: 11px;
  }

  .image-upload-area > span:last-child {
    font-size: 8px;
  }

  .image-preview {
    height: 210px;
  }

  .image-preview-overlay {
    right: 10px;
    bottom: 10px;
  }

  .image-preview-overlay button {
    height: 31px;
    padding: 0 11px;
    font-size: 9px;
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

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'

interface TripEditForm {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
  coverImageFile: File | null
  removeCoverImage: boolean
}

const props = defineProps<{
  title: string
  destination: string
  startDate: string
  endDate: string | null
  description: string
  coverImageUrl?: string | null
  isSaving: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  save: [form: TripEditForm]
}>()

const form = reactive({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  description: '',
})

const fileInput = ref<HTMLInputElement | null>(null)
const coverPreviewUrl = ref<string | null>(null)
const coverImageFile = ref<File | null>(null)
const removeCoverImage = ref(false)

let objectUrl: string | null = null

const clearObjectUrl = () => {
  if (!objectUrl) return

  URL.revokeObjectURL(objectUrl)
  objectUrl = null
}

watch(
  () => [props.title, props.destination, props.startDate, props.endDate, props.description],
  () => {
    form.title = props.title
    form.destination = props.destination
    form.startDate = props.startDate
    form.endDate = props.endDate ?? ''
    form.description = props.description
  },
  { immediate: true },
)

watch(
  () => props.coverImageUrl,
  () => {
    clearObjectUrl()
    coverImageFile.value = null
    removeCoverImage.value = false
    coverPreviewUrl.value = props.coverImageUrl ?? null
  },
  { immediate: true },
)

const openCoverImagePicker = () => {
  fileInput.value?.click()
}

const handleCoverImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  clearObjectUrl()

  objectUrl = URL.createObjectURL(file)
  coverImageFile.value = file
  coverPreviewUrl.value = objectUrl
  removeCoverImage.value = false
  input.value = ''
}

const handleRemoveCoverImage = () => {
  clearObjectUrl()

  coverImageFile.value = null
  coverPreviewUrl.value = null
  removeCoverImage.value = Boolean(props.coverImageUrl)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSave = () => {
  emit('save', {
    title: form.title.trim(),
    destination: form.destination.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description.trim(),
    coverImageFile: coverImageFile.value,
    removeCoverImage: removeCoverImage.value,
  })
}

onBeforeUnmount(clearObjectUrl)
</script>

<template>
  <div class="trip-edit-backdrop" @click.self="emit('close')">
    <section class="trip-edit-modal">
      <div class="trip-edit-header">
        <div>
          <p>EDIT TRIP</p>
          <h2>여행 정보 수정</h2>
        </div>

        <button
          type="button"
          class="trip-edit-close"
          aria-label="닫기"
          :disabled="isSaving"
          @click="emit('close')"
        >
          ×
        </button>
      </div>

      <form class="trip-edit-form" @submit.prevent="handleSave">
        <div class="trip-edit-cover">
          <span class="trip-edit-label">대표 사진</span>

          <div class="trip-edit-cover-box">
            <img
              v-if="coverPreviewUrl"
              :src="coverPreviewUrl"
              alt="여행 대표 사진 미리보기"
            />

            <div v-else class="trip-edit-cover-empty">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="m4 17 5-5 4 4 2-2 5 4" />
              </svg>
              <p>등록된 대표 사진이 없습니다.</p>
            </div>
          </div>

          <div class="trip-edit-cover-actions">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              :disabled="isSaving"
              hidden
              @change="handleCoverImageChange"
            />

            <button
              type="button"
              class="trip-edit-cover-change"
              :disabled="isSaving"
              @click="openCoverImagePicker"
            >
              {{ coverPreviewUrl ? '사진 변경' : '사진 추가' }}
            </button>

            <button
              v-if="coverPreviewUrl"
              type="button"
              class="trip-edit-cover-remove"
              :disabled="isSaving"
              @click="handleRemoveCoverImage"
            >
              삭제
            </button>
          </div>
        </div>

        <label>
          <span>여행 제목</span>
          <input
            v-model="form.title"
            type="text"
            maxlength="100"
            placeholder="여행 제목을 입력해 주세요."
            :disabled="isSaving"
          />
        </label>

        <label>
          <span>대표 지역</span>
          <input
            v-model="form.destination"
            type="text"
            maxlength="100"
            placeholder="대표 지역을 입력해 주세요."
            :disabled="isSaving"
          />
        </label>

        <div class="trip-edit-date-row">
          <label>
            <span>시작일</span>
            <input v-model="form.startDate" type="date" :disabled="isSaving" />
          </label>

          <label>
            <span>종료일</span>
            <input v-model="form.endDate" type="date" :disabled="isSaving" />
          </label>
        </div>

        <label>
          <span>여행 소개</span>
          <textarea
            v-model="form.description"
            rows="5"
            maxlength="1000"
            placeholder="여행 소개를 입력해 주세요."
            :disabled="isSaving"
          ></textarea>
        </label>

        <p v-if="errorMessage" class="trip-edit-error">
          {{ errorMessage }}
        </p>

        <div class="trip-edit-actions">
          <button
            type="button"
            class="trip-edit-cancel"
            :disabled="isSaving"
            @click="emit('close')"
          >
            취소
          </button>

          <button type="submit" class="trip-edit-save" :disabled="isSaving">
            {{ isSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.trip-edit-backdrop {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(22, 29, 42, 0.48);
}

.trip-edit-modal {
  width: min(520px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 22px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(26, 36, 53, 0.24);
}

.trip-edit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.trip-edit-header p {
  margin: 0 0 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #4c6fea;
}

.trip-edit-header h2 {
  margin: 0;
  font-size: 20px;
  color: #222a36;
}

.trip-edit-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: #747e8c;
  background: #f3f5f8;
}

.trip-edit-form {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.trip-edit-form label {
  display: grid;
  gap: 7px;
}

.trip-edit-form label > span,
.trip-edit-label {
  font-size: 11px;
  font-weight: 700;
  color: #495362;
}

.trip-edit-form input,
.trip-edit-form textarea {
  width: 100%;
  padding: 0 12px;
  border: 1px solid #dce2ea;
  border-radius: 9px;
  outline: none;
  font-size: 12px;
  color: #2c3440;
  background: #ffffff;
}

.trip-edit-form input {
  height: 42px;
}

.trip-edit-form textarea {
  min-height: 120px;
  padding-top: 11px;
  padding-bottom: 11px;
  resize: vertical;
}

.trip-edit-form input:focus,
.trip-edit-form textarea:focus {
  border-color: #5878e9;
  box-shadow: 0 0 0 3px rgba(88, 120, 233, 0.11);
}

/* 대표 사진 */
.trip-edit-cover {
  display: grid;
  gap: 7px;
}

.trip-edit-cover-box {
  height: 150px;
  overflow: hidden;
  border: 1px solid #dce2ea;
  border-radius: 10px;
  background: #f7f9fb;
}

.trip-edit-cover-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-edit-cover-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #98a3b2;
}

.trip-edit-cover-empty svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: #9ba8b8;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.trip-edit-cover-empty p {
  margin: 8px 0 0;
  font-size: 10px;
}

.trip-edit-cover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 7px;
}

.trip-edit-cover-actions button {
  height: 32px;
  padding: 0 11px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
}

.trip-edit-cover-change {
  border: 1px solid #d9e1f8;
  color: #4265dc;
  background: #f6f8ff;
}

.trip-edit-cover-remove {
  border: 1px solid #e5e8ed;
  color: #737e8c;
  background: #ffffff;
}

.trip-edit-date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.trip-edit-error {
  margin: 0;
  font-size: 10px;
  color: #c74658;
}

.trip-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.trip-edit-actions button {
  height: 40px;
  padding: 0 16px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 700;
}

.trip-edit-cancel {
  border: 1px solid #dfe4eb;
  color: #5d6877;
  background: #ffffff;
}

.trip-edit-save {
  border: 0;
  color: #ffffff;
  background: #3565ef;
}

.trip-edit-actions button:disabled,
.trip-edit-cover-actions button:disabled,
.trip-edit-close:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 760px) {
  .trip-edit-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .trip-edit-modal {
    width: 100%;
    max-height: 88vh;
    padding: 18px 17px 22px;
    border-radius: 18px 18px 0 0;
  }

  .trip-edit-header h2 {
    font-size: 17px;
  }

  .trip-edit-cover-box {
    height: 130px;
  }

  .trip-edit-date-row {
    grid-template-columns: 1fr;
  }

  .trip-edit-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .trip-edit-actions button {
    width: 100%;
  }
}
</style>
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
  [
    () => props.title,
    () => props.destination,
    () => props.startDate,
    () => props.endDate,
    () => props.description,
  ],
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
          class="trip-edit-close"
          type="button"
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
              class="trip-edit-cover-change"
              type="button"
              :disabled="isSaving"
              @click="openCoverImagePicker"
            >
              {{ coverPreviewUrl ? '사진 변경' : '사진 추가' }}
            </button>

            <button
              v-if="coverPreviewUrl"
              class="trip-edit-cover-remove"
              type="button"
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
            <input
              v-model="form.startDate"
              type="date"
              :disabled="isSaving"
            />
          </label>

          <label>
            <span>종료일</span>
            <input
              v-model="form.endDate"
              type="date"
              :disabled="isSaving"
            />
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
            class="trip-edit-cancel"
            type="button"
            :disabled="isSaving"
            @click="emit('close')"
          >
            취소
          </button>

          <button
            class="trip-edit-save"
            type="submit"
            :disabled="isSaving"
          >
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
  border: 1px solid var(--tmr-border);
  border-radius: 16px;
  background: var(--tmr-surface);
  box-shadow: 0 24px 70px rgba(36, 48, 66, 0.22);
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
  color: var(--tmr-primary);
}

.trip-edit-header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--tmr-text);
}

.trip-edit-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  border-radius: 9px;
  font-size: 23px;
  line-height: 1;
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.trip-edit-close:hover:not(:disabled) {
  color: var(--tmr-primary);
  background: var(--tmr-background);
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
  color: var(--tmr-text);
}

.trip-edit-form input,
.trip-edit-form textarea {
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--tmr-border);
  border-radius: 9px;
  outline: none;
  font-size: 12px;
  color: var(--tmr-text);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.trip-edit-form input {
  height: 42px;
}

.trip-edit-form textarea {
  min-height: 120px;
  padding-top: 11px;
  padding-bottom: 11px;
  line-height: 1.6;
  resize: vertical;
}

.trip-edit-form input:focus,
.trip-edit-form textarea:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 12%, transparent);
}

.trip-edit-form input:disabled,
.trip-edit-form textarea:disabled {
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

.trip-edit-cover {
  display: grid;
  gap: 7px;
}

.trip-edit-cover-box {
  height: 150px;
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 10px;
  background: var(--tmr-surface-soft);
}

.trip-edit-cover-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trip-edit-cover-empty {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--tmr-text-sub);
}

.trip-edit-cover-empty svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: var(--tmr-primary);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
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
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.trip-edit-cover-change {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.trip-edit-cover-change:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  background: color-mix(
    in srgb,
    var(--tmr-primary) 12%,
    var(--tmr-surface)
  );
}

.trip-edit-cover-remove {
  border: 1px solid var(--tmr-border);
  color: #d94b5b;
  background: var(--tmr-surface);
}

.trip-edit-cover-remove:hover:not(:disabled) {
  border-color: #e5a0aa;
  background: #fff1f3;
}

.trip-edit-date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.trip-edit-error {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--tmr-accent);
  border-radius: 8px;
  font-size: 10px;
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
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
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.trip-edit-cancel {
  border: 1px solid var(--tmr-border);
  color: var(--tmr-text-sub);
  background: var(--tmr-surface);
}

.trip-edit-cancel:hover:not(:disabled) {
  border-color: var(--tmr-primary);
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.trip-edit-save {
  border: 1px solid var(--tmr-primary);
  color: var(--tmr-surface);
  background: var(--tmr-primary);
}

.trip-edit-save:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.trip-edit-actions button:active:not(:disabled) {
  transform: scale(0.98);
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
    border-right: 0;
    border-bottom: 0;
    border-left: 0;
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
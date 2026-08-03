<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

defineProps<{
  selectedImage: File | null
}>()

const emit = defineEmits<{
  change: [file: File | null]
  error: [message: string]
}>()

const MAX_COVER_IMAGE_SIZE = 10 * 1024 * 1024

const imageInput = ref<HTMLInputElement | null>(null)
const imagePreviewUrl = ref('')

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
    emit('error', '이미지 파일만 등록할 수 있습니다.')
    input.value = ''
    return
  }

  if (file.size > MAX_COVER_IMAGE_SIZE) {
    emit('error', '대표 이미지는 10MB 이하로 등록해 주세요.')
    input.value = ''
    return
  }

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  imagePreviewUrl.value = URL.createObjectURL(file)

  emit('change', file)
  emit('error', '')
}

const removeImage = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  imagePreviewUrl.value = ''

  if (imageInput.value) {
    imageInput.value.value = ''
  }

  emit('change', null)
}

onBeforeUnmount(() => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
})
</script>

<template>
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

    <div
      v-if="imagePreviewUrl"
      class="image-preview"
    >
      <img
        :src="imagePreviewUrl"
        alt="선택한 여행 대표 이미지"
      />

      <div class="image-preview-overlay">
        <button
          type="button"
          @click="openImagePicker"
        >
          이미지 변경
        </button>

        <button
          class="remove-image-button"
          type="button"
          @click="removeImage"
        >
          삭제
        </button>
      </div>
    </div>

    <button
      v-else
      class="image-upload-area"
      type="button"
      @click="openImagePicker"
    >
      <span class="image-upload-icon">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <circle cx="9" cy="10" r="2" />
          <path d="m4 17 5-5 4 4 3-3 4 4" />
        </svg>
      </span>

      <strong>대표 이미지 추가</strong>
      <span>JPG, PNG 등 이미지 파일 · 최대 10MB</span>
    </button>
  </section>
</template>

<style scoped>
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

@media (max-width: 760px) {
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
}
</style>
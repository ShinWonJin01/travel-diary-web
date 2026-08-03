<script setup lang="ts">
import { computed, watch } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'

import '@vuepic/vue-datepicker/dist/main.css'

interface TripForm {
  title: string
  startDate: string
  endDate: string
  isEndDateUnknown: boolean
  location: string
  description: string
}

const tripForm = defineModel<TripForm>({
  required: true,
})

const endDateMinimum = computed<Date | undefined>(() => {
  const startDate = tripForm.value.startDate

  if (!startDate) {
    return undefined
  }

  const parsedDate = new Date(`${startDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined
  }

  return parsedDate
})

watch(
  () => tripForm.value.startDate,
  (startDate) => {
    const endDate = tripForm.value.endDate

    if (!startDate || (endDate && endDate < startDate)) {
      tripForm.value.endDate = ''
    }
  },
)

const handleEndDateUnknown = () => {
  tripForm.value.isEndDateUnknown =
    !tripForm.value.isEndDateUnknown

  if (tripForm.value.isEndDateUnknown) {
    tripForm.value.endDate = ''
  }
}
</script>

<template>
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

          <span>{{ tripForm.title.length }}/30</span>
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

        <VueDatePicker
          id="trip-start-date"
          v-model="tripForm.startDate"
          model-type="yyyy-MM-dd"
          :time-config="{
            enableTimePicker: false,
            ignoreTimeValidation: true,
          }"
          :ui="{
            input: 'trip-date-input',
          }"
          auto-apply
          placeholder="시작일을 선택해 주세요."
        />
      </div>

      <div class="form-field">
        <label for="trip-end-date">
          종료일
          <strong v-if="!tripForm.isEndDateUnknown">*</strong>
        </label>

        <VueDatePicker
          id="trip-end-date"
          v-model="tripForm.endDate"
          model-type="yyyy-MM-dd"
          :time-config="{
            enableTimePicker: false,
            ignoreTimeValidation: true,
          }"
          :ui="{
            input: 'trip-date-input',
          }"
          :min-date="endDateMinimum"
          :disabled="tripForm.isEndDateUnknown || !tripForm.startDate"
          auto-apply
          placeholder="종료일을 선택해 주세요."
        />

        <button
          class="unknown-date-option"
          type="button"
          :class="{ checked: tripForm.isEndDateUnknown }"
          :aria-pressed="tripForm.isEndDateUnknown"
          @click="handleEndDateUnknown"
        >
          <span class="checkbox-icon">
            <svg
              v-if="tripForm.isEndDateUnknown"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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

        <p class="field-guide">
          세부 장소는 사진과 타임라인에서 나중에 추가할 수 있습니다.
        </p>
      </div>

      <div class="form-field form-field-full">
        <div class="field-heading">
          <label for="trip-description">
            한 줄 소개
          </label>

          <span>{{ tripForm.description.length }}/100</span>
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
  border-radius: var(--form-input-radius);
  outline: none;
  font: inherit;
  color: #303743;
  background: #ffffff;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field input {
  height: var(--form-input-height);
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

/* VueDatePicker를 일반 입력창과 동일하게 표시 */
.form-field :deep(.dp__main),
.form-field :deep(.dp__input_wrap) {
  width: 100%;
}

.form-field :deep(.dp__input_wrap) {
  height: var(--form-input-height);
}

.form-field :deep(.trip-date-input) {
  box-sizing: border-box !important;
  width: 100% !important;
  height: var(--form-input-height) !important;
  min-height: var(--form-input-height) !important;
  padding: 0 40px !important;
  border: 1px solid #dfe4eb !important;
  border-radius: var(--form-input-radius) !important;
  outline: none;
  font-family: inherit !important;
  font-size: inherit !important;
  line-height: normal !important;
  color: #303743 !important;
  background: #ffffff !important;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-field :deep(.trip-date-input::placeholder) {
  color: #b0b7c0 !important;
  opacity: 1;
}

.form-field :deep(.trip-date-input:focus) {
  border-color: #5272ed !important;
  box-shadow: 0 0 0 3px rgba(82, 114, 237, 0.1);
}

.form-field :deep(.trip-date-input:disabled) {
  color: #abb2bb !important;
  background: #f3f5f7 !important;
  cursor: not-allowed;
  opacity: 1;
}

.form-field :deep(.dp__input_icon) {
  left: 13px;
  width: 18px;
  height: 18px;
  color: #84909e;
}

.form-field :deep(.dp__clear_icon) {
  right: 13px;
  width: 18px;
  height: 18px;
  color: #84909e;
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
    height: var(--form-input-height);
    padding: 0 12px;
    font-size: 11px;
  }

  .form-field :deep(.trip-date-input) {
    height: var(--form-input-height) !important;
    min-height: var(--form-input-height) !important;
    padding: 0 36px !important;
    font-size: 11px !important;
  }

  .form-field :deep(.dp__input_icon) {
    left: 12px;
    width: 16px;
    height: 16px;
  }

  .form-field :deep(.dp__clear_icon) {
    right: 12px;
    width: 16px;
    height: 16px;
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
}
</style>
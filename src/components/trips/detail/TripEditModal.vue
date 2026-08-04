<script setup lang="ts">
import { reactive, watch } from 'vue'

interface TripEditForm {
  title: string
  destination: string
  startDate: string
  endDate: string
  description: string
}

const props = defineProps<{
  title: string
  destination: string
  startDate: string
  endDate: string | null
  description: string
  isSaving: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  save: [form: TripEditForm]
}>()

const form = reactive<TripEditForm>({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  description: '',
})

watch(
  () => [
    props.title,
    props.destination,
    props.startDate,
    props.endDate,
    props.description,
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

const handleSave = () => {
  emit('save', {
    title: form.title.trim(),
    destination: form.destination.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description.trim(),
  })
}
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
            type="button"
            class="trip-edit-cancel"
            :disabled="isSaving"
            @click="emit('close')"
          >
            취소
          </button>

          <button
            type="submit"
            class="trip-edit-save"
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

.trip-edit-form label > span {
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
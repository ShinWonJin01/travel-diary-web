<script setup lang="ts">
defineProps<{
  content: string | null
  isGenerating: boolean
  isOwner: boolean
}>()

const emit = defineEmits<{
  generate: []
}>()
</script>

<template>
  <section class="panel-card ai-panel">
    <div class="panel-heading">
      <h2>AI 여행기</h2>
    </div>

    <div class="ai-box">
      <div class="ai-badge">AI</div>

      <div class="ai-content">
        <template v-if="content">
          <strong>AI가 작성한 여행기</strong>
          <p class="ai-diary-content">{{ content }}</p>

          <button
            v-if="isOwner"
            type="button"
            class="primary-action-button"
            :disabled="isGenerating"
            @click="emit('generate')"
          >
            {{ isGenerating ? '여행기 생성 중...' : 'AI 여행기 다시 만들기' }}
          </button>
        </template>

        <template v-else>
          <strong>사진과 타임라인을 바탕으로 여행기를 생성해보세요.</strong>

          <p>
            사진, 장소, 시간, 메모를 종합하여 자연스러운 여행 기록을 자동으로 만들어줍니다.
          </p>

          <button
            v-if="isOwner"
            type="button"
            class="primary-action-button"
            :disabled="isGenerating"
            @click="emit('generate')"
          >
            {{ isGenerating ? '여행기 생성 중...' : 'AI 여행기 만들기' }}
          </button>

          <p v-else class="ai-owner-guide">
            여행 소유자만 AI 여행기를 생성할 수 있습니다.
          </p>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  padding: 18px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #222834;
}

.ai-panel { padding-bottom: 22px; }

.ai-box {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  padding: 24px;
  border-radius: 14px;
  background: linear-gradient(145deg, #eef2ff, #fafbff);
}

.ai-badge {
  display: grid;
  width: 100px;
  height: 100px;
  place-items: center;
  border-radius: 24px;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  background: linear-gradient(145deg, #5c79f0, #7d63c9);
}

.ai-diary-content { white-space: pre-wrap; }

.ai-content strong {
  font-size: 18px;
  color: #252b37;
}

.ai-content p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #6e7887;
}

.ai-owner-guide {
  font-weight: 600;
  color: #8a93a2;
}

.primary-action-button {
  height: 44px;
  margin-top: 18px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: #3565f3;
  cursor: pointer;
}

.primary-action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading { margin-bottom: 10px; }
  .panel-heading h2 { font-size: 14px; }

  .ai-box {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 15px;
  }

  .ai-badge {
    width: 58px;
    height: 58px;
    border-radius: 15px;
    font-size: 18px;
  }

  .ai-content strong {
    font-size: 13px;
    line-height: 1.5;
  }

  .ai-content p {
    margin-top: 7px;
    font-size: 10px;
  }

  .primary-action-button {
    height: 39px;
    margin-top: 13px;
    font-size: 11px;
  }
}
</style>
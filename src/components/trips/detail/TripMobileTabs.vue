<script setup lang="ts">
type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'

interface TabItem {
  id: TripTab
  label: string
}

defineProps<{
  activeTab: TripTab
}>()

const emit = defineEmits<{
  change: [tab: TripTab]
}>()

const tabs: TabItem[] = [
  { id: 'overview', label: '개요' },
  { id: 'timeline', label: '타임라인' },
  { id: 'photos', label: '사진' },
  { id: 'map', label: '지도' },
  { id: 'ai-diary', label: 'AI 여행기' },
]
</script>

<template>
  <nav
    class="mobile-tabs"
    aria-label="여행 상세 메뉴"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="{ active: activeTab === tab.id }"
      @click="emit('change', tab.id)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<style scoped>
.mobile-tabs {
  display: none;
}

@media (max-width: 760px) {
  .mobile-tabs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    overflow: visible;
    padding: 0 8px;
    border-bottom: 1px solid #e7ebf1;
    background: #ffffff;
  }

  .mobile-tabs button {
    position: relative;
    min-width: 0;
    height: 38px;
    overflow: hidden;
    padding: 0 2px;
    border: 0;
    font-size: 10px;
    font-weight: 600;
    color: #8993a1;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: transparent;
    cursor: pointer;
  }

  .mobile-tabs button.active {
    color: #3163ed;
  }

  .mobile-tabs button.active::after {
    position: absolute;
    right: 8px;
    bottom: 0;
    left: 8px;
    height: 2px;
    border-radius: 2px 2px 0 0;
    background: #3163ed;
    content: '';
  }
}
</style>
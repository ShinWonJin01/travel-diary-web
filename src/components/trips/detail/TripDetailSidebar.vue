<script setup lang="ts">
type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'

interface TabItem {
  id: TripTab
  label: string
  icon: string
}

defineProps<{
  tripTitle: string
  activeTab: TripTab
}>()

const emit = defineEmits<{
  change: [tab: TripTab]
}>()

const tabs: TabItem[] = [
  { id: 'overview', label: '개요', icon: 'home' },
  { id: 'timeline', label: '타임라인', icon: 'timeline' },
  { id: 'photos', label: '사진', icon: 'photo' },
  { id: 'map', label: '지도', icon: 'map' },
  { id: 'ai-diary', label: 'AI 여행기', icon: 'sparkles' },
]

const getTabIconPath = (icon: string) => {
  switch (icon) {
    case 'home':
      return 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z'

    case 'timeline':
      return 'M6 5v14M18 5v14M8 8h8M8 12h5M8 16h7'

    case 'photo':
      return 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm3 2.5a1.5 1.5 0 1 0 0 .01ZM5.5 17l4.5-4.5 3 3 2.5-2.5 3 4'

    case 'map':
      return 'm3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zm6-2v14m6-12v14'

    case 'sparkles':
      return 'm12 3 1.8 4.7L18.5 9 13.8 10.3 12 15l-1.8-4.7L5.5 9l4.7-1.3zm6.5 9.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1zm-13 2 1.1 2.9L10 18.5l-2.9 1.1L6 22.5l-1.1-2.9L2 18.5l2.9-1.1z'

    default:
      return ''
  }
}
</script>

<template>
  <aside class="detail-sidebar">
    <div class="sidebar-trip-info">
      <h1>{{ tripTitle }}</h1>
    </div>

    <nav
      class="sidebar-tabs"
      aria-label="여행 상세 메뉴"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        @click="emit('change', tab.id)"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path :d="getTabIconPath(tab.icon)" />
        </svg>

        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 18px;
  border: 1px solid #e6eaf2;
  border-radius: 14px;
  background: #ffffff;
}

.sidebar-trip-info h1 {
  margin: 0;
  font-size: 20px;
  color: #212734;
}

.sidebar-tabs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-tabs button {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #687383;
  background: transparent;
  cursor: pointer;
}

.sidebar-tabs button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.sidebar-tabs button.active {
  color: #3160ee;
  background: #eef3ff;
}

@media (max-width: 760px) {
  .detail-sidebar {
    display: none;
  }
}
</style>
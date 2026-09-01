<script setup lang="ts">
type TripTab = 'overview' | 'timeline' | 'photos' | 'map' | 'ai-diary'
type TabIcon = 'home' | 'timeline' | 'photo' | 'map' | 'sparkles'

interface TabItem {
  id: TripTab
  label: string
  icon: TabIcon
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

const tabIconPaths: Record<TabIcon, string> = {
  home:
    'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  timeline:
    'M6 5v14M18 5v14M8 8h8M8 12h5M8 16h7',
  photo:
    'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm3 2.5a1.5 1.5 0 1 0 0 .01ZM5.5 17l4.5-4.5 3 3 2.5-2.5 3 4',
  map:
    'm3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2zm6-2v14m6-12v14',
  sparkles:
    'm12 3 1.8 4.7L18.5 9 13.8 10.3 12 15l-1.8-4.7L5.5 9l4.7-1.3zm6.5 9.5 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1zm-13 2 1.1 2.9L10 18.5l-2.9 1.1L6 22.5l-1.1-2.9L2 18.5l2.9-1.1z',
}
</script>

<template>
  <aside class="detail-sidebar">
    <div class="sidebar-trip-info">
      <h1>{{ tripTitle }}</h1>
    </div>

    <nav class="sidebar-tabs" aria-label="여행 상세 메뉴">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="{ active: activeTab === tab.id }"
        :aria-pressed="activeTab === tab.id"
        @click="emit('change', tab.id)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path :d="tabIconPaths[tab.icon]" />
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
  border: 1px solid var(--tmr-border);
  border-radius: 14px;
  background: var(--tmr-surface);
}

.sidebar-trip-info {
  padding: 2px 6px 12px;
  border-bottom: 1px solid var(--tmr-border);
}

.sidebar-trip-info h1 {
  overflow: hidden;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: var(--tmr-text-sub);
  background: transparent;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.sidebar-tabs button:hover {
  color: var(--tmr-primary);
  background: var(--tmr-background);
}

.sidebar-tabs button.active {
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.sidebar-tabs button svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

@media (max-width: 760px) {
  .detail-sidebar {
    display: none;
  }
}
</style>
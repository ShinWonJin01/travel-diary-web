<script setup lang="ts">
type InvitationTab = 'received' | 'sent'

defineProps<{
  activeTab: InvitationTab
}>()

const emit = defineEmits<{
  change: [tab: InvitationTab]
}>()
</script>

<template>
  <div class="invitation-tabs">
    <button
      type="button"
      :class="{ active: activeTab === 'received' }"
      :aria-pressed="activeTab === 'received'"
      @click="emit('change', 'received')"
    >
      받은 초대
    </button>

    <button
      type="button"
      :class="{ active: activeTab === 'sent' }"
      :aria-pressed="activeTab === 'sent'"
      @click="emit('change', 'sent')"
    >
      보낸 초대
    </button>
  </div>
</template>

<style scoped>
.invitation-tabs {
  display: grid;
  grid-template-columns: repeat(2, 160px);
  border-bottom: 1px solid var(--tmr-border);
}

.invitation-tabs button {
  position: relative;
  height: 48px;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--tmr-text-sub);
  background: transparent;
  transition: color 0.2s ease;
}

.invitation-tabs button:hover {
  color: var(--tmr-primary);
}

.invitation-tabs button.active {
  color: var(--tmr-primary);
}

.invitation-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  content: '';
  background: var(--tmr-primary);
}

@media (max-width: 760px) {
  .invitation-tabs {
    grid-template-columns: repeat(2, 1fr);
    margin: 0 -17px;
    padding: 0 17px;
  }

  .invitation-tabs button {
    height: 46px;
    font-size: 11px;
  }
}
</style>
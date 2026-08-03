<script setup lang="ts">
type InvitationTab = 'received' | 'sent'

defineProps<{
  activeTab: InvitationTab
}>()

const emit = defineEmits<{
  change: [tab: InvitationTab]
}>()

const handleTabClick = (tab: InvitationTab) => {
  emit('change', tab)
}
</script>

<template>
  <div class="invitation-tabs">
    <button
      type="button"
      :class="{ active: activeTab === 'received' }"
      :aria-pressed="activeTab === 'received'"
      @click="handleTabClick('received')"
    >
      받은 초대
    </button>

    <button
      type="button"
      :class="{ active: activeTab === 'sent' }"
      :aria-pressed="activeTab === 'sent'"
      @click="handleTabClick('sent')"
    >
      보낸 초대
    </button>
  </div>
</template>

<style scoped>
.invitation-tabs {
  display: grid;
  grid-template-columns: repeat(2, 160px);
  border-bottom: 1px solid #e4e8ee;
}

.invitation-tabs button {
  position: relative;
  height: 48px;
  padding: 0;
  border: 0;
  font-size: 14px;
  font-weight: 600;
  color: #9299a4;
  background: transparent;
  cursor: pointer;
}

.invitation-tabs button.active {
  color: #3264ed;
}

.invitation-tabs button.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #3264ed;
  content: '';
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
<script setup lang="ts">
defineProps<{
  totalCount: number
  ownedCount: number
  participatingCount: number
}>()
</script>

<template>
  <section class="trip-summary">
    <div class="summary-item">
      <strong>{{ totalCount }}</strong>
      <span>전체 여행</span>
    </div>

    <div class="summary-divider"></div>

    <div class="summary-item">
      <strong>{{ ownedCount }}</strong>
      <span>내가 만든 여행</span>
    </div>

    <div class="summary-divider"></div>

    <div class="summary-item">
      <strong>{{ participatingCount }}</strong>
      <span>참여 중</span>
    </div>
  </section>
</template>

<style scoped>
.trip-summary {
  display: grid;
  grid-template-columns: 1fr 1px 1fr 1px 1fr;
  align-items: center;
  margin-top: 18px;
  padding: 20px;
  border: 1px solid #e3e8ef;
  border-radius: 12px;
  background: #ffffff;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.summary-item strong {
  font-size: 20px;
  color: #315ce8;
}

.summary-item span {
  font-size: 12px;
  color: #7e8794;
}

.summary-divider {
  width: 1px;
  height: 34px;
  background: #e5e9ef;
}

@media (max-width: 760px) {
  .trip-summary {
    margin-top: 13px;
    padding: 16px 7px;
  }

  .summary-item {
    gap: 5px;
  }

  .summary-item strong {
    font-size: 16px;
  }

  .summary-item span {
    font-size: 9px;
  }

  .summary-divider {
    height: 28px;
  }
}
</style>
<template>
  <section class="create-trip-page">
    <h1>새 여행 만들기</h1>
    <p>다음 단계에서 여행 이름과 기간 입력 화면을 구현합니다.</p>
  </section>
</template>

<style scoped>
.create-trip-page {
  padding: 48px;
}

.create-trip-page h1 {
  margin: 0 0 12px;
}

.create-trip-page p {
  color: #79818d;
}

@media (max-width: 760px) {
  .create-trip-page {
    padding: 28px 18px 92px;
  }

  .create-trip-page h1 {
    display: none;
  }
}
</style>

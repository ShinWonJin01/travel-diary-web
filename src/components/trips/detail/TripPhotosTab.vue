<script setup lang="ts">
interface PhotoItem {
  id: number
  title: string
  location: string
  className: string
}

defineProps<{
  photos: PhotoItem[]
}>()
</script>

<template>
  <section class="panel-card">
    <div class="panel-heading">
      <h2>사진</h2>
    </div>

    <div class="photo-grid">
      <article
        v-for="photo in photos"
        :key="photo.id"
        class="photo-card"
        :class="photo.className"
      >
        <div class="photo-overlay">
          <strong>{{ photo.title }}</strong>
          <span>{{ photo.location }}</span>
        </div>
      </article>
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

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.photo-card {
  position: relative;
  min-height: 200px;
  overflow: hidden;
  border-radius: 14px;
}

.photo-blue {
  background: linear-gradient(145deg, #89bbe1, #4e7aa9);
}

.photo-green {
  background: linear-gradient(145deg, #9ac7a3, #61896c);
}

.photo-orange {
  background: linear-gradient(145deg, #f0b98d, #b57753);
}

.photo-purple {
  background: linear-gradient(145deg, #bfaedc, #796aab);
}

.photo-sky {
  background: linear-gradient(145deg, #93d4ed, #689dc4);
}

.photo-gray {
  background: linear-gradient(145deg, #c9ced8, #7f8795);
}

.photo-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 34px 14px 14px;
  color: #ffffff;
  background: linear-gradient(
    transparent,
    rgba(19, 27, 39, 0.7)
  );
}

.photo-overlay strong {
  display: block;
  font-size: 13px;
}

.photo-overlay span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
}

@media (max-width: 760px) {
  .panel-card {
    margin: 10px 10px 0;
    padding: 12px 11px;
    border-radius: 10px;
  }

  .panel-heading {
    margin-bottom: 10px;
  }

  .panel-heading h2 {
    font-size: 14px;
  }

  .photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .photo-card {
    min-height: 120px;
    border-radius: 8px;
  }

  .photo-overlay {
    padding: 28px 10px 10px;
  }

  .photo-overlay strong {
    font-size: 10px;
  }

  .photo-overlay span {
    margin-top: 3px;
    font-size: 8px;
  }
}
</style>
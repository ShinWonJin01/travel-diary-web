<script setup lang="ts">
import type { PhotoItem } from '@/composables/trips/useTripPhotos'

defineProps<{
  photo: PhotoItem
  isSelectionMode: boolean
  isSelected: boolean
  isMenuOpen: boolean
}>()

const emit = defineEmits<{
  click: []
  'toggle-menu': []
  edit: []
  delete: []
  'toggle-selection': []
}>()
</script>

<template>
  <article
    class="photo-card"
    :class="{ 'photo-card-selected': isSelected }"
    @click="emit('click')"
  >
    <img
      class="photo-card-image"
      :src="photo.imageUrl"
      :alt="photo.title"
    />

    <button
      v-if="
        !isSelectionMode &&
        (
          photo.canEditMemo ||
          photo.canEditLocation ||
          photo.canDelete
        )
      "
      class="photo-menu-button"
      type="button"
      :aria-label="`${photo.title} 메뉴`"
      @click.stop="emit('toggle-menu')"
    >
      ⋯
    </button>

    <div
      v-if="!isSelectionMode && isMenuOpen"
      class="photo-menu"
      @click.stop
    >
      <button
        type="button"
        @click="emit('edit')"
      >
        수정
      </button>

      <button
        v-if="photo.canDelete"
        class="delete"
        type="button"
        @click="emit('delete')"
      >
        삭제
      </button>
    </div>

    <button
      v-if="isSelectionMode && photo.canDelete"
      class="photo-select-check"
      :class="{ selected: isSelected }"
      type="button"
      :aria-label="`${photo.title} 선택`"
      @click.stop="emit('toggle-selection')"
    >
      <span v-if="isSelected">✓</span>
    </button>

    <div class="photo-overlay">
      <strong>{{ photo.title }}</strong>
      <span>{{ photo.location }}</span>

      <p
        v-if="photo.memo"
        class="photo-memo-text"
      >
        {{ photo.memo }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.photo-card {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 14px;
  cursor: pointer;
}

.photo-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.photo-card:hover .photo-card-image {
  transform: scale(1.02);
}

.photo-menu-button {
  position: absolute;
  top: 9px;
  right: 9px;
  z-index: 3;
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.65);
  cursor: pointer;
}

.photo-menu-button:hover {
  background: rgba(20, 26, 36, 0.85);
}

.photo-menu {
  position: absolute;
  top: 42px;
  right: 9px;
  z-index: 4;
  min-width: 80px;
  overflow: hidden;
  border: 1px solid #e1e5ec;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(20, 26, 36, 0.18);
}

.photo-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 0;
  font-size: 11px;
  text-align: left;
  color: #454d59;
  background: #ffffff;
  cursor: pointer;
}

.photo-menu button:hover {
  background: #f5f7fa;
}

.photo-menu .delete {
  color: #e5484d;
}

.photo-select-check {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 2px solid #ffffff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 800;
  color: #ffffff;
  background: rgba(20, 26, 36, 0.4);
  cursor: pointer;
}

.photo-select-check.selected {
  border-color: #405bf4;
  background: #405bf4;
}

.photo-card-selected::after {
  position: absolute;
  inset: 0;
  border: 3px solid #405bf4;
  border-radius: inherit;
  content: '';
  pointer-events: none;
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
    rgba(19, 27, 39, 0.78)
  );
}

.photo-overlay strong {
  display: block;
  font-size: 13px;
}

.photo-overlay > span {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
}

.photo-memo-text {
  overflow: hidden;
  margin: 5px 0 0;
  font-size: 10px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .photo-card {
    height: 120px;
    border-radius: 8px;
  }

  .photo-menu-button {
    top: 7px;
    right: 7px;
    width: 24px;
    height: 24px;
    font-size: 16px;
  }

  .photo-menu {
    top: 35px;
    right: 7px;
  }

  .photo-menu button {
    padding: 7px 10px;
    font-size: 10px;
  }

  .photo-select-check {
    top: 7px;
    right: 7px;
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .photo-overlay {
    padding: 28px 10px 10px;
  }

  .photo-overlay strong {
    font-size: 10px;
  }

  .photo-overlay > span {
    margin-top: 3px;
    font-size: 8px;
  }

  .photo-memo-text {
    margin-top: 3px;
    font-size: 8px;
  }
}
</style>
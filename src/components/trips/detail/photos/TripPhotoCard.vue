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

const hasPhotoMenu = (photo: PhotoItem) =>
  photo.canEditMemo || photo.canEditLocation || photo.canDelete
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
      v-if="!isSelectionMode && hasPhotoMenu(photo)"
      class="photo-menu-button"
      type="button"
      :aria-label="`${photo.title} 메뉴`"
      aria-haspopup="menu"
      :aria-expanded="isMenuOpen"
      @click.stop="emit('toggle-menu')"
    >
      ⋯
    </button>

    <div
      v-if="!isSelectionMode && isMenuOpen"
      class="photo-menu"
      role="menu"
      @click.stop
    >
      <button
        type="button"
        role="menuitem"
        @click="emit('edit')"
      >
        수정
      </button>

      <button
        v-if="photo.canDelete"
        class="delete"
        type="button"
        role="menuitem"
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
      :aria-pressed="isSelected"
      @click.stop="emit('toggle-selection')"
    >
      <span v-if="isSelected">✓</span>
    </button>

    <div class="photo-overlay">
      <strong>{{ photo.title }}</strong>
      <span>{{ photo.location }}</span>

      <p v-if="photo.memo" class="photo-memo-text">
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
  background: var(--tmr-surface-soft);
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
  background: rgba(36, 48, 66, 0.68);
  transition: background 0.2s ease;
}

.photo-menu-button:hover {
  background: rgba(36, 48, 66, 0.88);
}

.photo-menu {
  position: absolute;
  top: 42px;
  right: 9px;
  z-index: 4;
  min-width: 80px;
  overflow: hidden;
  padding: 4px;
  border: 1px solid var(--tmr-border);
  border-radius: 8px;
  background: var(--tmr-surface);
  box-shadow: 0 6px 18px rgba(36, 48, 66, 0.16);
}

.photo-menu button {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 5px;
  font-size: 11px;
  color: var(--tmr-text);
  text-align: left;
  background: transparent;
}

.photo-menu button:hover {
  background: var(--tmr-surface-soft);
}

.photo-menu .delete {
  color: #d94b5b;
}

.photo-menu .delete:hover {
  background: #fff1f3;
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
  background: rgba(36, 48, 66, 0.45);
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.photo-select-check.selected {
  border-color: var(--tmr-primary);
  background: var(--tmr-primary);
}

.photo-card-selected::after {
  position: absolute;
  inset: 0;
  border: 3px solid var(--tmr-primary);
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
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-overlay > span {
  display: block;
  overflow: hidden;
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.82);
  text-overflow: ellipsis;
  white-space: nowrap;
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
    padding: 7px 9px;
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
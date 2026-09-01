<script setup lang="ts">
import { ref } from 'vue'

import {
  searchLocations,
  type LocationSearchResult,
} from '@/api/geocoding'
import { ApiError } from '@/api/http'

const emit = defineEmits<{
  select: [location: LocationSearchResult]
}>()

const searchQuery = ref('')
const searchResults = ref<LocationSearchResult[]>([])
const isSearching = ref(false)
const searchError = ref('')
const hasSearched = ref(false)

const getSearchErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (error.status === 401) {
    return '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.'
  }

  if (error.status >= 500) {
    return '장소 검색 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  }

  return '장소 검색에 실패했습니다. 다시 시도해 주세요.'
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    searchError.value = ''
    hasSearched.value = false
    return
  }

  isSearching.value = true
  searchError.value = ''
  hasSearched.value = true

  try {
    searchResults.value = await searchLocations(query)
  } catch (error) {
    console.error('장소 검색 실패:', error)

    searchResults.value = []
    searchError.value = getSearchErrorMessage(error)
  } finally {
    isSearching.value = false
  }
}

const selectLocation = (location: LocationSearchResult) => {
  emit('select', location)

  searchQuery.value = location.name
  searchResults.value = []
  searchError.value = ''
  hasSearched.value = false
}
</script>

<template>
  <div class="location-search">
    <form
      class="location-search-form"
      @submit.prevent="handleSearch"
    >
      <input
        v-model="searchQuery"
        class="location-search-input"
        type="text"
        placeholder="장소명이나 주소를 입력하세요"
        autocomplete="off"
        aria-label="장소 검색"
      />

      <button
        class="location-search-button"
        type="submit"
        :disabled="isSearching"
      >
        {{ isSearching ? '검색 중...' : '검색' }}
      </button>
    </form>

    <div
      v-if="searchError"
      class="location-search-message error"
      role="alert"
    >
      {{ searchError }}
    </div>

    <div
      v-else-if="
        hasSearched &&
        !isSearching &&
        searchResults.length === 0
      "
      class="location-search-message empty"
      role="status"
    >
      검색 결과가 없습니다.
    </div>

    <ul
      v-if="searchResults.length > 0"
      class="location-search-results"
    >
      <li
        v-for="location in searchResults"
        :key="location.id"
      >
        <button
          class="location-search-result"
          type="button"
          @click="selectLocation(location)"
        >
          <strong class="location-search-result-name">
            {{ location.name }}
          </strong>

          <span
            v-if="location.address && location.address !== location.name"
            class="location-search-result-address"
          >
            {{ location.address }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.location-search {
  width: 100%;
}

.location-search-form {
  display: flex;
  gap: 8px;
}

.location-search-input {
  min-width: 0;
  height: 42px;
  flex: 1;
  padding: 0 12px;
  border: 1px solid var(--tmr-border);
  border-radius: 8px;
  outline: none;
  font-size: 13px;
  color: var(--tmr-text);
  background: var(--tmr-surface);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.location-search-input::placeholder {
  color: var(--tmr-text-sub);
}

.location-search-input:focus {
  border-color: var(--tmr-primary);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--tmr-primary) 12%, transparent);
}

.location-search-button {
  height: 42px;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--tmr-primary);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--tmr-surface);
  white-space: nowrap;
  background: var(--tmr-primary);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.location-search-button:hover:not(:disabled) {
  border-color: var(--tmr-primary-dark);
  background: var(--tmr-primary-dark);
}

.location-search-button:active:not(:disabled) {
  transform: scale(0.98);
}

.location-search-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.location-search-results {
  overflow: hidden;
  margin: 8px 0 0;
  padding: 0;
  border: 1px solid var(--tmr-border);
  border-radius: 8px;
  list-style: none;
  background: var(--tmr-surface);
}

.location-search-results li + li {
  border-top: 1px solid var(--tmr-border);
}

.location-search-result {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border: 0;
  text-align: left;
  background: var(--tmr-surface);
  transition: background 0.2s ease;
}

.location-search-result:hover {
  background: var(--tmr-surface-soft);
}

.location-search-result-name {
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--tmr-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-search-result-address {
  overflow: hidden;
  font-size: 11px;
  line-height: 1.4;
  color: var(--tmr-text-sub);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-search-message {
  margin-top: 8px;
  padding: 9px 10px;
  border-radius: 7px;
  font-size: 11px;
  line-height: 1.5;
}

.location-search-message.error {
  color: var(--tmr-accent);
  background: var(--tmr-accent-soft);
}

.location-search-message.empty {
  color: var(--tmr-text-sub);
  background: var(--tmr-surface-soft);
}

@media (max-width: 760px) {
  .location-search-form {
    gap: 6px;
  }

  .location-search-input,
  .location-search-button {
    height: 38px;
  }

  .location-search-input {
    padding: 0 10px;
    font-size: 11px;
  }

  .location-search-button {
    padding: 0 12px;
    font-size: 10px;
  }

  .location-search-result {
    padding: 9px 10px;
  }

  .location-search-result-name {
    font-size: 11px;
  }

  .location-search-result-address {
    font-size: 9px;
  }

  .location-search-message {
    padding: 8px 9px;
    font-size: 9px;
  }
}
</style>
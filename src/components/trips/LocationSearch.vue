<script setup lang="ts">
import { ref } from 'vue'

import {
  searchLocations,
  type LocationSearchResult,
} from '@/api/geocoding'
import { ApiError } from '@/api/http'

const emit = defineEmits<{
  (e: 'select', location: LocationSearchResult): void
}>()

const searchQuery = ref('')
const searchResults = ref<LocationSearchResult[]>([])
const isSearching = ref(false)
const searchError = ref('')
const hasSearched = ref(false)

async function handleSearch() {
  const query = searchQuery.value.trim()

  if (!query) {
    searchResults.value = []
    searchError.value = ''
    hasSearched.value = false
    return
  }

  try {
    isSearching.value = true
    searchError.value = ''
    hasSearched.value = true

    searchResults.value = await searchLocations(query)
  } catch (error) {
    console.error('장소 검색 실패:', error)

    searchResults.value = []

    if (error instanceof ApiError) {
      if (error.status === 401) {
        searchError.value =
          '로그인 정보가 만료되었습니다. 다시 로그인해 주세요.'
      } else if (error.status >= 500) {
        searchError.value =
          '장소 검색 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
      } else {
        searchError.value =
          '장소 검색에 실패했습니다. 다시 시도해 주세요.'
      }
    } else {
      searchError.value =
        '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
    }
  } finally {
    isSearching.value = false
  }
}

function selectLocation(location: LocationSearchResult) {
  emit('select', location)

  searchQuery.value = location.name
  searchResults.value = []
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
      class="location-search-message"
    >
      {{ searchError }}
    </div>

    <div
      v-else-if="
        hasSearched &&
        !isSearching &&
        searchResults.length === 0
      "
      class="location-search-message"
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
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.location-search-input:focus {
  border-color: #888;
}

.location-search-button {
  flex-shrink: 0;
  padding: 10px 16px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  background: #fff;
  color: #303743;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
}

.location-search-button:disabled {
  cursor: default;
  opacity: 0.6;
}

.location-search-results {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.location-search-results li + li {
  border-top: 1px solid #e5e5e5;
}

.location-search-result {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 3px;
  padding: 10px 12px;
  border: 0;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.location-search-result-name {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: #303743;
}

.location-search-result-address {
  font-size: 11px;
  line-height: 1.4;
  color: #8a92a0;
}

.location-search-result:hover {
  background: #f7f7f7;
}

.location-search-message {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}
</style>
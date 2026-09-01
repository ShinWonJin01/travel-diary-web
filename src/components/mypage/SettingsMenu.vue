<script setup lang="ts">
type SettingsMenuId =
  | 'profile'
  | 'notifications'
  | 'password'
  | 'account'

interface SettingsMenuItem {
  id: SettingsMenuId
  title: string
  description: string
}

const emit = defineEmits<{
  select: [menuId: SettingsMenuId]
}>()

const menuItems: SettingsMenuItem[] = [
  {
    id: 'profile',
    title: '프로필 수정',
    description: '이름, 닉네임과 프로필 사진을 변경합니다.',
  },
  {
    id: 'notifications',
    title: '알림 설정',
    description: '여행 초대와 활동 알림을 설정합니다.',
  },
  {
    id: 'password',
    title: '비밀번호 변경',
    description: '계정의 비밀번호를 변경합니다.',
  },
  {
    id: 'account',
    title: '계정 관리',
    description: '로그아웃과 회원 탈퇴를 관리합니다.',
  },
]
</script>

<template>
  <section class="settings-section">
    <h2>계정 및 설정</h2>

    <div class="settings-list">
      <button
        v-for="item in menuItems"
        :key="item.id"
        class="settings-item"
        type="button"
        @click="emit('select', item.id)"
      >
        <span class="settings-icon">
          <svg
            v-if="item.id === 'profile'"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
          </svg>

          <svg
            v-else-if="item.id === 'notifications'"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>

          <svg
            v-else-if="item.id === 'password'"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>

          <svg
            v-else
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </span>

        <span class="settings-information">
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </span>

        <span class="settings-arrow">›</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.settings-section {
  margin-top: 34px;
}

.settings-section > h2 {
  margin: 0 0 15px;
  font-size: 17px;
  color: var(--tmr-text);
}

.settings-list {
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 12px;
  background: var(--tmr-surface);
}

.settings-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 24px;
  width: 100%;
  min-height: 76px;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  border: 0;
  border-bottom: 1px solid var(--tmr-border);
  text-align: left;
  background: var(--tmr-surface);
  transition: background 0.2s ease;
}

.settings-item:last-child {
  border-bottom: 0;
}

.settings-item:hover {
  background: var(--tmr-surface-soft);
}

.settings-icon {
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;
}

.settings-item:hover .settings-icon {
  color: var(--tmr-surface);
  background: var(--tmr-primary);
  transform: translateY(-1px);
}

.settings-icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.settings-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.settings-information strong {
  font-size: 14px;
  color: var(--tmr-text);
}

.settings-information > span {
  overflow: hidden;
  font-size: 11px;
  color: var(--tmr-text-sub);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-arrow {
  font-size: 24px;
  color: var(--tmr-text-sub);
  text-align: right;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.settings-item:hover .settings-arrow {
  color: var(--tmr-primary);
  transform: translateX(2px);
}

@media (max-width: 760px) {
  .settings-section {
    margin-top: 27px;
  }

  .settings-section > h2 {
    margin-bottom: 11px;
    font-size: 13px;
  }

  .settings-item {
    grid-template-columns: 36px minmax(0, 1fr) 18px;
    min-height: 66px;
    gap: 11px;
    padding: 11px 13px;
  }

  .settings-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }

  .settings-icon svg {
    width: 18px;
    height: 18px;
  }

  .settings-information {
    gap: 4px;
  }

  .settings-information strong {
    font-size: 12px;
  }

  .settings-information > span {
    font-size: 9px;
  }

  .settings-arrow {
    font-size: 20px;
  }
}
</style>
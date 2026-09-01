<script setup lang="ts">
import type {
  NotificationCategory,
  NotificationItem,
} from '@/composables/notifications/useNotifications'

withDefaults(
  defineProps<{
    notifications: NotificationItem[]
    unreadCount: number
    mobile?: boolean
  }>(),
  {
    mobile: false,
  },
)

const emit = defineEmits<{
  'mark-all-read': []
  'mark-read': [notification: NotificationItem]
  open: [notification: NotificationItem]
}>()

const getNotificationTypeLabel = (
  type: NotificationCategory,
) => {
  switch (type) {
    case 'invitation':
      return '초대'

    case 'trip-change':
      return '여행 변경'

    case 'activity':
      return '참여자 활동'

    case 'trip-deleted':
      return '여행 삭제'
  }
}

const handleNotificationClick = (
  notification: NotificationItem,
) => {
  if (!notification.isRead) {
    emit('mark-read', notification)
  }
}
</script>

<template>
  <div
    class="notification-popup"
    :class="{ 'notification-popup-mobile': mobile }"
  >
    <div class="notification-popup-header">
      <div>
        <h2>알림</h2>
        <p>읽지 않은 알림 {{ unreadCount }}개</p>
      </div>

      <button
        type="button"
        :disabled="unreadCount === 0"
        @click="emit('mark-all-read')"
      >
        모두 읽음
      </button>
    </div>

    <div
      v-if="notifications.length > 0"
      class="notification-list"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
      >
        <button
          class="notification-content-button"
          type="button"
          @click="handleNotificationClick(notification)"
        >
          <span
            class="notification-unread-dot"
            :class="{ hidden: notification.isRead }"
          ></span>

          <span class="notification-information">
            <span
              class="notification-type"
              :class="notification.type"
            >
              {{ getNotificationTypeLabel(notification.type) }}
            </span>

            <strong>
              {{ notification.message }}
            </strong>

            <span class="notification-meta">
              {{ notification.time }}
            </span>
          </span>
        </button>

        <button
          class="notification-move-button"
          type="button"
          @click="emit('open', notification)"
        >
          이동하기
        </button>
      </div>
    </div>

    <div v-else class="empty-notification">
      <p>새로운 알림이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.notification-popup {
  position: absolute;
  top: calc(100% + 17px);
  right: 0;
  z-index: 300;
  width: 370px;
  overflow: hidden;
  border: 1px solid var(--tmr-border);
  border-radius: 13px;
  background: var(--tmr-surface);
  box-shadow: 0 16px 45px rgba(31, 43, 61, 0.18);
}

.notification-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 19px;
  border-bottom: 1px solid var(--tmr-border);
}

.notification-popup-header h2 {
  margin: 0;
  font-size: 16px;
  color: var(--tmr-text);
}

.notification-popup-header p {
  margin: 5px 0 0;
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.notification-popup-header > button {
  padding: 5px;
  border: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--tmr-primary);
  background: transparent;
}

.notification-popup-header > button:disabled {
  color: var(--tmr-text-sub);
  cursor: default;
}

.notification-list {
  max-height: 390px;
  overflow-y: auto;
}

.notification-item {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--tmr-border);
  background: var(--tmr-surface);
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item:hover {
  background: var(--tmr-surface-soft);
}

.notification-content-button {
  display: grid;
  min-width: 0;
  flex: 1;
  grid-template-columns: 9px minmax(0, 1fr);
  gap: 10px;
  padding: 15px 10px 15px 18px;
  border: 0;
  text-align: left;
  background: transparent;
}

.notification-move-button {
  flex-shrink: 0;
  margin-right: 14px;
  padding: 6px 8px;
  border: 1px solid var(--tmr-border);
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  color: var(--tmr-primary);
  background: var(--tmr-surface);
}

.notification-move-button:hover {
  border-color: var(--tmr-primary);
}

.notification-unread-dot {
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: var(--tmr-primary);
}

.notification-unread-dot.hidden {
  visibility: hidden;
}

.notification-information {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
}

.notification-type {
  display: inline-flex;
  min-height: 20px;
  align-items: center;
  padding: 0 7px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
}

.notification-type.invitation {
  color: var(--tmr-primary);
  background: var(--tmr-surface-soft);
}

.notification-type.trip-change {
  color: #8a6415;
  background: #fff4d5;
}

.notification-type.activity {
  color: #28745c;
  background: #e7f7f0;
}

.notification-type.trip-deleted {
  color: #c23b43;
  background: #fdecee;
}

.notification-information strong {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--tmr-text);
}

.notification-meta {
  margin-top: 6px;
  font-size: 10px;
  color: var(--tmr-text-sub);
}

.empty-notification {
  display: flex;
  min-height: 170px;
  align-items: center;
  justify-content: center;
}

.empty-notification p {
  margin: 0;
  font-size: 12px;
  color: var(--tmr-text-sub);
}

@media (max-width: 760px) {
  .notification-popup-mobile {
    position: fixed;
    top: 66px;
    right: 12px;
    left: 12px;
    width: auto;
    max-height: calc(100vh - 150px);
  }

  .notification-popup-header {
    padding: 15px 16px;
  }

  .notification-popup-header h2 {
    font-size: 14px;
  }

  .notification-popup-header p {
    font-size: 9px;
  }

  .notification-popup-header > button {
    font-size: 10px;
  }

  .notification-list {
    max-height: calc(100vh - 235px);
  }

  .notification-content-button {
    padding: 13px 8px 13px 15px;
  }

  .notification-move-button {
    margin-right: 12px;
    padding: 5px 7px;
    font-size: 8px;
  }

  .notification-information strong {
    font-size: 11px;
  }

  .notification-meta {
    font-size: 9px;
  }
}
</style>
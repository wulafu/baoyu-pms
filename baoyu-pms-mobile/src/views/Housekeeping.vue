<template>
  <div class="housekeeping-page">
    <van-nav-bar title="客房保洁" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部" name="all" />
      <van-tab title="待打扫" name="dirty" />
      <van-tab title="检查中" name="inspecting" />
      <van-tab title="已打扫" name="clean" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="room-list">
        <div v-for="room in filteredRooms" :key="room.id" class="room-card">
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-status">
              <van-tag :type="getStatusType(room.cleaning_status)">
                {{ getStatusText(room.cleaning_status) }}
              </van-tag>
            </div>
          </div>
          
          <div class="actions">
            <van-button 
              v-if="room.cleaning_status === 'dirty'" 
              size="small" 
              type="primary" 
              plain
              @click="updateStatus(room, 'clean')"
            >标记已打扫</van-button>
            <van-button 
              v-if="room.cleaning_status === 'clean'" 
              size="small" 
              type="default" 
              plain
              @click="updateStatus(room, 'dirty')"
            >标记需打扫</van-button>
             <van-button 
              v-if="room.cleaning_status === 'inspecting'" 
              size="small" 
              type="success" 
              plain
              @click="updateStatus(room, 'clean')"
            >通过检查</van-button>
          </div>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRooms, type Room } from '@/api/room' // We need to ensure Room type has cleaning_status
import request from '@/utils/request'
import { showSuccessToast } from 'vant'

// Extend Room interface locally if needed, or assume API returns it
interface RoomWithStatus extends Room {
  cleaning_status: 'clean' | 'dirty' | 'inspecting'
}

const rooms = ref<RoomWithStatus[]>([])
const activeTab = ref('all')
const refreshing = ref(false)

const filteredRooms = computed(() => {
  if (activeTab.value === 'all') return rooms.value
  return rooms.value.filter(r => r.cleaning_status === activeTab.value)
})

const fetchRooms = async () => {
  const res = await getRooms()
  // Cast to include cleaning_status which backend returns
  rooms.value = res.data as RoomWithStatus[]
  refreshing.value = false
}

const onRefresh = () => {
  fetchRooms()
}

const updateStatus = async (room: RoomWithStatus, status: string) => {
  await request({
    url: `/rooms/${room.id}/cleaning-status`,
    method: 'put',
    data: { status }
  })
  showSuccessToast('状态已更新')
  // Optimistic update
  room.cleaning_status = status as any
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    clean: 'success',
    dirty: 'danger',
    inspecting: 'warning'
  }
  return map[status] || 'default'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    clean: '已打扫',
    dirty: '待打扫',
    inspecting: '检查中'
  }
  return map[status] || status
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.housekeeping-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.room-list {
  padding: 10px;
}

.room-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>

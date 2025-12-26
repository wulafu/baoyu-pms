<template>
  <div class="channels-view">
    <div class="view-header">
      <h2>渠道直连管理</h2>
      <el-button type="primary">添加渠道</el-button>
    </div>

    <div class="channels-grid">
      <el-card v-for="channel in channels" :key="channel.code" class="channel-card">
        <template #header>
          <div class="card-header">
            <div class="channel-info">
              <el-avatar shape="square" :size="40" class="channel-logo" :class="channel.code">
                {{ channel.name.substring(0, 1) }}
              </el-avatar>
              <span class="channel-name">{{ channel.name }}</span>
            </div>
            <el-tag :type="channel.status === 'connected' ? 'success' : 'info'">
              {{ channel.status === 'connected' ? '已连接' : '未连接' }}
            </el-tag>
          </div>
        </template>
        
        <div class="card-body">
          <div class="status-row">
            <span class="label">同步状态:</span>
            <el-tag :type="channel.sync_enabled ? 'success' : 'warning'" size="small">
              {{ channel.sync_enabled ? '开启' : '关闭' }}
            </el-tag>
          </div>
          
          <div class="actions">
            <el-button @click="openConfig(channel)" :disabled="channel.status !== 'connected'">配置映射</el-button>
            <el-button type="primary" plain v-if="channel.status !== 'connected'" @click="handleConnect(channel)">连接</el-button>
            <el-button type="danger" plain v-if="channel.status === 'connected'" @click="handleDisconnect(channel)">解绑</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Mapping Config Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :title="`${currentChannel?.name} 房型映射配置`"
      size="50%"
    >
        <div v-if="currentChannel" class="mapping-content" v-loading="loadingMappings">
        <el-alert
          title="请从右侧拖拽渠道房型到左侧对应的本地房型上进行绑定"
          type="info"
          show-icon
          style="margin-bottom: 20px;"
        />
        
        <div class="mapping-container">
            <!-- Left: Local Rooms -->
            <div class="local-rooms-col">
                <h3>本地房型</h3>
                <div class="local-room-list">
                    <div 
                        v-for="(mapping, index) in currentMappings" 
                        :key="index"
                        class="local-room-item"
                        @dragover.prevent
                        @drop="onDrop($event, mapping)"
                    >
                        <div class="local-info">
                            <span class="room-name">{{ getRoomName(mapping.local_room_id) }}</span>
                            <span class="room-id">ID: {{ mapping.local_room_id }}</span>
                        </div>
                        
                        <div v-if="mapping.channel_room_id" class="mapped-info">
                            <div class="channel-room-badge">
                                <el-icon><Link /></el-icon>
                                {{ getChannelRoomName(mapping.channel_room_id) }}
                            </div>
                            <el-button link type="danger" @click="removeMapping(mapping)">
                                <el-icon><Delete /></el-icon>
                            </el-button>
                        </div>
                        <div v-else class="drop-hint">
                            拖拽至此绑定
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Channel Rooms -->
            <div class="channel-rooms-col">
                <h3>{{ currentChannel?.name }} 房型 (可拖拽)</h3>
                <div class="channel-room-list">
                    <div 
                        v-for="room in channelRooms" 
                        :key="room.id"
                        class="channel-room-item"
                        :class="{ 'mapped': isChannelRoomMapped(room.id) }"
                        draggable="true"
                        @dragstart="onDragStart($event, room)"
                    >
                        <div class="room-name">{{ room.name }}</div>
                        <div class="room-id">ID: {{ room.id }}</div>
                    </div>
                    <div v-if="channelRooms.length === 0" class="empty-hint">
                        暂无房型或获取失败
                    </div>
                </div>
            </div>
        </div>

        <div class="sync-settings">
          <h3>同步策略</h3>
          <el-form label-width="120px">
            <el-form-item label="库存同步">
              <el-switch v-model="syncConfig.stock" />
              <span class="hint">本地库存变动自动推送到渠道</span>
            </el-form-item>
            <el-form-item label="价格同步">
              <el-switch v-model="syncConfig.price" />
              <span class="hint">本地改价自动同步到渠道</span>
            </el-form-item>
            <el-form-item label="自动落单">
              <el-switch v-model="syncConfig.order" />
              <span class="hint">渠道订单自动落入PMS</span>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMapping" :loading="saving">保存配置</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getChannels, getAuthUrl, disconnectChannel, getChannelMappings, updateChannelMapping, getChannelRooms } from '@/api/channel'
import { getRooms, type Room } from '@/api/room'
import type { ChannelMapping } from '@/api/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Link } from '@element-plus/icons-vue'

interface ChannelUI {
  code: string
  name: string
  icon?: string
  status: string // 'connected' | 'disconnected'
  sync_enabled: boolean
}

const channels = ref<ChannelUI[]>([])

const drawerVisible = ref(false)
const loadingMappings = ref(false)
const saving = ref(false)
const currentChannel = ref<ChannelUI | null>(null)
const mappings = ref<ChannelMapping[]>([])
const currentMappings = ref<ChannelMapping[]>([])
const localRooms = ref<Room[]>([])
const channelRooms = ref<any[]>([])
const draggingRoom = ref<any>(null)

const syncConfig = ref({
  stock: true,
  price: true,
  order: true
})

// ... existing fetch functions ...
const fetchChannels = async () => {
  try {
    const res = await getChannels()
    if (res.data) {
      channels.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch channels', error)
  }
}

const fetchMappings = async () => {
  try {
    const res = await getChannelMappings()
    if (res.data) {
      mappings.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch mappings', error)
  }
}

const handleConnect = async (channel: ChannelUI) => {
  try {
      const res = await getAuthUrl(channel.code);
      if (res.url) {
          localStorage.setItem('pending_auth_channel', channel.code);
          window.location.href = res.url;
      }
  } catch (e) {
      ElMessage.error('无法启动授权');
  }
}

const handleDisconnect = async (channel: ChannelUI) => {
  try {
      await ElMessageBox.confirm(`确定要解绑 ${channel.name} 吗？解绑后将停止同步。`, '解绑确认', {
        confirmButtonText: '确定解绑',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      await disconnectChannel(channel.code);
      ElMessage.success('已解绑');
      fetchChannels(); // Refresh status
  } catch (e) {
      // Cancelled or failed
  }
}

const openConfig = async (channel: ChannelUI) => {
  currentChannel.value = channel
  drawerVisible.value = true
  loadingMappings.value = true
  channelRooms.value = []
  
  try {
    // 1. Fetch local rooms if not already fetched
    if (localRooms.value.length === 0) {
      const roomRes = await getRooms()
      localRooms.value = roomRes.data || []
    }

    // 2. Fetch channel rooms
    if (channel.status === 'connected') {
        try {
            const res = await getChannelRooms(channel.code)
            channelRooms.value = res.data || []
        } catch (e) {
            console.error('Failed to fetch channel rooms', e)
        }
    }
    
    // 3. Filter existing mappings for this channel
    const existingMappings = mappings.value.filter(m => m.channel_code === channel.code)
    
    // 4. Merge: Create a mapping entry for EACH local room
    currentMappings.value = localRooms.value.map(room => {
      const existing = existingMappings.find(m => m.local_room_id === String(room.id))
      
      if (existing) {
        return { ...existing }
      } else {
        return {
          channel_code: channel.code,
          channel_name: channel.name,
          local_room_id: String(room.id),
          channel_room_id: '',
          sync_enabled: false
        }
      }
    })
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loadingMappings.value = false
  }
}

const getRoomName = (id: string) => {
  const room = localRooms.value.find(r => String(r.id) === id)
  return room ? room.name : '未知房型'
}

const onDragStart = (event: DragEvent, room: any) => {
  draggingRoom.value = room
  if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy'
      event.dataTransfer.setData('text/plain', JSON.stringify(room))
  }
}

const onDrop = (event: DragEvent, mapping: ChannelMapping) => {
  event.preventDefault()
  if (draggingRoom.value) {
    mapping.channel_room_id = draggingRoom.value.id
    // mapping.channel_room_name = draggingRoom.value.name // If we had this field
    mapping.sync_enabled = true
    draggingRoom.value = null
  }
}

const removeMapping = (mapping: ChannelMapping) => {
    mapping.channel_room_id = ''
    mapping.sync_enabled = false
}

const getChannelRoomName = (id: string) => {
    const room = channelRooms.value.find(r => r.id === id || String(r.id) === id)
    return room ? room.name : id
}

// Computed to filter available channel rooms (optional: hide mapped ones?)
// For now show all, maybe dim used ones
const isChannelRoomMapped = (id: string) => {
    return currentMappings.value.some(m => m.channel_room_id === id || m.channel_room_id === String(id))
}

const saveMapping = async () => {
  saving.value = true
  try {
    const promises = currentMappings.value.map((mapping: ChannelMapping) => {
      return updateChannelMapping(mapping)
    })
    
    await Promise.all(promises)
    
    ElMessage.success('配置保存成功')
    drawerVisible.value = false
    fetchMappings() 
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchChannels()
  fetchMappings()
})
</script>

<style scoped lang="scss">
.channels-view {
  padding: 24px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.channel-card {
  border: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  }

  :deep(.el-card__header) {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2f5;
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .logo-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: bold;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &.airbnb { background: linear-gradient(135deg, #FF5A5F, #FF385C); }
    &.meituan { background: linear-gradient(135deg, #FFC300, #FFD040); color: #333; }
    &.ctrip { background: linear-gradient(135deg, #2b82f4, #0066cc); }
    &.tujia { background: linear-gradient(135deg, #fd5a5f, #ff3333); }
    &.booking { background: linear-gradient(135deg, #003580, #0055cc); }
  }
  
  .info-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .channel-name {
      font-weight: 600;
      font-size: 18px;
      color: #303133;
    }
    
    .channel-status {
      font-size: 12px;
      color: #909399;
      
      &.active {
        color: #67C23A;
      }
    }
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .label {
    font-size: 14px;
    color: #606266;
  }
  
  .value {
    &.time {
      font-family: monospace;
      color: #909399;
      font-size: 13px;
    }
  }
}

.actions {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  .action-btn {
    width: 100%;
    margin: 0;
  }
}

.mapping-content {
  padding: 0 20px;
}

.mapping-container {
  display: flex;
  gap: 20px;
  height: 500px;
}

.mapping-col {
  flex: 1;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.room-list, .channel-room-list {
  flex: 1;
  overflow-y: auto;
}

.local-room-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.local-room-card.has-mapping {
  border-color: #67c23a;
  background: #f0f9eb;
}

.room-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: bold;
}

.drop-zone {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.3s;
}

.drop-zone:hover {
  border-color: #409EFF;
}

.placeholder {
  color: #909399;
  font-size: 12px;
}

.mapped-channel-room {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background: #ecf5ff;
  color: #409EFF;
  border-radius: 4px;
}

.channel-icon {
  background: #409EFF;
  color: #fff;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-right: 6px;
}

.remove-btn {
  margin-left: auto;
  cursor: pointer;
  color: #909399;
}

.remove-btn:hover {
  color: #F56C6C;
}

.channel-room-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: grab;
  transition: transform 0.2s;
}

.channel-room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.channel-room-card.is-mapped {
  opacity: 0.5;
  background: #f4f4f5;
  cursor: not-allowed;
}

.c-room-name {
  font-weight: bold;
  font-size: 14px;
}

.c-room-id {
  font-size: 12px;
  color: #909399;
}

.mapped-badge {
  font-size: 10px;
  color: #67c23a;
  margin-top: 4px;
}

.mapping-actions {
  margin-top: 8px;
  text-align: right;
}

.sync-settings {
  margin-top: 30px;
  
  h3 {
    margin-bottom: 20px;
    font-size: 16px;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
  }
  
  .hint {
    margin-left: 10px;
    font-size: 12px;
    color: #909399;
  }
}
</style>

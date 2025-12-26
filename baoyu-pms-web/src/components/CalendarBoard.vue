<template>
  <div class="calendar-board">
    <div class="toolbar">
      <el-date-picker
        v-model="currentMonth"
        type="month"
        placeholder="选择月份"
        @change="handleMonthChange"
      />
      <el-button :icon="Refresh" circle @click="fetchStocks" :loading="loading" title="刷新" />
      <div class="legend">
        <span class="dot available"></span> 可预订
        <span class="dot booked"></span> 已预订
        <span class="dot blocked"></span> 停售/维护
      </div>
    </div>

    <div class="calendar-grid" v-loading="loading">
      <div class="room-row" v-for="room in rooms" :key="room.id">
        <div class="room-header">
          <div class="room-name">{{ room.name }}</div>
          <div class="room-price">基准价: ¥{{ room.base_price }}</div>
        </div>
        <div class="date-cells">
          <div
            v-for="day in daysInMonth"
            :key="day.dateStr"
            class="cell"
            :class="getStockStatus(room.id, day.dateStr)"
            @click="handleCellClick(room, day.dateStr)"
          >
            <div class="date-num">{{ day.dayNum }}</div>
            <div class="status-text">
              {{ getStatusLabel(getStockStatus(room.id, day.dateStr)) }}
            </div>
            <div class="price">¥{{ getStockPrice(room.id, day.dateStr) || room.base_price }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Edit Dialog -->
    <el-dialog v-model="dialogVisible" title="房态管理" width="30%">
      <div v-if="selectedCell">
        <p>房型: {{ selectedCell.roomName }}</p>
        <p>日期: {{ selectedCell.date }}</p>
        
        <el-form :model="form" label-width="80px" class="mt-4">
          <el-form-item label="房态">
            <el-select v-model="form.status">
              <el-option label="可预订" value="available" />
              <el-option label="关房 (停售)" value="blocked" />
            </el-select>
          </el-form-item>
          <el-form-item label="价格">
            <el-input-number v-model="form.price" :min="0" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveStock">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { getRooms, getRoomCalendar, updateRoomStock, type Room, type RoomStock } from '@/api/room'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const currentMonth = ref(new Date())
const rooms = ref<Room[]>([])
const stocks = ref<Record<string, RoomStock>>({}) // Key: roomId_date
const dialogVisible = ref(false)
const selectedCell = ref<{ roomId: number; roomName: string; date: string } | null>(null)
const form = ref({ status: 'available', price: 0 })

// Helper to generate days for current month
const daysInMonth = computed(() => {
  const start = dayjs(currentMonth.value).startOf('month')
  const days = start.daysInMonth()
  const result = []
  for (let i = 0; i < days; i++) {
    const d = start.add(i, 'day')
    result.push({
      dateStr: d.format('YYYY-MM-DD'),
      dayNum: d.date()
    })
  }
  return result
})

const fetchRooms = async () => {
  try {
    const res = await getRooms()
    rooms.value = res.data
    if (rooms.value.length > 0) {
      await fetchStocks()
    }
  } catch (error) {
    console.error(error)
  }
}

const fetchStocks = async () => {
  loading.value = true
  try {
    const start = dayjs(currentMonth.value).startOf('month').format('YYYY-MM-DD')
    const end = dayjs(currentMonth.value).endOf('month').format('YYYY-MM-DD')
    
    // Fetch calendar for all rooms (Parallel)
    const promises = rooms.value.map(r => getRoomCalendar(r.id, start, end))
    const results = await Promise.all(promises)
    
    // Flatten results into map
    const newStocks: Record<string, RoomStock> = {}
    results.forEach((res, index) => {
      const room = rooms.value[index]
      if (room && res?.data) {
        res.data.forEach(stock => {
          newStocks[`${room.id}_${stock.biz_date}`] = stock
        })
      }
    })
    stocks.value = newStocks
  } finally {
    loading.value = false
  }
}

const getStockStatus = (roomId: number, date: string) => {
  const stock = stocks.value[`${roomId}_${date}`]
  // console.log(`Get status for ${roomId} on ${date}:`, stock?.status)
  return stock ? stock.status : 'available'
}

const getStockPrice = (roomId: number, date: string) => {
  const stock = stocks.value[`${roomId}_${date}`]
  return stock ? stock.price : null
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    'booked': '已预订',
    'blocked': '停售',
    'available': '可预订'
  }
  return map[status] || ''
}

const handleMonthChange = () => {
  fetchStocks()
}

const handleCellClick = (room: Room, date: string) => {
  const stock = stocks.value[`${room.id}_${date}`]
  // Don't allow editing booked cells for now (simplified)
  if (stock && stock.status === 'booked') {
      ElMessage.warning('无法修改已预订的日期')
      return
  }

  selectedCell.value = { roomId: room.id, roomName: room.name, date }
  form.value = {
      status: stock ? stock.status : 'available',
      price: stock ? stock.price : room.base_price
  }
  dialogVisible.value = true
}

const saveStock = async () => {
  if (!selectedCell.value) return
  
  // Optimistic update
  const roomId = selectedCell.value.roomId
  const date = selectedCell.value.date
  const newStatus = form.value.status as any
  const newPrice = form.value.price

  // Temporarily update local state to reflect change immediately
  console.log(`Applying optimistic update for ${roomId} on ${date} to ${newStatus}`)
  
  // Create a new object reference to ensure reactivity
  const newStocks = { ...stocks.value }
  newStocks[`${roomId}_${date}`] = {
    id: 0, // Placeholder
    room_id: roomId,
    biz_date: date,
    status: newStatus,
    price: newPrice
  }
  stocks.value = newStocks

  try {
    await updateRoomStock(roomId, {
      date: date,
      status: newStatus,
      price: newPrice
    })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    
    // Comment out fetchStocks to prevent overwriting optimistic update with potentially stale backend data
    // fetchStocks()
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
    fetchStocks() // Revert on error
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.calendar-board {
  padding: 20px;
}
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
}
.legend {
  display: flex;
  gap: 15px;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}
.dot.available { background-color: #fff; border: 1px solid #ddd; }
.dot.booked { background-color: #f56c6c; }
.dot.blocked { background-color: #909399; }

.calendar-grid {
  border: 1px solid #ebeef5;
  overflow-x: auto;
}
.room-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}
.room-header {
  width: 150px;
  flex-shrink: 0;
  padding: 10px;
  background: #f5f7fa;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.room-name { font-weight: bold; }
.room-price { font-size: 12px; color: #666; }

.date-cells {
  display: flex;
  flex-grow: 1;
}
.cell {
  width: 60px;
  height: 80px;
  border-right: 1px solid #ebeef5;
  padding: 5px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}
.cell:hover { background-color: #f0f9eb; }
.cell.booked { background-color: #f56c6c; color: #fff; cursor: not-allowed; }
.cell.blocked { background-color: #909399; color: #fff; }

.date-num { font-weight: bold; }
.status-text { font-size: 12px; margin: 2px 0; transform: scale(0.9); }
.price { font-size: 12px; }
.mt-4 { margin-top: 20px; }
</style>

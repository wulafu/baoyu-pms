<template>
  <div class="calendar-page">
    <van-nav-bar title="房态日历" fixed placeholder />
    
    <div class="filter-bar">
      <van-cell :title="currentDateStr" is-link @click="showCalendar = true" />
    </div>

    <van-calendar 
      v-model:show="showCalendar" 
      :min-date="minDate"
      :max-date="maxDate"
      @confirm="onConfirmDate" 
      color="#1989fa"
      type="single"
    />

    <div class="room-list" v-if="rooms.length > 0">
      <div v-for="room in rooms" :key="room.id" class="room-card">
        <div class="room-header">
          <span class="room-name">{{ room.name }}</span>
          <span class="room-price">¥{{ room.base_price }}</span>
        </div>
        
        <div class="date-scroll">
          <div 
            v-for="day in next7Days" 
            :key="day.dateStr" 
            class="date-item"
            :class="getStockStatus(room.id, day.dateStr)"
            @click="handleCellClick(room, day.dateStr)"
          >
            <div class="date-label">{{ day.label }}</div>
            <div class="status-label">{{ getStatusText(getStockStatus(room.id, day.dateStr)) }}</div>
            <div class="price-label">¥{{ getStockPrice(room.id, day.dateStr) || room.base_price }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <van-empty v-else description="暂无房型数据" />

    <!-- Stock Edit Action Sheet -->
    <van-action-sheet v-model:show="showEdit" :title="editTitle">
      <div class="edit-content">
        <van-field label="当前房态" readonly :model-value="getStatusText(editForm.status)" />
        
        <div class="status-actions">
          <van-button 
            type="primary" 
            size="small" 
            :plain="editForm.status !== 'available'"
            @click="editForm.status = 'available'"
          >可预订</van-button>
          <van-button 
            type="danger" 
            size="small" 
            :plain="editForm.status !== 'booked'"
            @click="editForm.status = 'booked'"
          >已预订</van-button>
          <van-button 
            type="warning" 
            size="small" 
            :plain="editForm.status !== 'blocked'"
            @click="editForm.status = 'blocked'"
          >停售</van-button>
        </div>

        <van-field 
          v-model="editForm.price" 
          type="number" 
          label="价格" 
          placeholder="请输入价格" 
        />
        
        <div class="submit-btn">
          <van-button block type="primary" @click="saveStock">保存</van-button>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getRooms, getRoomCalendar, updateRoomStock, type Room, type RoomStock } from '@/api/room'
import { showSuccessToast, showLoadingToast, closeToast } from 'vant'

const rooms = ref<Room[]>([])
const stocks = ref<Record<string, RoomStock>>({})
const currentDate = ref(new Date())
const showCalendar = ref(false)
const showEdit = ref(false)
const editTitle = ref('')
const selectedCell = ref<{ roomId: number, date: string } | null>(null)
const editForm = ref({ status: 'available', price: 0 })

const minDate = new Date()
const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 6))

const currentDateStr = computed(() => {
  return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`
})

const next7Days = computed(() => {
  const days = []
  const start = new Date(currentDate.value)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekMap = ['日', '一', '二', '三', '四', '五', '六']
    days.push({
      dateStr,
      label: `${month}/${day} 周${weekMap[d.getDay()]}`
    })
  }
  return days
})

const fetchRooms = async () => {
  const toast = showLoadingToast({ forbidClick: true })
  try {
    const res = await getRooms()
    rooms.value = res.data
    await fetchStocks()
  } finally {
    closeToast()
  }
}

const fetchStocks = async () => {
  const start = next7Days.value[0].dateStr
  const end = next7Days.value[6].dateStr
  
  const promises = rooms.value.map(r => getRoomCalendar(r.id, start, end))
  const results = await Promise.all(promises)
  
  const newStocks: Record<string, RoomStock> = {}
  results.forEach((res, index) => {
    const room = rooms.value[index]
    if (res?.data) {
      res.data.forEach(stock => {
        // Ensure date format
        const dateKey = stock.biz_date.split('T')[0]
        newStocks[`${room.id}_${dateKey}`] = stock
      })
    }
  })
  stocks.value = newStocks
}

const getStockStatus = (roomId: number, date: string) => {
  return stocks.value[`${roomId}_${date}`]?.status || 'available'
}

const getStockPrice = (roomId: number, date: string) => {
  return stocks.value[`${roomId}_${date}`]?.price
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: '可预订',
    booked: '已预订',
    blocked: '停售'
  }
  return map[status] || status
}

const onConfirmDate = (date: Date) => {
  showCalendar.value = false
  currentDate.value = date
  fetchStocks()
}

const handleCellClick = (room: Room, date: string) => {
  selectedCell.value = { roomId: room.id, date }
  const stock = stocks.value[`${room.id}_${date}`]
  
  editTitle.value = `${room.name} (${date})`
  editForm.value = {
    status: stock?.status || 'available',
    price: stock?.price || room.base_price
  }
  showEdit.value = true
}

const saveStock = async () => {
  if (!selectedCell.value) return
  
  const { roomId, date } = selectedCell.value
  
  // Optimistic update
  stocks.value[`${roomId}_${date}`] = {
    id: 0,
    room_id: roomId,
    biz_date: date,
    status: editForm.value.status as any,
    price: Number(editForm.value.price)
  }
  
  try {
    await updateRoomStock(roomId, {
      date,
      status: editForm.value.status,
      price: Number(editForm.value.price)
    })
    showSuccessToast('更新成功')
    showEdit.value = false
  } catch (error) {
    // Revert if needed (simplified)
  }
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.calendar-page {
  padding-bottom: 20px;
}

.filter-bar {
  background: #fff;
  margin-bottom: 10px;
}

.room-card {
  background: #fff;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.room-header {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f5f6f7;
  font-weight: bold;
}

.date-scroll {
  display: flex;
  overflow-x: auto;
  padding: 10px;
}

.date-item {
  flex: 0 0 80px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  margin-right: 8px;
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
}

.date-item.booked {
  background: #fff2f0;
  border-color: #ffccc7;
  color: #ff4d4f;
}

.date-item.blocked {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #00000040;
}

.date-item.available {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

.status-label {
  margin: 4px 0;
  font-weight: bold;
}

.edit-content {
  padding: 20px;
}

.status-actions {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.submit-btn {
  margin-top: 20px;
}
</style>

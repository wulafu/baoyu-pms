<template>
  <div class="orders-view">
    <div class="view-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索姓名/手机号/订单号"
          :prefix-icon="Search"
          style="width: 250px; margin-right: 10px;"
          clearable
        />
        <el-button type="primary" :icon="Plus">录入订单</el-button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <el-tabs v-model="activeStatus" class="status-tabs">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待确认" name="pending" />
      <el-tab-pane label="待入住" name="confirmed" />
      <el-tab-pane label="在住" name="checked_in" />
      <el-tab-pane label="已离店" name="checked_out" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <!-- Orders Table -->
    <el-table :data="displayedOrders" style="width: 100%" v-loading="loading">
      <el-table-column prop="order_no" label="订单号" width="180">
        <template #default="{ row }">
          <span class="order-no">{{ row.order_no }}</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="source_channel" label="来源" width="100">
        <template #default="{ row }">
          <el-tag :type="getChannelType(row.source_channel)" size="small">
            {{ row.source_channel || 'Direct' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="住客信息" width="180">
        <template #default="{ row }">
          <div class="guest-info">
            <div class="name">{{ row.guest_info?.name }}</div>
            <div class="phone" v-if="row.guest_info?.phone">{{ row.guest_info.phone }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="room_id" label="房间" width="120" />

      <el-table-column label="入离时间" width="220">
        <template #default="{ row }">
          <div class="dates">
            <div>{{ formatDate(row.check_in_date) }} 入住</div>
            <div>{{ formatDate(row.check_out_date) }} 离店</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="total_amount" label="金额" width="120">
        <template #default="{ row }">
          <span class="price">¥{{ row.total_amount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button 
            v-if="row.status === 'confirmed'"
            type="primary" 
            link 
            @click="handleAction(row, 'checked_in')"
          >
            办理入住
          </el-button>
          <el-button 
            v-if="row.status === 'checked_in'"
            type="success" 
            link 
            @click="handleAction(row, 'checked_out')"
          >
            办理退房
          </el-button>
          <el-button 
            v-if="['pending', 'confirmed'].includes(row.status)"
            type="danger" 
            link 
            @click="handleAction(row, 'cancelled')"
          >
            取消
          </el-button>
          <el-button type="info" link>详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </div>

    <!-- Create Order Dialog -->
    <el-dialog v-model="createDialogVisible" title="录入订单" width="500px">
      <el-form label-width="100px">
        <el-form-item label="选择房间">
          <el-select v-model="newOrder.room_id" placeholder="Select Room">
            <el-option v-for="room in rooms" :key="room.id" :label="room.name" :value="room.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入住日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="客人姓名">
          <el-input v-model="newOrder.guest_name" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="newOrder.guest_phone" />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input-number v-model="newOrder.total_amount" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { getOrders, updateOrderStatus, createOrder } from '@/api/order'
import type { Order } from '@/api/types'
import { getRooms, type Room } from '@/api/room'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const rawOrders = ref<Order[]>([])
const rooms = ref<Room[]>([])
const loading = ref(false)
const searchQuery = ref('')
const activeStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

const createDialogVisible = ref(false)
const dateRange = ref([])
const newOrder = ref({
  room_id: undefined,
  guest_name: '',
  guest_phone: '',
  total_amount: 0
})

// Computed for filtering
const filteredOrders = computed(() => {
  let result = rawOrders.value

  // 1. Status Filter
  if (activeStatus.value !== 'all') {
    result = result.filter(o => o.status === activeStatus.value)
  }

  // 2. Search Filter
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => 
      o.order_no.toLowerCase().includes(q) ||
      o.guest_info?.name.toLowerCase().includes(q) ||
      o.guest_info?.phone.includes(q)
    )
  }
  
  return result
})

// Computed for pagination
const displayedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const total = computed(() => filteredOrders.value.length)

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders({})
    // Sort by created_at desc
    if (res.data) {
      rawOrders.value = res.data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  } catch (error) {
    console.error('Failed to fetch orders', error)
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const fetchRooms = async () => {
  const res = await getRooms()
  rooms.value = res.data
}

const handleCreateOrder = async () => {
  if (!dateRange.value || dateRange.value.length < 2 || !newOrder.value.room_id) {
    ElMessage.warning('Please fill all fields')
    return
  }
  
  const checkIn = dateRange.value?.[0]
  const checkOut = dateRange.value?.[1]
  
  if (!checkIn || !checkOut) {
    ElMessage.warning('Please select dates')
    return
  }

  const nights = dayjs(checkOut).diff(dayjs(checkIn), 'day')

  try {
    await createOrder({
      user_id: 1, // Demo user
      room_id: newOrder.value.room_id,
      check_in_date: checkIn,
      check_out_date: checkOut,
      nights: nights,
      total_amount: newOrder.value.total_amount,
      guest_info: {
        name: newOrder.value.guest_name,
        phone: newOrder.value.guest_phone
      }
    })
    ElMessage.success('Order created')
    createDialogVisible.value = false
    fetchOrders()
  } catch (e) {
    console.error(e)
  }
}

// Reset page when filters change
watch([activeStatus, searchQuery], () => {
  currentPage.value = 1
})

const handleAction = (order: Order, action: string) => {
  const actionText = {
    'checked_in': '办理入住',
    'checked_out': '办理退房',
    'cancelled': '取消订单'
  }[action] || action

  ElMessageBox.confirm(`确定要对订单 ${order.order_no} 进行${actionText}操作吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: action === 'cancelled' ? 'warning' : 'info'
  }).then(async () => {
    try {
      await updateOrderStatus(order.id, action as any)
      ElMessage.success(`${actionText}成功`)
      fetchOrders()
    } catch (error) {
      // Error handled in interceptor
    }
  })
}

// Helpers
const formatDate = (date: string) => dayjs(date).format('MM-DD')

const getChannelType = (channel?: string) => {
  if (!channel) return 'info'
  const map: Record<string, string> = {
    'Airbnb': 'danger',
    'Meituan': 'warning',
    'Ctrip': 'primary',
    'Direct': 'success'
  }
  // Case insensitive match
  const key = Object.keys(map).find(k => k.toLowerCase() === channel.toLowerCase())
  return key ? map[key] : 'info'
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'pending': 'info',
    'confirmed': 'warning',
    'checked_in': 'success',
    'checked_out': 'info',
    'cancelled': 'danger'
  }
  return map[status] || ''
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'pending': '待确认',
    'confirmed': '待入住',
    'checked_in': '在住',
    'checked_out': '已离店',
    'cancelled': '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  fetchOrders()
  fetchRooms()
})
</script>

<style scoped lang="scss">
.orders-view {
  padding: 20px;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-tabs {
  margin-bottom: 20px;
}

.order-no {
  font-weight: bold;
}

.guest-info {
  .name {
    font-weight: bold;
  }
  .phone {
    font-size: 12px;
    color: #606266;
  }
}

.dates {
  font-size: 13px;
  color: #606266;
}

.price {
  font-weight: bold;
  color: #F56C6C;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>

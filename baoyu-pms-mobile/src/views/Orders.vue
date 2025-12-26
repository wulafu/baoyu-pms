<template>
  <div class="orders-page">
    <van-nav-bar title="订单管理" fixed placeholder />
    
    <van-tabs v-model:active="activeTab" sticky @click-tab="onTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待确认" name="pending" />
      <van-tab title="已确认" name="confirmed" />
      <van-tab title="已入住" name="checked_in" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div v-for="order in list" :key="order.id" class="order-card">
          <div class="card-header">
            <span class="order-no">{{ order.order_no }}</span>
            <van-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</van-tag>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">客人:</span>
              <span class="value">{{ order.guest_info.name }} ({{ order.guest_info.phone }})</span>
            </div>
            <div class="info-row">
              <span class="label">入住:</span>
              <span class="value">{{ order.check_in_date }} 至 {{ order.check_out_date }}</span>
            </div>
            <div class="info-row">
              <span class="label">金额:</span>
              <span class="value price">¥{{ order.total_amount }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <van-button 
              v-if="order.status === 'pending'" 
              size="small" 
              type="primary" 
              plain
              @click="handleAction(order, 'confirmed')"
            >确认订单</van-button>
            <van-button 
              v-if="order.status === 'confirmed'" 
              size="small" 
              type="success" 
              plain
              @click="handleAction(order, 'checked_in')"
            >办理入住</van-button>
            <van-button 
              v-if="order.status === 'checked_in'" 
              size="small" 
              type="warning" 
              plain
              @click="handleAction(order, 'checked_out')"
            >办理退房</van-button>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { showSuccessToast, showDialog } from 'vant'

interface Order {
  id: number
  order_no: string
  status: string
  total_amount: number
  guest_info: { name: string, phone: string }
  check_in_date: string
  check_out_date: string
}

const router = useRouter()
const list = ref<Order[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const activeTab = ref('all')

const goToDetail = (id: number) => {
  router.push(`/orders/${id}`)
}

const onLoad = async () => {
  try {
    const res = await request<{ data: Order[] }>({
      url: '/orders',
      method: 'get',
      params: { status: activeTab.value === 'all' ? undefined : activeTab.value }
    })
    
    if (refreshing.value) {
      list.value = []
      refreshing.value = false
    }
    
    list.value.push(...res.data)
    finished.value = true // Simplified: assume all data loaded at once for demo
  } finally {
    loading.value = false
  }
}

const onRefresh = () => {
  finished.value = false
  loading.value = true
  onLoad()
}

const onTabChange = () => {
  list.value = []
  loading.value = true
  finished.value = false
  onLoad()
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    checked_in: 'success',
    checked_out: 'default',
    cancelled: 'danger'
  }
  return map[status] as any
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    checked_in: '已入住',
    checked_out: '已退房',
    cancelled: '已取消'
  }
  return map[status] || status
}

const handleAction = (order: Order, newStatus: string) => {
  showDialog({
    title: '确认操作',
    message: `确定要更改状态为"${getStatusText(newStatus)}"?`,
    showCancelButton: true
  }).then(async () => {
    await request({
      url: `/orders/${order.id}/status`,
      method: 'put',
      data: { status: newStatus }
    })
    showSuccessToast('操作成功')
    onRefresh()
  })
}
</script>

<style scoped>
.orders-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.order-card {
  background: #fff;
  margin: 10px;
  border-radius: 8px;
  padding: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f6f7;
  margin-bottom: 8px;
}

.order-no {
  font-weight: bold;
  color: #323233;
}

.info-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 13px;
}

.label {
  color: #969799;
  width: 50px;
}

.value {
  color: #323233;
  flex: 1;
}

.price {
  color: #ee0a24;
  font-weight: bold;
}

.card-footer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f5f6f7;
  text-align: right;
}
</style>

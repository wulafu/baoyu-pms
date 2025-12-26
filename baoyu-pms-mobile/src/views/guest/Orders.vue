<template>
  <div class="guest-orders">
    <van-nav-bar title="我的订单" fixed placeholder />
    
    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="全部" name="all" />
      <van-tab title="待入住" name="confirmed" />
      <van-tab title="已完成" name="checked_out" />
    </van-tabs>

    <div class="order-list">
      <div v-for="order in list" :key="order.id" class="order-card">
        <div class="card-header">
          <span class="order-no">订单号: {{ order.order_no }}</span>
          <span class="status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="card-body">
          <div class="room-name">海景大床房 (示例)</div>
          <div class="date-info">{{ order.check_in_date }} 至 {{ order.check_out_date }}</div>
          <div class="price">¥{{ order.total_amount }}</div>
        </div>
        <div class="card-footer">
          <van-button v-if="order.status === 'confirmed'" size="small" round>联系管家</van-button>
          <van-button 
            v-if="['confirmed'].includes(order.status)" 
            size="small" 
            type="warning" 
            round 
            plain 
            style="margin-left: 8px;"
            @click="$router.push(`/guest/identity`)"
          >入住登记</van-button>
          <van-button 
            v-if="['confirmed', 'checked_in'].includes(order.status)" 
            size="small" 
            type="primary" 
            round 
            plain 
            style="margin-left: 8px;"
            @click="$router.push(`/guest/guide/${order.id}`)"
          >入住指南</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'

interface Order {
  id: number
  order_no: string
  status: string
  total_amount: number
  check_in_date: string
  check_out_date: string
}

const list = ref<Order[]>([])
const activeTab = ref('all')

const fetchOrders = async () => {
  const res = await request<{ data: Order[] }>({
    url: '/orders', // In real app, should filter by current guest user
    method: 'get'
  })
  list.value = res.data
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '待入住',
    checked_in: '已入住',
    checked_out: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-card {
  background: #fff;
  margin: 10px;
  padding: 16px;
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}
.status {
  color: #1989fa;
}
.room-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.date-info {
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}
.price {
  font-weight: bold;
}
.card-footer {
  margin-top: 12px;
  text-align: right;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}
</style>

<template>
  <div class="order-detail-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div v-if="order">
      <!-- Status Card -->
      <div class="status-card" :class="order.status">
        <div class="status-text">{{ getStatusText(order.status) }}</div>
        <div class="status-desc" v-if="order.status === 'pending'">请尽快确认订单</div>
        <div class="status-desc" v-if="order.status === 'confirmed'">等待客人入住</div>
      </div>

      <!-- Guest Info -->
      <div class="section-card">
        <h3>入住信息</h3>
        <van-cell-group :border="false">
          <van-cell title="入住人" :value="order.guest_info.name" />
          <van-cell title="手机号" :value="order.guest_info.phone">
            <template #right-icon>
              <van-icon name="phone-o" class="phone-icon" @click="callGuest(order.guest_info.phone)" />
            </template>
          </van-cell>
          <van-cell title="入离时间" :value="`${order.check_in_date} 至 ${order.check_out_date}`" />
          <van-cell title="房型" value="标准大床房 (Mock)" />
        </van-cell-group>
      </div>

      <!-- Amount Info -->
      <div class="section-card">
        <h3>费用明细</h3>
        <van-cell-group :border="false">
          <van-cell title="房费总额" :value="`¥${order.total_amount}`" />
          <van-cell title="押金" value="¥0.00" />
          <van-cell title="实付金额">
            <template #value>
              <span class="total-price">¥{{ order.total_amount }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <!-- Actions -->
      <div class="footer-actions">
        <van-button 
          v-if="order.status === 'pending'" 
          block 
          type="primary" 
          @click="handleAction('confirmed')"
        >确认订单</van-button>
        
        <van-button 
          v-if="order.status === 'confirmed'" 
          block 
          type="success" 
          @click="handleAction('checked_in')"
        >办理入住</van-button>
        
        <van-button 
          v-if="order.status === 'checked_in'" 
          block 
          type="warning" 
          @click="handleAction('checked_out')"
        >办理退房</van-button>
        
        <van-button 
          v-if="['pending', 'confirmed'].includes(order.status)" 
          block 
          plain 
          type="danger" 
          style="margin-top: 10px;"
          @click="handleAction('cancelled')"
        >取消订单</van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '@/utils/request'
import { showSuccessToast, showDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const order = ref<any>(null)

const fetchOrder = async () => {
  // In real app, we should have getOrderById API
  // For now, we fetch all and find one, or mock it
  const res = await request<{ data: any[] }>({
    url: '/orders',
    method: 'get'
  })
  order.value = res.data.find(o => o.id === Number(route.params.id))
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

const callGuest = (phone: string) => {
  window.location.href = `tel:${phone}`
}

const handleAction = (newStatus: string) => {
  const actionText = {
    confirmed: '确认订单',
    checked_in: '办理入住',
    checked_out: '办理退房',
    cancelled: '取消订单'
  }[newStatus]

  showDialog({
    title: '确认操作',
    message: `确定要${actionText}吗？`,
    showCancelButton: true
  }).then(async () => {
    await request({
      url: `/orders/${order.value.id}/status`,
      method: 'put',
      data: { status: newStatus }
    })
    showSuccessToast('操作成功')
    fetchOrder() // Refresh
  })
}

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
.order-detail-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

.status-card {
  padding: 30px 20px;
  color: #fff;
  background: linear-gradient(to right, #1989fa, #39b9f6);
}

.status-card.pending { background: linear-gradient(to right, #ff976a, #ffc09f); }
.status-card.confirmed { background: linear-gradient(to right, #1989fa, #39b9f6); }
.status-card.checked_in { background: linear-gradient(to right, #07c160, #4bd68f); }
.status-card.checked_out { background: linear-gradient(to right, #969799, #c8c9cc); }
.status-card.cancelled { background: linear-gradient(to right, #ee0a24, #ff6060); }

.status-text {
  font-size: 24px;
  font-weight: bold;
}

.status-desc {
  margin-top: 8px;
  opacity: 0.9;
}

.section-card {
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
  padding: 16px;
}

h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: bold;
}

.phone-icon {
  font-size: 18px;
  color: #1989fa;
  padding: 4px;
}

.total-price {
  color: #ee0a24;
  font-weight: bold;
  font-size: 18px;
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 16px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}
</style>

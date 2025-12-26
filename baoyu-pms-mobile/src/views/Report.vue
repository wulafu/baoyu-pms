<template>
  <div class="report-page">
    <van-nav-bar title="报表统计" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="今日" />
      <van-tab title="本周" />
      <van-tab title="本月" />
    </van-tabs>

    <div class="stat-cards">
      <div class="card">
        <div class="card-title">总收入</div>
        <div class="card-value">¥{{ stats.total_revenue }}</div>
        <div class="card-trend up">订单量: {{ stats.total_orders }}</div>
      </div>
      <div class="card">
        <div class="card-title">入住率</div>
        <div class="card-value">{{ (stats.occupancy_rate * 100).toFixed(1) }}%</div>
        <div class="card-trend">ADR: ¥{{ stats.avg_price }}</div>
      </div>
    </div>

    <div class="chart-section">
      <h3 class="section-title">营收趋势 (近7天)</h3>
      <div class="mock-chart">
        <div 
          v-for="(item, index) in trendData" 
          :key="index"
          class="bar" 
          :style="{ height: `${Math.min((item.revenue / 2000) * 100, 100)}%` }"
        >
          <span class="bar-val" v-if="item.revenue > 0">{{ item.revenue }}</span>
        </div>
        <div v-if="trendData.length === 0" class="no-data">暂无数据</div>
      </div>
      <div class="chart-labels">
        <span v-for="(item, index) in trendData" :key="index">{{ item.date.slice(5) }}</span>
      </div>
    </div>

    <div class="chart-section">
      <h3 class="section-title">房型销售占比</h3>
      <div class="pie-chart-mock">
        <div class="pie-legend">
          <div class="item"><span class="dot color1"></span>海景房 40%</div>
          <div class="item"><span class="dot color2"></span>大床房 30%</div>
          <div class="item"><span class="dot color3"></span>双床房 20%</div>
          <div class="item"><span class="dot color4"></span>家庭房 10%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'

const activeTab = ref(0) // 0: today, 1: week, 2: month

interface DashboardStats {
  total_revenue: number
  occupancy_rate: number
  total_orders: number
  avg_price: number
}

const stats = ref<DashboardStats>({
  total_revenue: 0,
  occupancy_rate: 0,
  total_orders: 0,
  avg_price: 0
})

const trendData = ref<{ date: string, revenue: number }[]>([])

const fetchStats = async () => {
  // Mock API call based on tab
  // In real implementation, pass date range params
  const res = await request<{ data: DashboardStats }>({
    url: '/reports/dashboard',
    method: 'get'
  })
  stats.value = res.data
}

const fetchTrend = async () => {
  const res = await request<{ data: { date: string, revenue: number }[] }>({
    url: '/reports/trend',
    method: 'get'
  })
  trendData.value = res.data
}

watch(activeTab, () => {
  // Reload data when tab changes (simplified)
  fetchStats()
})

onMounted(() => {
  fetchStats()
  fetchTrend()
})
</script>

<style scoped>
.report-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.stat-cards {
  display: flex;
  padding: 16px;
  gap: 12px;
}

.card {
  flex: 1;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  color: #666;
}

.chart-section {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
}

.mock-chart {
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.bar {
  width: 20px;
  background: #1989fa;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 1px;
}

.bar-val {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #666;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  font-size: 10px;
  color: #999;
}

.no-data {
  width: 100%;
  text-align: center;
  color: #999;
  line-height: 150px;
}

.pie-chart-mock {
  padding: 10px;
}

.pie-legend .item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.color1 { background: #1989fa; }
.color2 { background: #07c160; }
.color3 { background: #ff976a; }
.color4 { background: #ee0a24; }
</style>

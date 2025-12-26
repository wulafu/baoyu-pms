<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日入住</span>
            </div>
          </template>
          <div class="card-value">{{ stats.today.check_ins }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日离店</span>
            </div>
          </template>
          <div class="card-value">{{ stats.today.check_outs }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月营收</span>
            </div>
          </template>
          <div class="card-value">¥{{ stats.month.revenue }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>入住率</span>
            </div>
          </template>
          <div class="card-value">{{ stats.month.occupancy_rate }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>近7天营收趋势</span>
            </div>
          </template>
          <div ref="trendChart" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>渠道分布</span>
            </div>
          </template>
          <div ref="channelChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getDashboardStats, getRevenueTrend, getChannelStats, type TrendData } from '@/api/report'

const stats = ref({
  today: { check_ins: 0, check_outs: 0 },
  month: { revenue: 0, occupancy_rate: '0' }
})

const trendChart = ref<HTMLElement | null>(null)
const channelChart = ref<HTMLElement | null>(null)

const initCharts = async () => {
  if (trendChart.value) {
    const chart = echarts.init(trendChart.value)
    const res = await getRevenueTrend()
    const data = res.data || []
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map((d: TrendData) => d.date) },
      yAxis: { type: 'value' },
      series: [{ data: data.map((d: TrendData) => d.amount), type: 'line', smooth: true }]
    })
  }

  if (channelChart.value) {
    const chart = echarts.init(channelChart.value)
    const res = await getChannelStats()
    const data = res.data || []
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
}

const fetchData = async () => {
  const res = await getDashboardStats()
  if (res.data) {
    stats.value = res.data
  }
}

onMounted(() => {
  fetchData()
  initCharts()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
.mt-4 {
  margin-top: 20px;
}
</style>

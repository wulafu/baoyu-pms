<template>
  <div class="finance-page">
    <van-nav-bar title="财务记账" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div class="summary-card">
      <div class="month">本月支出</div>
      <div class="amount">¥{{ totalExpense }}</div>
    </div>

    <van-tabs v-model:active="activeTab">
      <van-tab title="记一笔" name="add">
        <van-form @submit="onSubmit">
          <van-cell-group inset style="margin-top: 10px;">
            <van-field
              v-model="form.date"
              label="日期"
              readonly
              is-link
              @click="showCalendar = true"
            />
            <van-field
              v-model="form.category"
              label="类别"
              readonly
              is-link
              @click="showPicker = true"
            />
            <van-field
              v-model="form.amount"
              type="number"
              label="金额"
              placeholder="0.00"
            >
              <template #left-icon>¥</template>
            </van-field>
            <van-field
              v-model="form.remark"
              label="备注"
              placeholder="选填"
            />
            <van-field name="uploader" label="凭证">
              <template #input>
                <van-uploader v-model="fileList" />
              </template>
            </van-field>
          </van-cell-group>
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
              保存
            </van-button>
          </div>
        </van-form>
      </van-tab>
      
      <van-tab title="明细" name="list">
        <div class="expense-list">
          <div v-for="item in list" :key="item.id" class="expense-item">
            <div class="left">
              <div class="category">{{ item.category }}</div>
              <div class="date">{{ item.date }}</div>
            </div>
            <div class="amount">-{{ item.amount }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <van-calendar v-model:show="showCalendar" @confirm="onConfirmDate" />
    <van-picker
      v-model:show="showPicker"
      :columns="columns"
      @confirm="onConfirmCategory"
      @cancel="showPicker = false"
    />
    
    <!-- Inline picker workaround since van-picker usually needs popup -->
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker
        :columns="columns"
        @confirm="onConfirmCategory"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import dayjs from 'dayjs'
import request from '@/utils/request'

const activeTab = ref('add')
const showCalendar = ref(false)
const showPicker = ref(false)
const fileList = ref([])

const form = ref({
  date: dayjs().format('YYYY-MM-DD'),
  category: '保洁费',
  amount: '',
  remark: ''
})

const columns = [
  { text: '房租成本', value: 'rent' },
  { text: '水电煤气', value: 'utility' },
  { text: '保洁费', value: 'cleaning' },
  { text: '维修费', value: 'maintenance' },
  { text: '日常采购', value: 'daily' },
  { text: '营销推广', value: 'marketing' }
]

interface FinanceItem {
  id: number
  date: string
  category: string
  amount: number
  remark: string
}

const list = ref<FinanceItem[]>([])

const fetchList = async () => {
  const res = await request<{ data: FinanceItem[] }>({
    url: '/finances',
    method: 'get'
  })
  list.value = res.data
}

const totalExpense = computed(() => {
  return list.value.reduce((sum, item) => sum + Number(item.amount), 0)
})

const onConfirmDate = (date: Date) => {
  form.value.date = dayjs(date).format('YYYY-MM-DD')
  showCalendar.value = false
}

const onConfirmCategory = ({ selectedOptions }: any) => {
  form.value.category = selectedOptions[0].text
  showPicker.value = false
}

const onSubmit = async () => {
  await request({
    url: '/finances',
    method: 'post',
    data: {
      date: form.value.date,
      category: form.value.category,
      amount: Number(form.value.amount),
      remark: form.value.remark,
      type: 'expense'
    }
  })
  
  showSuccessToast('记账成功')
  form.value.amount = ''
  form.value.remark = ''
  activeTab.value = 'list'
  fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.finance-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.summary-card {
  background: #1989fa;
  color: #fff;
  padding: 30px 20px;
  text-align: center;
}

.month {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.amount {
  font-size: 32px;
  font-weight: bold;
}

.expense-list {
  background: #fff;
  margin-top: 10px;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f6f7;
}

.category {
  font-size: 16px;
  color: #333;
}

.date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.amount {
  font-size: 18px;
  font-weight: bold;
  color: #333; /* Expense usually black or red, income green */
}
</style>

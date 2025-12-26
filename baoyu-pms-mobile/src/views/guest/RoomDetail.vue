<template>
  <div class="room-detail">
    <van-nav-bar title="房源详情" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div v-if="room">
      <van-image :src="room.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'" width="100%" height="250" fit="cover" />
      
      <div class="info-section">
        <h1 class="title">{{ room.name }}</h1>
        <div class="price-row">
          <span class="price">¥{{ room.base_price }}</span>
          <span class="unit">/晚</span>
        </div>
        <van-cell-group>
          <van-cell title="可住人数" :value="`${room.max_guests}人`" />
          <van-cell title="房型" value="整套房源" />
        </van-cell-group>
      </div>

      <div class="desc-section">
        <h3>房源介绍</h3>
        <p class="desc">这里是温馨舒适的民宿，设施齐全，交通便利，是您出行的理想选择。</p>
      </div>

      <van-action-bar>
        <van-action-bar-icon icon="chat-o" text="客服" />
        <van-action-bar-button type="danger" text="立即预订" @click="showBooking = true" />
      </van-action-bar>

      <!-- Booking Sheet -->
      <van-action-sheet v-model:show="showBooking" title="预订信息">
        <div class="booking-content">
          <van-form @submit="onSubmitBooking">
            <van-cell-group inset>
              <van-field
                v-model="guestName"
                name="name"
                label="入住人"
                placeholder="请填写入住人姓名"
                :rules="[{ required: true }]"
              />
              <van-field
                v-model="guestPhone"
                name="phone"
                label="手机号"
                placeholder="请填写手机号"
                :rules="[{ required: true }]"
              />
              <van-cell title="入住日期" :value="dateRange" is-link @click="showCalendar = true" />
              <van-cell title="总金额">
                <template #value>
                  <span class="total-price">¥{{ totalPrice }}</span>
                </template>
              </van-cell>
            </van-cell-group>
            <div style="margin: 16px;">
              <van-button round block type="danger" native-type="submit">
                确认支付
              </van-button>
            </div>
          </van-form>
        </div>
      </van-action-sheet>

      <van-calendar 
        v-model:show="showCalendar" 
        type="range" 
        @confirm="onConfirmDate" 
        color="#1989fa"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRooms, type Room } from '@/api/room' // Should have getRoomById API, mocking for now
import { createOrder } from '@/api/order' // Need to implement this
import dayjs from 'dayjs'
import { showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()
const room = ref<Room | null>(null)
const showBooking = ref(false)
const showCalendar = ref(false)
const guestName = ref('')
const guestPhone = ref('')
const dates = ref<Date[]>([new Date(), new Date(Date.now() + 86400000)])

const dateRange = computed(() => {
  const [start, end] = dates.value
  return `${dayjs(start).format('MM-DD')} - ${dayjs(end).format('MM-DD')}`
})

const totalPrice = computed(() => {
  if (!room.value) return 0
  const nights = dayjs(dates.value[1]).diff(dayjs(dates.value[0]), 'day')
  return room.value.base_price * nights
})

const fetchRoom = async () => {
  const res = await getRooms()
  // Mock finding room by ID since API endpoint might not exist yet
  room.value = res.data.find(r => r.id === Number(route.params.id)) || null
}

const onConfirmDate = (values: Date[]) => {
  dates.value = values
  showCalendar.value = false
}

const onSubmitBooking = async () => {
  if (!room.value) return
  
  await createOrder({
    room_id: room.value.id,
    guest_name: guestName.value,
    guest_phone: guestPhone.value,
    check_in_date: dayjs(dates.value[0]).format('YYYY-MM-DD'),
    check_out_date: dayjs(dates.value[1]).format('YYYY-MM-DD'),
    total_amount: totalPrice.value
  })
  
  showSuccessToast('预订成功')
  showBooking.value = false
  router.push('/guest/orders')
}

onMounted(() => {
  fetchRoom()
})
</script>

<style scoped>
.room-detail {
  padding-bottom: 80px;
}
.info-section, .desc-section {
  background: #fff;
  padding: 16px;
  margin-bottom: 10px;
}
.title {
  font-size: 20px;
  margin: 0 0 10px;
}
.price-row {
  color: #ee0a24;
  margin-bottom: 10px;
}
.price {
  font-size: 24px;
  font-weight: bold;
}
.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
.booking-content {
  padding: 20px 0;
}
.total-price {
  color: #ee0a24;
  font-weight: bold;
  font-size: 18px;
}
</style>

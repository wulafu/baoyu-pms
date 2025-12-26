<template>
  <div class="guest-home">
    <van-nav-bar title="宝寓民宿" fixed placeholder />
    
    <!-- Banner -->
    <van-swipe class="banner" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="image in banners" :key="image">
        <img :src="image" style="width: 100%; height: 200px; object-fit: cover;" />
      </van-swipe-item>
    </van-swipe>

    <!-- Search Bar -->
    <div class="search-box">
      <van-cell-group inset>
        <van-cell title="入住/离店日期" is-link @click="showCalendar = true">
          <template #value>
            <span class="date-text">{{ dateRange }}</span>
          </template>
        </van-cell>
      </van-cell-group>
      <div style="padding: 10px 16px;">
        <van-button block type="primary" round @click="onSearch">搜索房源</van-button>
      </div>
    </div>

    <!-- Room List -->
    <div class="room-list">
      <h3 class="section-title">精选房源</h3>
      <div v-for="room in rooms" :key="room.id" class="room-card" @click="goDetail(room.id)">
        <van-image :src="room.image || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'" height="150" fit="cover" />
        <div class="room-info">
          <div class="room-name">{{ room.name }}</div>
          <div class="room-tags">
            <van-tag plain type="primary">可住{{ room.max_guests }}人</van-tag>
            <van-tag plain type="success">免费WiFi</van-tag>
          </div>
          <div class="room-price">
            <span class="price-symbol">¥</span>
            <span class="price-num">{{ room.base_price }}</span>
            <span class="price-unit">/晚</span>
          </div>
        </div>
      </div>
    </div>

    <van-calendar 
      v-model:show="showCalendar" 
      type="range" 
      @confirm="onConfirmDate" 
      color="#1989fa"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRooms, type Room } from '@/api/room'
import dayjs from 'dayjs'

const router = useRouter()
const showCalendar = ref(false)
const dates = ref<Date[]>([new Date(), new Date(Date.now() + 86400000)])
const rooms = ref<Room[]>([])
const banners = [
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg'
]

const dateRange = computed(() => {
  const [start, end] = dates.value
  return `${dayjs(start).format('MM-DD')} - ${dayjs(end).format('MM-DD')} (共${dayjs(end).diff(dayjs(start), 'day')}晚)`
})

const onConfirmDate = (values: Date[]) => {
  dates.value = values
  showCalendar.value = false
}

const onSearch = () => {
  // Filter logic here (mocked for now)
  fetchRooms()
}

const fetchRooms = async () => {
  const res = await getRooms()
  rooms.value = res.data
}

const goDetail = (id: number) => {
  router.push(`/guest/room/${id}`)
}

onMounted(() => {
  fetchRooms()
})
</script>

<style scoped>
.guest-home {
  padding-bottom: 20px;
}

.search-box {
  background: #fff;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  margin: 16px;
  font-size: 18px;
  font-weight: bold;
}

.room-card {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.room-info {
  padding: 12px;
}

.room-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.room-tags {
  margin-bottom: 8px;
}

.room-tags .van-tag {
  margin-right: 4px;
}

.room-price {
  color: #ee0a24;
}

.price-num {
  font-size: 20px;
  font-weight: bold;
}

.price-unit {
  font-size: 12px;
  color: #999;
}
</style>

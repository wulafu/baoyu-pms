<script setup lang="ts">
import { onMounted } from 'vue'
import { io } from 'socket.io-client'
import { showNotify, showDialog } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const socket = io('http://localhost:3000') // Connect to backend

  socket.on('connect', () => {
    console.log('Mobile Socket connected')
  })

  socket.on('new_order', (data: any) => {
    showNotify({
      type: 'success',
      message: `新订单! ${data.source_channel} - ¥${data.total_amount}`,
      duration: 3000,
      onClick: () => {
        router.push(`/orders/${data.id}`)
      }
    })
  })
})
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles override if needed */
body {
  margin: 0;
  background-color: #f7f8fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>

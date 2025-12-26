<template>
  <div class="callback-container" v-loading="loading">
    <div v-if="success" class="result">
      <el-result
        icon="success"
        title="授权成功"
        sub-title="正在跳转回渠道列表..."
      >
      </el-result>
    </div>
    <div v-else-if="error" class="result">
      <el-result
        icon="error"
        title="授权失败"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/channels')">返回列表</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { handleAuthCallback } from '@/api/channel'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const code = route.query.code as string
  const channel = route.query.channel as string // We need to pass channel in state or ensure backend passes it back. 
  // Wait, my mock auth url was `.../authorize?channel=ctrip`. The mock server should pass it back.
  // Standard OAuth doesn't pass it back unless in `state`.
  // For simplicity, let's assume the mock server puts it in query param `channel` or we infer it.
  // Actually, I can store the pending channel in localStorage before redirecting.
  
  const pendingChannel = localStorage.getItem('pending_auth_channel')
  
  if (!code) {
    error.value = '未获取到授权码'
    loading.value = false
    return
  }

  if (!pendingChannel) {
      // Fallback: try to guess or show error
      error.value = '未知渠道来源'
      loading.value = false
      return
  }

  try {
    await handleAuthCallback(pendingChannel, code)
    success.value = true
    localStorage.removeItem('pending_auth_channel')
    setTimeout(() => {
      router.push('/channels')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || '授权失败'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>

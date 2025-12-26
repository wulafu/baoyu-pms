<template>
  <div class="channels-page">
    <van-nav-bar title="渠道直连" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div class="channel-list">
      <div v-for="channel in list" :key="channel.code" class="channel-card">
        <div class="left">
          <van-image :src="channel.icon" width="40" height="40" round />
          <div class="info">
            <div class="name">{{ channel.name }}</div>
            <div class="status-text" :class="channel.status">
              {{ getStatusText(channel.status) }}
            </div>
          </div>
        </div>
        <div class="right">
          <van-switch :model-value="channel.status === 'connected'" size="24px" @change="onToggle(channel)" />
        </div>
      </div>
    </div>

    <!-- Connection Dialog -->
    <van-dialog v-model:show="showConnectDialog" title="连接渠道" show-cancel-button @confirm="confirmConnect">
      <div class="connect-form">
        <div class="form-tip">请输入 {{ currentChannel?.name }} 账号信息以完成授权</div>
        <van-field v-model="authForm.username" label="账号" placeholder="请输入账号/邮箱" />
        <van-field v-model="authForm.password" type="password" label="密码" placeholder="请输入密码" />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'

interface Channel {
  code: string
  name: string
  icon: string
  status: 'connected' | 'disconnected' | 'error'
  sync_enabled: boolean
}

const list = ref<Channel[]>([])
const showConnectDialog = ref(false)
const currentChannel = ref<Channel | null>(null)
const authForm = ref({ username: '', password: '' })

const fetchChannels = async () => {
  const res = await request<{ data: Channel[] }>({
    url: '/channels',
    method: 'get'
  })
  list.value = res.data
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    connected: '已连接',
    disconnected: '未连接',
    error: '授权异常'
  }
  return map[status] || status
}

const onToggle = (channel: Channel) => {
  if (channel.status === 'connected') {
    // Disconnect
    showDialog({
      title: '断开连接',
      message: `确定要断开与 ${channel.name} 的连接吗？断开后将停止同步房态和订单。`,
      showCancelButton: true
    }).then(async () => {
      await disconnect(channel)
    })
  } else {
    // Connect
    currentChannel.value = channel
    authForm.value = { username: '', password: '' }
    showConnectDialog.value = true
  }
}

const confirmConnect = async () => {
  if (!currentChannel.value) return
  if (!authForm.value.username || !authForm.value.password) {
    showToast('请填写完整信息')
    return
  }

  const toast = showLoadingToast({ message: '连接中...', forbidClick: true })
  try {
    await request({
      url: '/channels/connect',
      method: 'post',
      data: {
        channel_code: currentChannel.value.code,
        config: authForm.value
      }
    })
    toast.close()
    showToast('连接成功')
    fetchChannels()
  } catch (error) {
    toast.close()
  }
}

const disconnect = async (channel: Channel) => {
  const toast = showLoadingToast({ message: '断开中...', forbidClick: true })
  try {
    await request({
      url: '/channels/disconnect',
      method: 'post',
      data: { channel_code: channel.code }
    })
    toast.close()
    showToast('已断开')
    fetchChannels()
  } catch (error) {
    toast.close()
  }
}

onMounted(() => {
  fetchChannels()
})
</script>

<style scoped>
.channels-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-top: 10px;
}

.channel-card {
  background: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f6f7;
}

.left {
  display: flex;
  align-items: center;
}

.info {
  margin-left: 12px;
}

.name {
  font-size: 16px;
  font-weight: bold;
}

.status-text {
  font-size: 12px;
  margin-top: 4px;
}

.status-text.connected { color: #07c160; }
.status-text.disconnected { color: #969799; }
.status-text.error { color: #ee0a24; }

.connect-form {
  padding: 20px;
}

.form-tip {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
}
</style>

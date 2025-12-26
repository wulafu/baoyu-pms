<template>
  <div class="mine-page">
    <div class="user-header">
      <van-image
        round
        width="60"
        height="60"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="user-info">
        <div class="username">{{ user?.name || '管理员' }}</div>
        <div class="role">{{ user?.role || '店长' }}</div>
      </div>
    </div>

    <van-cell-group inset class="menu-group">
      <van-cell title="门店设置" is-link icon="shop-o" />
      <van-cell title="渠道直连" is-link icon="cluster-o" to="/channels" />
      <van-cell title="客房保洁" is-link icon="brush-o" to="/housekeeping" />
      <van-cell title="财务记账" is-link icon="balance-list-o" to="/finance" />
      <van-cell title="员工管理" is-link icon="friends-o" />
      <van-cell title="报表统计" is-link icon="chart-trending-o" to="/report" />
    </van-cell-group>

    <div class="logout-btn">
      <van-button block type="danger" @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog } from 'vant'

const router = useRouter()
const user = ref<any>(null)

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    user.value = JSON.parse(userStr)
  }
})

const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？',
    showCancelButton: true
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  })
}
</script>

<style scoped>
.mine-page {
  padding-top: 20px;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  margin-bottom: 20px;
}

.user-info {
  margin-left: 15px;
}

.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.role {
  font-size: 12px;
  color: #969799;
  background: #f5f6f7;
  padding: 2px 6px;
  border-radius: 4px;
}

.menu-group {
  margin-bottom: 20px;
}

.logout-btn {
  margin: 20px;
}
</style>

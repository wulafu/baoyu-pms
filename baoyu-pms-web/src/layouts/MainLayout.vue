<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="main-aside">
      <div class="logo">
        <img src="@/assets/vue.svg" alt="logo" class="logo-img" />
        <h2>宝寓PMS</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>经营看板</span>
        </el-menu-item>
        <el-menu-item index="/calendar">
          <el-icon><Calendar /></el-icon>
          <span>房态日历</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/channels">
          <el-icon><Connection /></el-icon>
          <span>渠道直连</span>
        </el-menu-item>
        <el-menu-item index="/rules">
          <el-icon><Cpu /></el-icon>
          <span>智能规则</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container class="is-vertical">
      <el-header>
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">Admin</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Odometer, Calendar, List, Connection, Setting, ArrowDown, Cpu } from '@element-plus/icons-vue'
import { io } from 'socket.io-client'
import { ElNotification } from 'element-plus'

const route = useRoute()
const router = useRouter()
const activeMenu = computed(() => route.path)

const currentRouteName = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': '经营看板',
    '/calendar': '房态日历',
    '/orders': '订单管理',
    '/channels': '渠道直连',
    '/rules': '智能规则',
    '/settings': '系统设置'
  }
  return map[route.path] || ''
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  // Initialize WebSocket Client
  const socket = io('http://localhost:3000')

  socket.on('connect', () => {
    console.log('WebSocket connected')
  })

  socket.on('new_order', (data: any) => {
    ElNotification({
      title: '新订单提醒',
      message: `收到来自 ${data.source_channel} 的新订单！金额：¥${data.total_amount}`,
      type: 'success',
      duration: 5000,
      onClick: () => router.push(`/orders/${data.id}`)
    })
  })
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
}

.main-aside {
  background-color: #304156;
  color: #333;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
  
  .logo {
    height: 60px;
    line-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background-color: #2b3649;
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    
    .logo-img {
      width: 24px;
      height: 24px;
    }
    
    h2 {
      margin: 0;
      font-size: 18px;
    }
  }
  
  .el-menu-vertical {
    border-right: none;
    flex: 1;
  }
}

.is-vertical {
  flex-direction: column;
  height: 100%;
  flex: 1;
  width: 0; /* Important for flex child to not overflow */
}

.el-header {
  background-color: #fff;
  color: #333;
  height: 60px;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  z-index: 10;
}

.header-right {
  .el-dropdown-link {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    
    .username {
      margin: 0 8px;
      font-weight: 500;
    }
  }
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  box-sizing: border-box;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

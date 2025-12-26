<template>
  <div class="layout-container">
    <router-view />
    
    <van-tabbar route>
      <van-tabbar-item replace to="/calendar" icon="calendar-o">房态</van-tabbar-item>
      <van-tabbar-item replace to="/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.layout-container {
  padding-bottom: 50px; /* Space for tabbar */
  min-height: 100vh;
  background: #f7f8fa;
}
</style>

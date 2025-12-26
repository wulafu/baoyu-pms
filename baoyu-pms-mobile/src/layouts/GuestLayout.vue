<template>
  <div class="guest-layout">
    <router-view />
    
    <van-tabbar route>
      <van-tabbar-item replace to="/guest/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/guest/orders" icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item replace to="/guest/mine" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.guest-layout {
  padding-bottom: 50px;
  min-height: 100vh;
  background: #f7f8fa;
}
</style>

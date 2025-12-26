<template>
  <div class="guest-mine">
    <div class="header">
      <van-image
        round
        width="60"
        height="60"
        src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
      />
      <div class="info">
        <div class="name">亲爱的房客</div>
        <div class="tag">普通会员</div>
      </div>
    </div>

    <van-cell-group inset>
      <van-cell title="联系客服" is-link icon="service-o" />
      <van-cell title="意见反馈" is-link icon="comment-o" />
      <van-cell title="关于我们" is-link icon="info-o" />
    </van-cell-group>

    <div class="logout">
      <van-button block @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.header {
  background: #fff;
  padding: 30px 20px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.info {
  margin-left: 16px;
}
.name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}
.tag {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}
.logout {
  margin: 20px;
}
</style>

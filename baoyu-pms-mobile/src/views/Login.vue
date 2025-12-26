<template>
  <div class="login-page">
    <div class="header">
      <img src="@/assets/vue.svg" alt="logo" class="logo" />
      <h1>宝寓 PMS</h1>
      <p class="subtitle">让民宿经营更简单</p>
    </div>

    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field
          v-model="code"
          name="code"
          label="凭证"
          placeholder="请输入登录凭证 (示例: mock_code_123)"
          :rules="[{ required: true, message: '请填写登录凭证' }]"
        />
        <van-field
          v-model="password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
        />
      </van-cell-group>
      
      <div style="margin: 30px 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登 录
        </van-button>
      </div>
    </van-form>
    
    <div class="footer">
      <p>未注册？请联系管理员</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { showSuccessToast } from 'vant'

const router = useRouter()
const activeRole = ref('manager')
const code = ref('mock_code_123')
const password = ref('')
const loading = ref(false)

const onSubmit = async () => {
  try {
    loading.value = true
    
    if (activeRole.value === 'guest') {
      // Guest login logic (simplified)
      localStorage.setItem('token', 'guest-token')
      localStorage.setItem('user', JSON.stringify({ name: 'Guest', role: 'guest' }))
      showSuccessToast('欢迎回来')
      router.push('/guest/home')
      return
    }

    const res = await login({ code: code.value, password: password.value })
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      showSuccessToast('登录成功')
      router.push('/calendar') // Manager home
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-top: 60px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

h1 {
  font-size: 24px;
  color: #323233;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: #969799;
  margin: 0;
}

.footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #969799;
}
</style>

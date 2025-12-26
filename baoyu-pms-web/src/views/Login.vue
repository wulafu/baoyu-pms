<template>
  <div class="login-wrapper">
    <div class="login-box">
      <el-row style="height: 100%">
        <!-- Left Brand Section -->
        <el-col :span="10" class="login-left">
          <div class="brand-content">
            <div class="logo-area">
              <img src="@/assets/vue.svg" alt="Logo" class="logo" />
              <h1>宝寓 PMS</h1>
            </div>
            <p class="slogan">连接无限可能<br>让民宿经营更简单</p>
            <div class="decoration">
              <div class="circle c1"></div>
              <div class="circle c2"></div>
            </div>
          </div>
        </el-col>
        
        <!-- Right Form Section -->
        <el-col :span="14" class="login-right">
          <div class="form-container">
            <h2 class="welcome-text">{{ activeTab === 'login' ? '欢迎回来' : '创建账户' }}</h2>
            
            <el-tabs v-model="activeTab" class="custom-tabs">
              <el-tab-pane label="账号登录" name="login">
                <el-form :model="loginForm" size="large" @submit.prevent="handleLogin">
                  <el-form-item>
                    <el-input 
                      v-model="loginForm.code" 
                      placeholder="登录凭证 (示例: mock_code_123)" 
                      :prefix-icon="User"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-input 
                      v-model="loginForm.password" 
                      type="password" 
                      placeholder="密码 (任意)" 
                      :prefix-icon="Lock"
                      show-password
                    />
                  </el-form-item>
                  <div class="form-actions">
                    <el-checkbox>记住我</el-checkbox>
                    <el-button link type="primary">忘记密码？</el-button>
                  </div>
                  <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
                    登 录
                  </el-button>
                </el-form>
              </el-tab-pane>
              
              <el-tab-pane label="快速注册" name="register">
                <el-form :model="registerForm" size="large" @submit.prevent="handleRegister">
                  <el-form-item>
                    <el-input 
                      v-model="registerForm.phone" 
                      placeholder="手机号" 
                      :prefix-icon="Iphone"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-input 
                      v-model="registerForm.nickname" 
                      placeholder="昵称" 
                      :prefix-icon="User"
                    />
                  </el-form-item>
                  <el-button type="primary" class="submit-btn" :loading="loading" @click="handleRegister">
                    注册并登录
                  </el-button>
                  <div class="register-footer">
                    注册即代表同意 <el-button link type="primary">《服务条款》</el-button>
                  </div>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, register } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('login')
const loading = ref(false)

const loginForm = ref({ code: 'mock_code_123', password: '' })
const registerForm = ref({ nickname: '', phone: '' })

const handleLogin = async () => {
  if (!loginForm.value.code) {
    ElMessage.warning('请输入登录凭证')
    return
  }
  
  try {
    loading.value = true
    const res = await login({ code: loginForm.value.code })
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error) {
    // Error handled in interceptor
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.nickname || !registerForm.value.phone) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    loading.value = true
    const res = await register(registerForm.value)
    if (res.token) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      
      ElMessage.success('注册成功')
      router.push('/')
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: radial-gradient(#e1e6eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.login-box {
  width: 900px;
  height: 550px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  
  .login-left {
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    color: #fff;
    padding: 40px;
    position: relative;
    display: flex;
    align-items: center;
    
    .brand-content {
      position: relative;
      z-index: 2;
    }
    
    .logo-area {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .logo {
        width: 40px;
        height: 40px;
        margin-right: 15px;
        filter: brightness(100);
      }
      
      h1 {
        font-size: 28px;
        margin: 0;
        font-weight: 600;
      }
    }
    
    .slogan {
      font-size: 18px;
      line-height: 1.6;
      opacity: 0.9;
    }
    
    .decoration {
      .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
      }
      .c1 { width: 200px; height: 200px; top: -50px; right: -50px; }
      .c2 { width: 100px; height: 100px; bottom: 50px; left: -20px; }
    }
  }
  
  .login-right {
    padding: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .welcome-text {
      font-size: 24px;
      color: #303133;
      margin-bottom: 30px;
    }
    
    .custom-tabs {
      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
        background-color: #f0f0f0;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .submit-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      border-radius: 4px;
    }
    
    .register-footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #909399;
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    height: auto;
    flex-direction: column;
    
    .login-left {
      display: none;
    }
    
    .login-right {
      padding: 30px;
    }
  }
}
</style>

<template>
  <div class="mock-oauth">
    <div class="oauth-card">
      <h2>Mock OTA Authorization</h2>
      <p>You are authorizing <strong>BaoYu PMS</strong> to access your <strong>{{ channel }}</strong> account.</p>
      
      <div class="permissions">
        <p>Permissions requested:</p>
        <ul>
          <li>Read property information</li>
          <li>Read booking details</li>
          <li>Update room inventory and rates</li>
        </ul>
      </div>

      <div class="actions">
        <el-button @click="deny">Deny</el-button>
        <el-button type="primary" @click="approve" :loading="loading">Approve</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(false)

const channel = computed(() => (route.query.channel as string) || 'Unknown Channel')
const redirectUri = computed(() => (route.query.redirect_uri as string) || '')

const approve = () => {
  loading.value = true
  setTimeout(() => {
    // Generate a fake code
    const code = 'mock_auth_code_' + Math.random().toString(36).substring(7)
    
    // Redirect back
    if (redirectUri.value) {
        const separator = redirectUri.value.includes('?') ? '&' : '?'
        window.location.href = `${redirectUri.value}${separator}code=${code}`
    } else {
        alert('No redirect URI provided')
    }
  }, 1000)
}

const deny = () => {
  if (redirectUri.value) {
      window.location.href = `${redirectUri.value}?error=access_denied`
  }
}
</script>

<style scoped>
.mock-oauth {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}
.oauth-card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 400px;
  text-align: center;
}
.permissions {
  text-align: left;
  margin: 20px 0;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}
</style>

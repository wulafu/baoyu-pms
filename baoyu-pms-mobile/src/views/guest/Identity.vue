<template>
  <div class="identity-page">
    <van-nav-bar title="入住登记" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div class="upload-section">
      <div class="id-card-box" @click="triggerUpload('front')">
        <van-image v-if="frontImg" :src="frontImg" fit="cover" width="100%" height="100%" />
        <div v-else class="placeholder">
          <van-icon name="photograph" size="40" />
          <p>上传身份证人像面</p>
        </div>
      </div>
      
      <div class="id-card-box" @click="triggerUpload('back')">
        <van-image v-if="backImg" :src="backImg" fit="cover" width="100%" height="100%" />
        <div v-else class="placeholder">
          <van-icon name="photograph" size="40" />
          <p>上传身份证国徽面</p>
        </div>
      </div>
    </div>

    <van-form @submit="onSubmit">
      <van-cell-group inset title="识别信息">
        <van-field
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="上传后自动识别"
          :rules="[{ required: true }]"
        />
        <van-field
          v-model="form.idNo"
          name="idNo"
          label="身份证号"
          placeholder="上传后自动识别"
          :rules="[{ required: true }]"
        />
      </van-cell-group>
      
      <div style="margin: 30px 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          确认提交
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showSuccessToast, showLoadingToast, closeToast } from 'vant'
import { useRouter } from 'vue-router'

const router = useRouter()
const frontImg = ref('')
const backImg = ref('')
const loading = ref(false)

const form = ref({
  name: '',
  idNo: ''
})

const triggerUpload = (side: string) => {
  // Mock upload and OCR
  const toast = showLoadingToast({ message: '识别中...', forbidClick: true })
  
  setTimeout(() => {
    if (side === 'front') {
      frontImg.value = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg' // Mock ID image
      form.value.name = '张三'
      form.value.idNo = '110101199001011234'
    } else {
      backImg.value = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    }
    closeToast()
    showSuccessToast('识别成功')
  }, 1000)
}

const onSubmit = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    showSuccessToast('登记成功')
    router.back()
  }, 1000)
}
</script>

<style scoped>
.identity-page {
  background: #f7f8fa;
  min-height: 100vh;
}

.upload-section {
  padding: 20px;
  display: flex;
  gap: 16px;
}

.id-card-box {
  flex: 1;
  height: 120px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #ddd;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  text-align: center;
  color: #999;
}

.placeholder p {
  margin: 8px 0 0;
  font-size: 12px;
}
</style>

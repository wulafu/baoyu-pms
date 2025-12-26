<template>
  <div class="guide-page">
    <van-nav-bar title="入住指南" left-arrow @click-left="$router.back()" fixed placeholder />
    
    <div class="guide-card">
      <h3>门锁密码</h3>
      <div class="password-box">
        <span class="password">8829#</span>
        <div class="tip">仅在入住期间有效</div>
      </div>
    </div>

    <div class="guide-card">
      <h3>Wi-Fi</h3>
      <van-cell-group>
        <van-cell title="账号" value="Baoyu_Guest_5G" is-link @click="copy('Baoyu_Guest_5G')" />
        <van-cell title="密码" value="welcome123" is-link @click="copy('welcome123')" />
      </van-cell-group>
    </div>

    <div class="guide-card">
      <h3>位置导航</h3>
      <div class="map-placeholder">
        地图组件占位 (点击导航)
      </div>
      <van-button block type="primary" icon="guide-o" style="margin-top: 10px;">一键导航</van-button>
    </div>

    <div class="guide-card">
      <h3>使用说明</h3>
      <van-collapse v-model="activeNames">
        <van-collapse-item title="如何使用热水器" name="1">
          热水器已设置为恒温模式，直接打开水龙头即可使用热水。如需调节温度，请使用墙面控制面板。
        </van-collapse-item>
        <van-collapse-item title="投影仪操作指南" name="2">
          遥控器在茶几抽屉内。打开电源后，可直接投屏或观看内置应用。
        </van-collapse-item>
        <van-collapse-item title="垃圾分类" name="3">
          请将干湿垃圾分开投放，垃圾桶位于厨房水槽下方。
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

const activeNames = ref(['1'])

const copy = (text: string) => {
  // Navigator clipboard API
  navigator.clipboard.writeText(text).then(() => {
    showToast('复制成功')
  })
}
</script>

<style scoped>
.guide-page {
  background: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

.guide-card {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.password-box {
  text-align: center;
  padding: 20px;
  background: #f0f9eb;
  border-radius: 8px;
  color: #52c41a;
}

.password {
  font-size: 32px;
  font-weight: bold;
  letter-spacing: 4px;
}

.tip {
  font-size: 12px;
  margin-top: 8px;
  opacity: 0.8;
}

.map-placeholder {
  height: 150px;
  background: #eef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 4px;
}
</style>

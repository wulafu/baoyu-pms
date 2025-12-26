<template>
  <div class="calendar-page">
    <h2>房态日历</h2>
    <CalendarBoard />
  </div>
</template>

<script setup lang="ts">
import CalendarBoard from '@/components/CalendarBoard.vue'
</script>

<style scoped>
.calendar-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style>

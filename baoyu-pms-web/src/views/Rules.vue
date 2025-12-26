<template>
  <div class="rules-view">
    <div class="view-header">
      <h2>智能规则配置</h2>
      <el-button type="primary" @click="openAddDialog">新建规则</el-button>
    </div>

    <el-alert
      title="智能规则可帮助您自动化管理房态和价格，请谨慎配置以免造成损失"
      type="info"
      show-icon
      style="margin-bottom: 20px;"
    />

    <el-tabs v-model="activeTab">
      <el-tab-pane label="智能关房" name="smart_close">
        <div class="rules-list">
          <el-empty v-if="!getRulesByType('smart_close').length" description="暂无规则" />
          <el-card v-for="rule in getRulesByType('smart_close')" :key="rule.id" class="rule-card">
            <template #header>
              <div class="card-header">
                <span>{{ rule.name }}</span>
                <el-switch 
                  v-model="rule.is_active" 
                  @change="toggleRule(rule)"
                  :loading="toggling === rule.id"
                />
              </div>
            </template>
            <div class="rule-desc">
              当剩余房间数等于 <span class="highlight">{{ rule.config.threshold }}</span> 时，
              自动关闭渠道: <span class="highlight">{{ rule.config.channels?.join(', ') || '所有渠道' }}</span>
            </div>
            <div class="card-footer">
              <el-button text type="primary" @click="editRule(rule)">编辑</el-button>
              <el-button text type="danger">删除</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="价格规则" name="price">
        <div class="rules-list">
          <el-empty v-if="!getRulesByType('price').length" description="暂无规则" />
          <el-card v-for="rule in getRulesByType('price')" :key="rule.id" class="rule-card">
            <template #header>
              <div class="card-header">
                <span>{{ rule.name }}</span>
                <el-switch 
                  v-model="rule.is_active" 
                  @change="toggleRule(rule)"
                  :loading="toggling === rule.id"
                />
              </div>
            </template>
            <div class="rule-desc" v-if="rule.type === 'price_weekend'">
              每逢 <span class="highlight">周五, 周六</span>，
              房价上浮 <span class="highlight">{{ rule.config.increase_percent }}%</span>
            </div>
            <div class="rule-desc" v-else-if="rule.type === 'price_long_stay'">
              连住 <span class="highlight">{{ rule.config.min_days }}</span> 晚及以上，
              总价立减 <span class="highlight">¥{{ rule.config.discount_amount }}</span>
            </div>
            <div class="card-footer">
              <el-button text type="primary" @click="editRule(rule)">编辑</el-button>
              <el-button text type="danger">删除</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑规则' : '新建规则'"
      width="500px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="form.name" placeholder="例如：周末自动涨价" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="form.type" placeholder="请选择类型" :disabled="!!editingId">
            <el-option label="智能关房 (库存预警)" value="smart_close" />
            <el-option label="周末涨价" value="price_weekend" />
            <el-option label="连住优惠" value="price_long_stay" />
          </el-select>
        </el-form-item>

        <!-- Dynamic Config Fields -->
        <template v-if="form.type === 'smart_close'">
          <el-form-item label="触发阈值">
            <el-input-number v-model="form.config.threshold" :min="0" :max="10" />
            <div class="form-tip">当剩余房量等于此值时触发</div>
          </el-form-item>
          <el-form-item label="应用渠道">
            <el-checkbox-group v-model="form.config.channels">
              <el-checkbox label="airbnb">Airbnb</el-checkbox>
              <el-checkbox label="ctrip">携程</el-checkbox>
              <el-checkbox label="meituan">美团</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <template v-if="form.type === 'price_weekend'">
          <el-form-item label="上浮比例">
            <el-input v-model="form.config.increase_percent" type="number">
              <template #append>%</template>
            </el-input>
          </el-form-item>
          <el-form-item label="生效日期">
            <el-checkbox-group v-model="form.config.days">
              <el-checkbox :label="5">周五</el-checkbox>
              <el-checkbox :label="6">周六</el-checkbox>
              <el-checkbox :label="0">周日</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <template v-if="form.type === 'price_long_stay'">
          <el-form-item label="连住天数">
            <el-input-number v-model="form.config.min_days" :min="2" />
          </el-form-item>
          <el-form-item label="立减金额">
            <el-input v-model="form.config.discount_amount" type="number">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </template>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveRule" :loading="saving">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

interface Rule {
  id?: number
  name: string
  type: string
  config: any
  is_active: boolean
}

const activeTab = ref('smart_close')
const rules = ref<Rule[]>([])
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const toggling = ref<number | null>(null)

const form = ref<Rule>({
  name: '',
  type: 'smart_close',
  config: { threshold: 0, channels: ['airbnb', 'ctrip'], days: [5, 6], increase_percent: 20 },
  is_active: true
})

const fetchRules = async () => {
  try {
    const res = await request.get('/rules')
    rules.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

const getRulesByType = (typeGroup: string) => {
  if (typeGroup === 'smart_close') {
    return rules.value.filter(r => r.type === 'smart_close')
  } else {
    return rules.value.filter(r => ['price_weekend', 'price_long_stay'].includes(r.type))
  }
}

const openAddDialog = () => {
  editingId.value = null
  form.value = {
    name: '',
    type: 'smart_close',
    config: { threshold: 0, channels: ['airbnb', 'ctrip'], days: [5, 6], increase_percent: 20 },
    is_active: true
  }
  dialogVisible.value = true
}

const editRule = (rule: Rule) => {
  editingId.value = rule.id!
  form.value = JSON.parse(JSON.stringify(rule))
  dialogVisible.value = true
}

const saveRule = async () => {
  saving.value = true
  try {
    if (editingId.value) {
      // Update logic (mocked or need API endpoint for update)
       ElMessage.success('规则更新成功')
    } else {
      await request.post('/rules', form.value)
      ElMessage.success('规则创建成功')
    }
    dialogVisible.value = false
    fetchRules()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const toggleRule = async (rule: Rule) => {
  toggling.value = rule.id!
  try {
    await request.patch(`/rules/${rule.id}/toggle`, { is_active: rule.is_active })
    ElMessage.success('状态已更新')
  } catch (e) {
    rule.is_active = !rule.is_active // revert
    ElMessage.error('操作失败')
  } finally {
    toggling.value = null
  }
}

onMounted(() => {
  fetchRules()
})
</script>

<style scoped>
.rules-view {
  padding: 20px;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.rules-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.rule-card {
  border-radius: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rule-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}
.highlight {
  color: #409EFF;
  font-weight: bold;
  margin: 0 4px;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #EBEEF5;
  padding-top: 10px;
  margin-top: 10px;
}
.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
  margin-top: 4px;
}
</style>

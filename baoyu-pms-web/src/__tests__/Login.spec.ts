import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from '@/views/Login.vue'
import { login, register } from '@/api/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// Mock API
vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn()
}))

// Mock Router
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

// Mock Element Plus Message
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}))

describe('Login.vue', () => {
  const pushMock = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useRouter as any).mockReturnValue({
      push: pushMock
    })
  })

  it('renders login form by default', () => {
    const wrapper = mount(Login, {
      global: {
        stubs: {
          'el-row': { template: '<div><slot /></div>' },
          'el-col': { template: '<div><slot /></div>' },
          'el-tabs': { template: '<div><slot /></div>' },
          'el-tab-pane': { template: '<div><slot /></div>' },
          'el-form': { template: '<form @submit.prevent><slot /></form>' },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { template: '<input />', props: ['modelValue'] },
          'el-button': { template: '<button><slot /></button>' },
          'el-checkbox': true,
          'el-icon': true
        }
      }
    })
    expect(wrapper.text()).toContain('欢迎回来')
    expect(wrapper.text()).toContain('宝寓 PMS')
  })

  it('handles login success', async () => {
    const mockUser = { id: 1, name: 'Test User' }
    const mockToken = 'mock-token'
    ;(login as any).mockResolvedValue({ token: mockToken, user: mockUser })

    const wrapper = mount(Login, {
      global: {
        stubs: {
          'el-row': { template: '<div><slot /></div>' },
          'el-col': { template: '<div><slot /></div>' },
          'el-tabs': { template: '<div><slot /></div>' },
          'el-tab-pane': { template: '<div><slot /></div>' },
          'el-form': { template: '<form @submit.prevent><slot /></form>' },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { 
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', 
            props: ['modelValue'] 
          },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'el-checkbox': true,
          'el-icon': true
        }
      }
    })

    // Simulate input (if inputs were found, but we used deep stubs or specific stubs)
    // Since we mocked el-input as a simple input, we can set values directly on vm or find inputs
    // But loginForm.code has default value 'mock_code_123', so we can just click login
    
    const loginBtn = wrapper.findAll('button').filter(b => b.text().includes('登 录'))[0]
    await loginBtn.trigger('click')

    expect(login).toHaveBeenCalledWith({ code: 'mock_code_123' })
    expect(ElMessage.success).toHaveBeenCalledWith('登录成功')
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('validates empty input', async () => {
    const wrapper = mount(Login, {
      global: {
        stubs: {
          'el-row': { template: '<div><slot /></div>' },
          'el-col': { template: '<div><slot /></div>' },
          'el-tabs': { template: '<div><slot /></div>' },
          'el-tab-pane': { template: '<div><slot /></div>' },
          'el-form': { template: '<form @submit.prevent><slot /></form>' },
          'el-form-item': { template: '<div><slot /></div>' },
          'el-input': { 
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', 
            props: ['modelValue'] 
          },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          'el-checkbox': true,
          'el-icon': true
        }
      }
    })

    // Clear code
    // accessing component instance data to set it directly is easier with simple stubs
    ;(wrapper.vm as any).loginForm.code = ''
    
    const loginBtn = wrapper.findAll('button').filter(b => b.text().includes('登 录'))[0]
    if (loginBtn) {
      await loginBtn.trigger('click')
    }

    expect(login).not.toHaveBeenCalled()
    expect(ElMessage.warning).toHaveBeenCalledWith('请输入登录凭证')
  })
})

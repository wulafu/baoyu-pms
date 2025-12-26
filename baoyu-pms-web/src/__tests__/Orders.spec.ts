import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Orders from '@/views/Orders.vue'
import { getOrders } from '@/api/order'
import { getRooms } from '@/api/room'
import { nextTick } from 'vue'

// Mock API
vi.mock('@/api/order', () => ({
  getOrders: vi.fn(),
  updateOrderStatus: vi.fn(),
  createOrder: vi.fn()
}))

vi.mock('@/api/room', () => ({
  getRooms: vi.fn()
}))

// Mock Element Plus Message
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue('confirm')
  }
}))

describe('Orders.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders orders table', async () => {
    const mockOrders = [
      { 
        id: 1, 
        order_no: 'ORD001', 
        guest_info: { name: 'Guest A', phone: '123' }, 
        status: 'confirmed', 
        total_amount: 500,
        check_in_date: '2023-10-01',
        check_out_date: '2023-10-02',
        created_at: '2023-09-01T10:00:00Z'
      }
    ]
    const mockRooms = [{ id: 1, name: 'Room 101' }]

    ;(getOrders as any).mockResolvedValue({ data: mockOrders })
    ;(getRooms as any).mockResolvedValue({ data: mockRooms })

    const wrapper = mount(Orders, {
      global: {
        stubs: {
          'el-input': true,
          'el-button': true,
          'el-tabs': true,
          'el-tab-pane': true,
          'el-table': {
            template: `
              <div>
                <div v-for="row in data" :key="row.id" class="mock-row">
                  {{ row.order_no }} - {{ row.status }}
                  <slot name="default" :row="row" />
                </div>
              </div>
            `,
            props: ['data']
          },
          'el-table-column': true,
          'el-tag': true,
          'el-pagination': true,
          'el-dialog': true,
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-date-picker': true,
          'el-input-number': true,
          'el-icon': true
        },
        directives: {
          loading: () => {}
        }
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()

    expect(getOrders).toHaveBeenCalled()
    expect(wrapper.text()).toContain('ORD001')
    expect(wrapper.text()).toContain('confirmed')
  })
})

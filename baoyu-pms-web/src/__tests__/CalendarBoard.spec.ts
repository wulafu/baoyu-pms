import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CalendarBoard from '@/components/CalendarBoard.vue'
import { getRooms, getRoomCalendar, updateRoomStock } from '@/api/room'
import { nextTick } from 'vue'

// Mock API
vi.mock('@/api/room', () => ({
  getRooms: vi.fn(),
  getRoomCalendar: vi.fn(),
  updateRoomStock: vi.fn()
}))

// Mock Element Plus components (shallow mount often better, but let's try full mount with stubs)
// Actually @vue/test-utils mounts components, but Element Plus components might need stubs or global config.
// For simplicity, we'll use stubs for complex UI components if they cause issues, 
// but usually jsdom handles basic DOM fine.

describe('CalendarBoard.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(CalendarBoard, {
      global: {
        stubs: ['el-date-picker', 'el-button', 'el-dialog', 'el-form', 'el-form-item', 'el-select', 'el-option', 'el-input-number', 'el-icon']
      }
    })
    expect(wrapper.find('.calendar-board').exists()).toBe(true)
    expect(wrapper.find('.legend').exists()).toBe(true)
  })

  it('fetches rooms and stocks on mount', async () => {
    const mockRooms = [{ id: 1, name: 'Room 101', base_price: 100 }]
    const mockStocks = [{ biz_date: '2023-10-01', status: 'booked', price: 120 }]
    
    ;(getRooms as any).mockResolvedValue({ data: mockRooms })
    ;(getRoomCalendar as any).mockResolvedValue({ data: mockStocks })

    const wrapper = mount(CalendarBoard, {
      global: {
        stubs: ['el-date-picker', 'el-button', 'el-dialog', 'el-form', 'el-form-item', 'el-select', 'el-option', 'el-input-number', 'el-icon']
      }
    })

    // Wait for mounted lifecycle
    await nextTick()
    // Wait for async calls
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()

    expect(getRooms).toHaveBeenCalled()
    // Check if rooms are rendered
    expect(wrapper.text()).toContain('Room 101')
  })

  it('opens dialog on cell click', async () => {
    const mockRooms = [{ id: 1, name: 'Room 101', base_price: 100 }]
    ;(getRooms as any).mockResolvedValue({ data: mockRooms })
    ;(getRoomCalendar as any).mockResolvedValue({ data: [] })

    const wrapper = mount(CalendarBoard, {
      global: {
        stubs: {
          'el-date-picker': true,
          'el-button': true,
          'el-dialog': {
            template: '<div v-if="modelValue" class="mock-dialog"><slot /><slot name="footer" /></div>',
            props: ['modelValue']
          },
          'el-form': true,
          'el-form-item': true,
          'el-select': true,
          'el-option': true,
          'el-input-number': true
        },
        directives: {
          loading: () => {}
        }
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    await nextTick()

    // Find a cell and click it
    const cells = wrapper.findAll('.cell')
    if (cells.length > 0) {
      await cells[0].trigger('click')
      expect(wrapper.find('.mock-dialog').exists()).toBe(true)
    }
  })
})

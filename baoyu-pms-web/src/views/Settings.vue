<template>
  <div class="settings-view">
    <h2>Settings</h2>
    
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- Property Info -->
      <el-tab-pane label="Property Info" name="property">
        <el-card class="settings-card" v-loading="loadingProperty">
          <el-form :model="propertyForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="Name">
              <el-input v-model="propertyForm.name" />
            </el-form-item>
            <el-form-item label="Address">
              <el-input v-model="propertyForm.address" type="textarea" />
            </el-form-item>
            <el-form-item label="Phone">
              <el-input v-model="propertyForm.phone" />
            </el-form-item>
            <el-form-item label="Description">
              <el-input v-model="propertyForm.description" type="textarea" rows="3" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProperty">Save Changes</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- Room Management -->
      <el-tab-pane label="Room Management" name="rooms">
        <div class="tab-actions">
          <el-button type="primary" @click="openAddRoom">Add Room</el-button>
        </div>
        
        <el-table :data="rooms" style="width: 100%" v-loading="loadingRooms">
          <el-table-column prop="name" label="Room Name" width="180" />
          <el-table-column prop="max_guests" label="Max Guests" width="120" />
          <el-table-column prop="base_price" label="Base Price" width="120">
            <template #default="{ row }">¥{{ row.base_price }}</template>
          </el-table-column>
          <el-table-column prop="status" label="Status" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cleaning_status" label="Cleaning" width="120">
             <template #default="{ row }">
               <el-tag :type="getCleaningTag(row.cleaning_status)">{{ row.cleaning_status || 'clean' }}</el-tag>
             </template>
          </el-table-column>
          <el-table-column label="Actions" min-width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="openEditRoom(row)">Edit</el-button>
              <el-button link type="danger" @click="handleDeleteRoom(row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Add/Edit Room Dialog -->
    <el-dialog v-model="roomDialogVisible" :title="isEditMode ? 'Edit Room' : 'Add New Room'" width="500px">
      <el-form :model="roomForm" label-width="100px">
        <el-form-item label="Room Name">
          <el-input v-model="roomForm.name" placeholder="e.g. 101 or Ocean Suite" />
        </el-form-item>
        <el-form-item label="Max Guests">
           <el-input-number v-model="roomForm.max_guests" :min="1" />
        </el-form-item>
        <el-form-item label="Base Price">
          <el-input-number v-model="roomForm.base_price" :min="0" :step="10" />
        </el-form-item>
        <el-form-item label="Status" v-if="isEditMode">
           <el-select v-model="roomForm.status">
             <el-option label="Active" value="active" />
             <el-option label="Inactive" value="inactive" />
             <el-option label="Maintenance" value="maintenance" />
           </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roomDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveRoomHandler">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRooms, createRoom, updateRoom, deleteRoom, type Room } from '@/api/room'
import { getProperties, updateProperty, type Property } from '@/api/property'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('rooms')
const loadingRooms = ref(false)
const loadingProperty = ref(false)
const roomDialogVisible = ref(false)
const isEditMode = ref(false)
const rooms = ref<Room[]>([])
const currentPropertyId = ref<number>(1) // Default or from store

const propertyForm = ref<Partial<Property>>({
    name: '',
    address: '',
    phone: '',
    description: ''
})

const roomForm = ref({
    id: 0,
    name: '',
    max_guests: 2,
    base_price: 300,
    status: 'active'
})

const fetchProperty = async () => {
    loadingProperty.value = true
    try {
        const res = await getProperties()
        if (res.data && res.data.length > 0) {
            const prop = res.data[0]
            if (prop) {
                currentPropertyId.value = prop.id
                propertyForm.value = { ...prop }
            }
        }
    } finally {
        loadingProperty.value = false
    }
}

const saveProperty = async () => {
    try {
        await updateProperty(currentPropertyId.value, propertyForm.value)
        ElMessage.success('Property info updated successfully')
    } catch (e) {
        console.error(e)
    }
}

const fetchRooms = async () => {
    loadingRooms.value = true
    try {
        const res = await getRooms()
        rooms.value = res.data
    } finally {
        loadingRooms.value = false
    }
}

const openAddRoom = () => {
    isEditMode.value = false
    roomForm.value = { id: 0, name: '', max_guests: 2, base_price: 300, status: 'active' }
    roomDialogVisible.value = true
}

const openEditRoom = (room: Room) => {
    isEditMode.value = true
    roomForm.value = { ...room, status: room.status || 'active' }
    roomDialogVisible.value = true
}

const saveRoomHandler = async () => {
    try {
        if (isEditMode.value) {
            await updateRoom(roomForm.value.id, {
                name: roomForm.value.name,
                max_guests: roomForm.value.max_guests,
                base_price: roomForm.value.base_price,
                status: roomForm.value.status as any
            })
            ElMessage.success('Room updated')
        } else {
            await createRoom({
                property_id: currentPropertyId.value,
                name: roomForm.value.name,
                max_guests: roomForm.value.max_guests,
                base_price: roomForm.value.base_price
            })
            ElMessage.success('Room created')
        }
        roomDialogVisible.value = false
        fetchRooms()
    } catch (e) {
        console.error(e)
    }
}

const handleDeleteRoom = (room: Room) => {
    ElMessageBox.confirm(
        `Are you sure to delete room "${room.name}"? This cannot be undone.`,
        'Warning',
        { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
    ).then(async () => {
        try {
            await deleteRoom(room.id)
            ElMessage.success('Room deleted')
            fetchRooms()
        } catch (e) {
            console.error(e)
        }
    })
}

const getCleaningTag = (status?: string) => {
    if (status === 'dirty') return 'danger'
    if (status === 'inspecting') return 'warning'
    return 'success'
}

onMounted(() => {
    fetchProperty()
    fetchRooms()
})
</script>

<style scoped>
.settings-view { padding: 20px; }
.settings-tabs { margin-top: 20px; }
.tab-actions { margin-bottom: 20px; }
</style>

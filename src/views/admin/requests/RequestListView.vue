<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const allRequests = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')

const fetchRequests = async () => {
  loading.value = true
  try {
    const response = await axios.get('https://api.tusistema.com/admin/requests')
    allRequests.value = response.data
    
    allRequests.value = [
      { id: 1, name: 'Albert Einstein', email: 'albert@physics.com', date: '2026-03-15', status: 'PENDIENTE' },
      { id: 2, name: 'Marie Curie', email: 'marie@science.fr', date: '2026-03-16', status: 'PENDIENTE' },
      { id: 4, name: 'Isaac Newton', email: 'isaac@gravity.uk', date: '2026-03-10', status: 'APROBADO' },
      { id: 5, name: 'Nikola Tesla', email: 'nikola@energy.com', date: '2026-03-12', status: 'RECHAZADO', reason: 'No es docente' }
    ]
  } catch (error) {
    console.error("Error fetching data:", error)
  } finally {
    loading.value = false
  }
}

const filterByStatus = (status: string) => {
  return allRequests.value.filter(item => {
    const matchesStatus = item.status === status
    const matchesSearch = Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    return matchesStatus && matchesSearch
  })
}

const filteredPending = computed(() => filterByStatus('PENDIENTE'))
const filteredApproved = computed(() => filterByStatus('APROBADO'))
const filteredRejected = computed(() => filterByStatus('RECHAZADO'))

const isRejectDialogOpen = ref(false)
const rejectionReason = ref('')
const selectedRequest = ref<any>(null)

const updateStatus = async (id: number, newStatus: string, reason = '') => {
  try {
    await axios.put(`/admin/requests/${id}`, { status: newStatus, reason })
    
    const index = allRequests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      allRequests.value[index].status = newStatus
      if (reason) allRequests.value[index].reason = reason
    }
  } catch (error) {
    alert("Could not update status")
  }
}

const openRejectDialog = (request: any) => {
  selectedRequest.value = request
  rejectionReason.value = ''
  isRejectDialogOpen.value = true
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">Teacher Request Management</h1>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" @click="fetchRequests" :loading="loading"></v-btn>
    </div>

    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Búsqueda global..."
      variant="outlined"
      rounded="lg"
      class="mb-6"
      hide-details
      clearable
    ></v-text-field>

    <v-linear-progress v-if="loading" indeterminate color="primary" class="mb-4"></v-linear-progress>

    <v-row>
      <v-col cols="12">
        <v-card border flat rounded="lg">
          <v-toolbar color="warning" density="compact" title="Pendientes de aprobar" icon="mdi-clock"></v-toolbar>
          <v-table hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo electrónico</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in filteredPending" :key="req.id">
                <td>{{ req.name }}</td>
                <td>{{ req.email }}</td>
                <td class="text-center">
                  <v-btn color="success" icon="mdi-check" variant="text" @click="updateStatus(req.id, 'APROBADO')"></v-btn>
                  <v-btn color="error" icon="mdi-close" variant="text" @click="openRejectDialog(req)"></v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg">
          <v-toolbar color="success" density="compact" title="Docentes aprobados"></v-toolbar>
          <v-table density="comfortable">
            <tbody>
              <tr v-for="t in filteredApproved" :key="t.id">
                <td>{{ t.name }}</td>
                <td class="text-caption">{{ t.email }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border flat rounded="lg">
          <v-toolbar color="error" density="compact" title="Docentes rechazados"></v-toolbar>
          <v-table density="comfortable">
            <tbody>
              <tr v-for="r in filteredRejected" :key="r.id">
                <td>{{ r.name }}</td>
                <td class="text-caption text-error">{{ r.reason }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isRejectDialogOpen" max-width="450">
      <v-card rounded="xl" class="pa-4">
        <v-card-title>Reject Teacher</v-card-title>
        <v-card-text>
          <v-textarea v-model="rejectionReason" label="Provide a reason" variant="outlined" auto-grow></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="isRejectDialogOpen = false" variant="text">Cancel</v-btn>
          <v-btn 
            color="error" 
            variant="elevated" 
            @click="updateStatus(selectedRequest.id, 'REJECTED', rejectionReason); isRejectDialogOpen = false"
          >Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
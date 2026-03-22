<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'
import type { ProfessorDto } from '@/dtos/professor.dto'
import type { VDataTable } from 'vuetify/components'

type ReadonlyDataTableHeader = VDataTable['$props']['headers']

const allRequests = ref<ProfessorDto[]>([])
const loading = ref(false)
const searchQuery = ref('')

const headers: ReadonlyDataTableHeader = [
  { title: 'Nombre Completo', key: 'fullName', align: 'start' },
  { title: 'Correo Electrónico', key: 'email', align: 'start' },
  { title: 'Fecha Registro', key: 'registrationDate', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const fetchRequests = async () => {
  loading.value = true
  try {
    const data = await adminService.getProfessorRequests()
    allRequests.value = data || []
  } catch (error) {
    console.error("Error cargando solicitudes:", error)
  } finally {
    loading.value = false
  }
}

const filterByStatus = (status: string) => {
  return allRequests.value.filter(item => {
    const matchesStatus = item.status === status
    const search = searchQuery.value.toLowerCase()
    const matchesSearch =
      item.firstName.toLowerCase().includes(search) ||
      item.lastName.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search)
    return matchesStatus && (searchQuery.value ? matchesSearch : true)
  })
}

const filteredPending = computed(() => filterByStatus('PENDIENTE'))
const filteredApproved = computed(() => filterByStatus('APROBADO'))
const filteredRejected = computed(() => filterByStatus('RECHAZADO'))

const isRejectDialogOpen = ref(false)
const isEditInfoDialogOpen = ref(false)
const selectedRequest = ref<(ProfessorDto & { isActive?: boolean }) | null>(null)

const approveTeacher = async (id: number) => {
  try {
    await adminService.approveProfessor(id)
    await fetchRequests() // Refrescar listas
  } catch (error) {
    alert("Error al aprobar al docente. Verificar sesión (401).")
  }
}

const rejectTeacher = async (id: number) => {
  try {
    await adminService.rejectProfessor(id)
    isRejectDialogOpen.value = false
    await fetchRequests()
  } catch (error) {
    alert("Error al rechazar. Es posible que el endpoint /reject no esté listo en el Backend.")
  }
}

const openEditDialog = (professor: ProfessorDto) => {
  selectedRequest.value = {
    ...professor,
    isActive: professor.status === 'APROBADO'
  }
  isEditInfoDialogOpen.value = true
}

const saveChanges = async () => {
  if (!selectedRequest.value) return

  try {
    // Si el switch está activo, aprobamos. Si no, rechazamos.
    if (selectedRequest.value.isActive) {
      await adminService.approveProfessor(selectedRequest.value.id)
    } else {
      await adminService.rejectProfessor(selectedRequest.value.id)
    }
    isEditInfoDialogOpen.value = false
    await fetchRequests()
  } catch (e) {
    alert("Error al actualizar el estado del docente")
  }
}

const openRejectDialog = (request: ProfessorDto) => {
  selectedRequest.value = { ...request }
  isRejectDialogOpen.value = true
}

onMounted(fetchRequests)
</script>

<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Gestión de Solicitudes</h1>
        <p class="text-subtitle-1 text-grey">Administración de acceso para docentes</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" color="primary" variant="tonal" @click="fetchRequests" :loading="loading"></v-btn>
    </div>

    <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar docente por nombre o correo..."
      variant="outlined" rounded="lg" class="mb-6 bg-white" hide-details clearable></v-text-field>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

    <v-row v-if="!loading">
      <v-col cols="12">
        <v-card border flat rounded="lg" elevation="1">
          <v-toolbar color="warning" density="compact" class="px-4">
            <v-icon start>mdi-clock-outline</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Solicitudes por Aprobar</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="headers" :items="filteredPending" no-data-text="No hay solicitudes pendientes">
            <template v-slot:item.fullName="{ item }">{{ item.firstName }} {{ item.lastName }}</template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="success" icon="mdi-check-circle" variant="text" title="Aprobar"
                @click="approveTeacher(item.id)"></v-btn>
              <v-btn color="error" icon="mdi-close-circle" variant="text" title="Rechazar"
                @click="openRejectDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card border flat rounded="lg" elevation="1">
          <v-toolbar color="success" density="compact" class="px-4">
            <v-icon start>mdi-account-check</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Docentes en el Sistema</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="headers" :items="filteredApproved" no-data-text="No hay docentes aprobados">
            <template v-slot:item.fullName="{ item }">{{ item.firstName }} {{ item.lastName }}</template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="primary" icon="mdi-pencil" variant="text" title="Editar información"
                @click="openEditDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card border flat rounded="lg" elevation="1">
          <v-toolbar color="error" density="compact" class="px-4">
            <v-icon start>mdi-account-remove</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Historial de Rechazos</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="headers" :items="filteredRejected" no-data-text="No hay registros de rechazo">
            <template v-slot:item.fullName="{ item }">{{ item.firstName }} {{ item.lastName }}</template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="grey" icon="mdi-pencil" variant="text" @click="openEditDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isRejectDialogOpen" max-width="450">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">Rechazar Solicitud</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas rechazar la solicitud de <b>{{ selectedRequest?.firstName }} {{
            selectedRequest?.lastName }}</b>?
          Esta acción restringirá su acceso al sistema.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isRejectDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" @click="rejectTeacher(selectedRequest!.id)">
            Confirmar Rechazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditInfoDialogOpen" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">Editar Datos y Estado</v-card-title>
        <v-card-text v-if="selectedRequest">
          <v-text-field v-model="selectedRequest.firstName" label="Nombre" variant="outlined"
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedRequest.lastName" label="Apellido" variant="outlined"
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedRequest.email" label="Correo Electrónico" variant="outlined"
            class="mb-4"></v-text-field>

          <v-divider class="mb-4"></v-divider>

          <div class="d-flex align-center justify-space-between bg-grey-lighten-4 pa-4 rounded-lg">
            <div>
              <div class="font-weight-bold text-subtitle-1">Estado de la cuenta</div>
              <div class="text-caption" :class="selectedRequest.isActive ? 'text-success' : 'text-error'">
                {{ selectedRequest.isActive ? 'El docente tiene acceso activo' : 'Acceso restringido actualmente' }}
              </div>
            </div>
            <v-switch v-model="selectedRequest.isActive" color="success" inset hide-details></v-switch>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="isEditInfoDialogOpen = false" variant="text">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveChanges">Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
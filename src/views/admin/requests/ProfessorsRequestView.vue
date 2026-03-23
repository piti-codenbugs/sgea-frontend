<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'
import type { ProfessorDto } from '@/dtos/professor.dto'
import type { VDataTable } from 'vuetify/components'

type ReadonlyDataTableHeader = VDataTable['$props']['headers']

const allRequests = ref<ProfessorDto[]>([])
const loading = ref(false)
const searchQuery = ref('')
const isRejectDialogOpen = ref(false)
const isEditInfoDialogOpen = ref(false)
const selectedRequest = ref<ProfessorDto | null>(null)
const newPassword = ref('')
const showPassword = ref(false)
const rejectReason = ref('')

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const triggerSnackbar = (message: string, color: string = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

const headers: ReadonlyDataTableHeader = [
  { title: 'Nombre Completo', key: 'fullName', align: 'start' },
  { title: 'Correo Electrónico', key: 'email', align: 'start' },
  { title: 'Fecha Registro', key: 'registrationDate', align: 'start' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const rejectedHeaders = computed<ReadonlyDataTableHeader>(() => [
  { title: 'Nombre Completo', key: 'fullName', align: 'start' },
  { title: 'Correo Electrónico', key: 'email', align: 'start' },
  { title: 'Fecha Registro', key: 'registrationDate', align: 'start' },
  { title: 'Motivo de Rechazo', key: 'rejectionReason', align: 'start', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]);

const fetchRequests = async () => {
  loading.value = true
  try {
    const data = await adminService.getProfessorRequests()
    allRequests.value = data.map(p => ({
      ...p,
      fullName: `${p.firstName} ${p.lastName}`
    })) || []
  } catch (error) {
    console.error("Error cargando solicitudes:", error)
    triggerSnackbar("Error al cargar los datos", "error")
  } finally {
    loading.value = false
  }
}

const filterByStatus = (status: string) => {
  return allRequests.value.filter(item => {
    const matchesStatus = item.status === status;
    const search = searchQuery.value.toLowerCase();
    const matchesSearch =
      (item.firstName?.toLowerCase().includes(search) ||
        item.lastName?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search));

    return matchesStatus && (searchQuery.value ? matchesSearch : true);
  });
};

const filteredPending = computed(() => filterByStatus('PENDIENTE'))
const filteredApproved = computed(() => filterByStatus('APROBADO'))
const filteredRejected = computed(() => filterByStatus('RECHAZADO'))

const approveTeacher = async (id: number) => {
  try {
    await adminService.updateAccountStatus(id, 'APROBADO')
    await fetchRequests()
    triggerSnackbar("Docente aprobado correctamente")
  } catch (error) {
    triggerSnackbar("Error al aprobar al docente", "error")
  }
}

const openRejectDialog = (request: ProfessorDto) => {
  selectedRequest.value = { ...request }
  rejectReason.value = ''
  isRejectDialogOpen.value = true
}

const rejectTeacher = async (id: number) => {
  if (!rejectReason.value.trim()) {
    triggerSnackbar("Debes ingresar un motivo", "warning")
    return
  }
  try {
    await adminService.updateAccountStatus(id, 'RECHAZADO', rejectReason.value)
    isRejectDialogOpen.value = false
    await fetchRequests()
    triggerSnackbar("Solicitud rechazada", "error")
  } catch (error) {
    triggerSnackbar("Error al rechazar al docente", "error")
  }
}

const openEditDialog = (professor: ProfessorDto) => {
  selectedRequest.value = { ...professor }
  newPassword.value = ''
  isEditInfoDialogOpen.value = true
}

const saveChanges = async () => {
  if (!selectedRequest.value) return
  try {
    await adminService.updateProfessorInfo(selectedRequest.value.id, {
      firstName: selectedRequest.value.firstName,
      lastName: selectedRequest.value.lastName,
      email: selectedRequest.value.email,
    });

    isEditInfoDialogOpen.value = false;
    await fetchRequests();
    triggerSnackbar("Información actualizada con éxito")
  } catch (e) {
    triggerSnackbar("Error al actualizar la información", "error")
  }
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
        <v-card border flat rounded="lg">
          <v-toolbar color="warning" density="compact" class="px-4 text-white">
            <v-icon start>mdi-clock-outline</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Solicitudes por Aprobar</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="headers" :items="filteredPending" no-data-text="No hay solicitudes pendientes">
            <template v-slot:item.registrationDate="{ item }">
              {{ new Date(item.registrationDate).toLocaleDateString() }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="success" icon="mdi-check-circle" variant="text" @click="approveTeacher(item.id)"></v-btn>
              <v-btn color="error" icon="mdi-close-circle" variant="text" @click="openRejectDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card border flat rounded="lg">
          <v-toolbar color="success" density="compact" class="px-4 text-white">
            <v-icon start>mdi-account-check</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Docentes en el Sistema</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="headers" :items="filteredApproved" no-data-text="No hay docentes aprobados">
            <template v-slot:item.registrationDate="{ item }">
              {{ new Date(item.registrationDate).toLocaleDateString() }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="primary" icon="mdi-pencil" variant="text" @click="openEditDialog(item)"></v-btn>
              <v-btn color="error" icon="mdi-close-circle" variant="text" @click="openRejectDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card border flat rounded="lg">
          <v-toolbar color="error" density="compact" class="px-4 text-white">
            <v-icon start>mdi-account-remove</v-icon>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Historial de Rechazos</v-toolbar-title>
          </v-toolbar>
          <v-data-table :headers="rejectedHeaders" :items="filteredRejected" no-data-text="No hay registros de rechazo">
            <template v-slot:item.rejectionReason="{ item }">
              <span class="text-error font-italic">{{ item.rejectionReason || 'No especificado' }}</span>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn color="success" icon="mdi-account-check-outline" variant="text" title="Volver a habilitar"
                @click="approveTeacher(item.id)"></v-btn>
              <v-btn color="grey-darken-1" icon="mdi-pencil" variant="text" @click="openEditDialog(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isRejectDialogOpen" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">Rechazar Solicitud</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Rechazar a <b>{{ selectedRequest?.fullName }}</b>?</p>
          <v-textarea v-model="rejectReason" label="Motivo del rechazo" variant="outlined" rows="3" color="error"
            auto-grow prepend-inner-icon="mdi-comment-text-outline"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isRejectDialogOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="elevated" :disabled="!rejectReason.trim()"
            @click="rejectTeacher(selectedRequest!.id)">Confirmar Rechazo</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEditInfoDialogOpen" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">Editar Información</v-card-title>
        <v-card-text v-if="selectedRequest">
          <v-text-field v-model="selectedRequest.firstName" label="Nombre" variant="outlined"
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedRequest.lastName" label="Apellido" variant="outlined"
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedRequest.email" label="Correo Electrónico" variant="outlined"
            class="mb-4"></v-text-field>
          <v-divider class="mb-4"></v-divider>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isEditInfoDialogOpen = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveChanges">Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000" location="top right">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
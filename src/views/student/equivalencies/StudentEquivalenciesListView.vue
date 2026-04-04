<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { equivalencyService } from '@/services/student/equivalencyService'
import type { EquivalencyRequestDto } from '@/dtos/equivalency.dto'
import { VDataTable } from 'vuetify/components'

type ReadonlyDataTableHeader = VDataTable['$props']['headers']

const router = useRouter()

const requests = ref<EquivalencyRequestDto[]>([])
const loading = ref(false)
const error = ref('')

const headers: ReadonlyDataTableHeader = [
  { title: 'Curso Origen', key: 'originCourseCode', align: 'start', width: '180px' },
  { title: 'Curso Destino', key: 'destinationCourse', align: 'start', width: '260px' },
  { title: 'Docente Asignado', key: 'professor', align: 'start', width: '240px' },
  { title: 'Estado', key: 'status', align: 'center', width: '120px' },
  { title: 'Fecha Creación', key: 'createdAt', align: 'center' },
  { title: 'Fecha Resolución', key: 'resolutionDate', align: 'center' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' }
]

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  loading.value = true
  error.value = ''

  try {
    requests.value = await equivalencyService.getMyRequests()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al cargar las solicitudes'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDIENTE':
      return 'orange'
    case 'ACEPTADO':
      return 'green'
    case 'RECHAZADO':
      return 'red'
    default:
      return 'gray'
  }
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const getDestinationCourseLabel = (item: EquivalencyRequestDto) => {
  if (!item.destinationCourseName) return `${item.destinationCourseCode}`
  return `${item.destinationCourseCode} - ${item.destinationCourseName}`
}

const getProfessorName = (item: EquivalencyRequestDto) => {
  return item.professorFullName || `Docente #${item.professorId}`
}

const goToCreate = () => {
  router.push('/student/dashboard/equivalencies/create')
}

const viewDetails = (id: number) => {
  router.push(`/student/dashboard/equivalencies/${id}`)
}
</script>

<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <v-card-title class="text-h5 font-weight-bold">
              Mis Solicitudes de Equivalencia
            </v-card-title>
            <div class="text-subtitle-2 text-secondary mt-2">
              Gestiona tus solicitudes de equivalencia académica
            </div>
          </div>
          <v-btn color="success" @click="goToCreate" size="large">
            <v-icon start>mdi-plus</v-icon>
            Nueva Solicitud
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" dismissible class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="requests.length === 0 && !loading" type="info" class="mb-4">
      <v-alert-title>No tienes solicitudes aún</v-alert-title>
      Crea una nueva solicitud de equivalencia para comenzar el proceso.
    </v-alert>

    <v-data-table
      :headers="headers"
      :items="requests"
      :loading="loading"
      class="elevation-1"
    >
      <template #item.originCourseCode="{ item }">
        <span>{{ item.originCourseCode || '-' }}</span>
      </template>

      <template #item.destinationCourse="{ item }">
        <span>{{ getDestinationCourseLabel(item) }}</span>
      </template>

      <template #item.professor="{ item }">
        <span>{{ getProfessorName(item) }}</span>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" text-color="white" size="small">
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <template #item.resolutionDate="{ item }">
        {{ formatDate(item.resolutionDate) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon
          size="small"
          @click="viewDetails(item.id)"
          color="primary"
          variant="tonal"
        >
          <v-icon>mdi-eye</v-icon>
          <v-tooltip activator="parent">Ver detalles</v-tooltip>
        </v-btn>
      </template>

      <template #no-data>
        <v-alert type="info" class="my-4">
          Aún no tienes ninguna solicitud de equivalencia registrada
        </v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

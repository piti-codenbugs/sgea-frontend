<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { VDataTable } from 'vuetify/components'
import type { EquivalencyRequestDto } from '@/dtos/equivalency.dto'
import { professorService } from '@/services/professor/professorService'

type Headers = VDataTable['$props']['headers']

const router = useRouter()

const loading = ref(false)
const error = ref('')
const requests = ref<EquivalencyRequestDto[]>([])

const headers: Headers = [
  { title: 'ID', key: 'id', align: 'start', width: '80px' },
  { title: 'Estudiante', key: 'student', align: 'start' },
  { title: 'Curso Destino', key: 'destinationCourse', align: 'start' },
  { title: 'Curso Origen', key: 'originCourseCode', align: 'start', width: '140px' },
  { title: 'Fecha Envío', key: 'createdAt', align: 'center', width: '160px' },
  { title: 'Estado', key: 'status', align: 'center', width: '130px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center', width: '120px' }
]

const loadPendingRequests = async () => {
  loading.value = true
  error.value = ''

  try {
    requests.value = await professorService.getPendingEquivalencies()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al cargar solicitudes pendientes'
    console.error(e)
  } finally {
    loading.value = false
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDIENTE':
      return 'orange'
    case 'ACEPTADO':
      return 'green'
    case 'RECHAZADO':
      return 'red'
    default:
      return 'grey'
  }
}

const goToReview = (id: number) => {
  router.push(`/professor/equivalencies/${id}`)
}

onMounted(loadPendingRequests)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">Solicitudes de Equivalencia Pendientes</h1>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" @click="loadPendingRequests" :loading="loading" color="primary" variant="tonal" />
    </div>

    <v-alert v-if="error" type="error" class="mb-4" dismissible>
      {{ error }}
    </v-alert>

    <v-card border flat rounded="lg">
      <v-data-table
        :headers="headers"
        :items="requests"
        :loading="loading"
        hover
        no-data-text="No tienes solicitudes de equivalencia pendientes"
      >
        <template #item.student="{ item }">
          {{ item.studentFullName || `Estudiante #${item.studentId}` }}
        </template>

        <template #item.destinationCourse="{ item }">
          {{ getDestinationCourseLabel(item) }}
        </template>

        <template #item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" text-color="white" size="small">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" color="primary" variant="tonal" @click="goToReview(item.id)">
            <v-icon start>mdi-eye</v-icon>
            Ver más
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

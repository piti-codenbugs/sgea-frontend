<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { equivalencyService } from '@/services/student/equivalencyService'
import type { EquivalencyRequestDto } from '@/dtos/equivalency.dto'

const router = useRouter()
const route = useRoute()

const request = ref<EquivalencyRequestDto | null>(null)
const loading = ref(false)
const error = ref('')

const requestId = computed(() => parseInt(route.params.id as string))

onMounted(async () => {
  await loadRequest()
})

const loadRequest = async () => {
  loading.value = true
  error.value = ''

  try {
    request.value = await equivalencyService.getRequestById(requestId.value)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al cargar la solicitud'
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
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openPdfInNewTab = (url: string, fileName: string) => {
  window.open(url, '_blank')
}

const downloadPdf = (url: string, fileName: string) => {
  const xhr = new XMLHttpRequest()
  xhr.responseType = 'blob'
  xhr.onload = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(xhr.response)
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  xhr.open('GET', url)
  xhr.send()
}

const goBack = () => {
  router.push('/student/dashboard/equivalencies')
}

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/')
    const fileNameWithParams = parts[parts.length - 1]
    return (fileNameWithParams?.split('?')[0]) || 'documento.pdf'
  } catch {
    return 'documento.pdf'
  }
}
</script>

<template>
  <v-container class="py-8">
    <v-row>
      <v-col cols="12">
        <v-btn variant="text" @click="goBack" class="mb-4">
          <v-icon start>mdi-arrow-left</v-icon>
          Volver a mis solicitudes
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" dismissible class="mb-4">
      {{ error }}
    </v-alert>

    <v-skeleton-loader v-if="loading" type="article,article" height="500" />

    <v-row v-if="request && !loading" class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
            <span>Detalle de Solicitud #{{ request.id }}</span>
            <v-chip :color="getStatusColor(request.status)" text-color="white" size="large">
              {{ request.status }}
            </v-chip>
          </v-card-title>

          <v-divider />

          <!-- Información General -->
          <v-card-text class="pa-6">
            <div class="text-h6 font-weight-bold mb-4">Información General</div>

            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Fecha de Creación</div>
                <div class="text-body-1 font-weight-bold">
                  {{ formatDate(request.createdAt) }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Fecha de Resolución</div>
                <div class="text-body-1 font-weight-bold">
                  {{ formatDate(request.resolutionDate) }}
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Información del Curso Destino -->
            <div class="text-h6 font-weight-bold mb-4">Curso Destino (Equivalencia)</div>

            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Código del Curso</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.destinationCourseCode }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Nombre del Curso</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.destinationCourseName || '-' }}
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Información del Curso Origen -->
            <div class="text-h6 font-weight-bold mb-4">Curso Origen</div>

            <v-row class="mb-6">
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Código</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.originCourseCode || '-' }}
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Año</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.year || '-' }}
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Semestre</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.semester || '-' }}
                </div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Sección</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.section || '-' }}
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Información del Docente -->
            <div class="text-h6 font-weight-bold mb-4">Docente Asignado</div>

            <v-row class="mb-6">
              <v-col cols="12">
                <div class="text-subtitle-2 text-secondary">Nombre Completo</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.professorFullName || `Docente #${request.professorId}` }}
                </div>
              </v-col>
            </v-row>

            <v-row v-if="request.status === 'RECHAZADO' && request.comment" class="mb-6">
              <v-col cols="12">
                <v-alert type="error" variant="tonal">
                  <v-alert-title>Motivo de rechazo</v-alert-title>
                  {{ request.comment }}
                </v-alert>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Archivos Adjuntos -->
            <div class="text-h6 font-weight-bold mb-4">Archivos Adjuntos</div>

            <v-row>
              <!-- Programa del Curso -->
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">Programa del Curso</div>
                      <div class="text-caption text-secondary mt-1">
                        Documento del plan de estudios del curso
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn
                        icon
                        size="small"
                        color="primary"
                        variant="tonal"
                        @click="openPdfInNewTab(request.programUrl, 'programa.pdf')"
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent">Ver documento</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="info"
                        variant="tonal"
                        @click="downloadPdf(request.programUrl, 'programa.pdf')"
                      >
                        <v-icon>mdi-download</v-icon>
                        <v-tooltip activator="parent">Descargar</v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <!-- Constancia de Cursos -->
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Constancia de Cursos
                      </div>
                      <div class="text-caption text-secondary mt-1">
                        Documento que prueba el desempeño en el curso
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn
                        icon
                        size="small"
                        color="primary"
                        variant="tonal"
                        @click="
                          openPdfInNewTab(request.courseCertificateUrl, 'constancia.pdf')
                        "
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent">Ver documento</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="info"
                        variant="tonal"
                        @click="
                          downloadPdf(request.courseCertificateUrl, 'constancia.pdf')
                        "
                      >
                        <v-icon>mdi-download</v-icon>
                        <v-tooltip activator="parent">Descargar</v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <!-- Programa Firmado (si existe) -->
              <v-col v-if="request.signedProgramUrl" cols="12">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Programa del Curso Firmado
                      </div>
                      <div class="text-caption text-secondary mt-1">
                        Documento firmado por el docente aprobando la equivalencia
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn
                        icon
                        size="small"
                        color="primary"
                        variant="tonal"
                        @click="
                          openPdfInNewTab(request.signedProgramUrl, 'programa-firmado.pdf')
                        "
                      >
                        <v-icon>mdi-eye</v-icon>
                        <v-tooltip activator="parent">Ver documento</v-tooltip>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="info"
                        variant="tonal"
                        @click="
                          downloadPdf(request.signedProgramUrl, 'programa-firmado.pdf')
                        "
                      >
                        <v-icon>mdi-download</v-icon>
                        <v-tooltip activator="parent">Descargar</v-tooltip>
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>

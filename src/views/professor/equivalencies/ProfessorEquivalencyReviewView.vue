<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { EquivalencyRequestDto, ProgramCourseDto } from '@/dtos/equivalency.dto'
import { professorService } from '@/services/professor/professorService'

const route = useRoute()
const router = useRouter()

const requestId = computed(() => Number(route.params.id))

const request = ref<EquivalencyRequestDto | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref('')

const actionMode = ref<'approve' | 'reject' | null>(null)
const rejectComment = ref('')
const signedProgramFile = ref<File | null>(null)
const privatePrograms = ref<ProgramCourseDto[]>([])
const privateProgramsLoading = ref(false)
const selectedPrivateProgram = ref<ProgramCourseDto | null>(null)
const formError = ref('')

const loadRequest = async () => {
  loading.value = true
  error.value = ''

  try {
    request.value = await professorService.getEquivalencyById(requestId.value)
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al cargar la solicitud'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadRequest)

const goBack = () => {
  router.push('/professor/equivalencies/pending')
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

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openPdfInNewTab = (url: string) => {
  window.open(url, '_blank')
}

const loadPrivatePrograms = async () => {
  if (!request.value?.originCourseCode) return

  privateProgramsLoading.value = true
  formError.value = ''
  selectedPrivateProgram.value = null

  try {
    privatePrograms.value = await professorService.getPrivateProgramCourses(request.value.originCourseCode)
    if (privatePrograms.value.length > 0) {
      selectedPrivateProgram.value = privatePrograms.value[0] || null
    }
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'No se pudieron cargar los programas privados'
    console.error(e)
  } finally {
    privateProgramsLoading.value = false
  }
}

const selectRejectMode = () => {
  formError.value = ''
  success.value = ''
  actionMode.value = 'reject'
}

const selectApproveMode = () => {
  formError.value = ''
  success.value = ''
  actionMode.value = 'approve'
  signedProgramFile.value = null
  void loadPrivatePrograms()
}

const submitReject = async () => {
  if (!request.value) return

  if (!rejectComment.value.trim()) {
    formError.value = 'Debes ingresar un motivo de rechazo.'
    return
  }

  submitting.value = true
  formError.value = ''

  try {
    request.value = await professorService.rejectEquivalency(request.value.id, rejectComment.value.trim())
    success.value = 'Solicitud rechazada correctamente.'
    actionMode.value = null
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'No se pudo rechazar la solicitud'
  } finally {
    submitting.value = false
  }
}

const submitApprove = async () => {
  if (!request.value) return

  const hasSelectedPrivateProgram = !!selectedPrivateProgram.value

  if (!hasSelectedPrivateProgram && !signedProgramFile.value) {
    formError.value = 'Debes seleccionar un programa privado o adjuntar un PDF firmado.'
    return
  }

  submitting.value = true
  formError.value = ''

  try {
    request.value = await professorService.approveEquivalency(request.value.id, {
      signedProgramFile: hasSelectedPrivateProgram ? undefined : signedProgramFile.value || undefined,
      programCourseId: hasSelectedPrivateProgram ? selectedPrivateProgram.value!.id : undefined
    })
    success.value = 'Solicitud aprobada correctamente.'
    actionMode.value = null
  } catch (e: any) {
    formError.value = e.response?.data?.message || 'No se pudo aprobar la solicitud'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-container class="py-8">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack" class="mb-4">
      Volver a pendientes
    </v-btn>

    <v-alert v-if="error" type="error" class="mb-4" dismissible>
      {{ error }}
    </v-alert>

    <v-alert v-if="success" type="success" class="mb-4" dismissible>
      {{ success }}
    </v-alert>

    <v-skeleton-loader v-if="loading" type="article,article" height="520" />

    <v-row v-if="request && !loading">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
            <span>Revisión de Solicitud #{{ request.id }}</span>
            <v-chip :color="getStatusColor(request.status)" text-color="white" size="large">
              {{ request.status }}
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <div class="text-h6 font-weight-bold mb-4">Información General</div>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Estudiante</div>
                <div class="text-body-1 font-weight-bold">
                  {{ request.studentFullName || `Estudiante #${request.studentId}` }}
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Fecha de Creación</div>
                <div class="text-body-1 font-weight-bold">{{ formatDate(request.createdAt) }}</div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="text-h6 font-weight-bold mb-4">Curso Destino</div>
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Código</div>
                <div class="text-body-1 font-weight-bold">{{ request.destinationCourseCode }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 text-secondary">Nombre</div>
                <div class="text-body-1 font-weight-bold">{{ request.destinationCourseName || '-' }}</div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="text-h6 font-weight-bold mb-4">Curso Origen</div>
            <v-row class="mb-6">
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Código</div>
                <div class="text-body-1 font-weight-bold">{{ request.originCourseCode || '-' }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Año</div>
                <div class="text-body-1 font-weight-bold">{{ request.year || '-' }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Semestre</div>
                <div class="text-body-1 font-weight-bold">{{ request.semester || '-' }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-subtitle-2 text-secondary">Sección</div>
                <div class="text-body-1 font-weight-bold">{{ request.section || '-' }}</div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="text-h6 font-weight-bold mb-4">Documentos Adjuntos</div>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 h-100">
                  <div class="text-subtitle-2 font-weight-bold">Programa del Curso</div>
                  <div class="text-caption text-secondary mb-3">Archivo enviado por estudiante</div>
                  <v-btn block color="primary" variant="tonal" @click="openPdfInNewTab(request.programUrl)">
                    <v-icon start>mdi-eye</v-icon>
                    Ver PDF
                  </v-btn>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 h-100">
                  <div class="text-subtitle-2 font-weight-bold">Constancia de Calificaciones</div>
                  <div class="text-caption text-secondary mb-3">Archivo enviado por estudiante</div>
                  <v-btn block color="primary" variant="tonal" @click="openPdfInNewTab(request.courseCertificateUrl)">
                    <v-icon start>mdi-eye</v-icon>
                    Ver PDF
                  </v-btn>
                </v-card>
              </v-col>

              <v-col v-if="request.signedProgramUrl" cols="12">
                <v-card variant="outlined" class="pa-4">
                  <div class="text-subtitle-2 font-weight-bold">Programa Firmado</div>
                  <div class="text-caption text-secondary mb-3">Documento de resolución</div>
                  <v-btn color="primary" variant="tonal" @click="openPdfInNewTab(request.signedProgramUrl)">
                    <v-icon start>mdi-eye</v-icon>
                    Ver PDF firmado
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="text-h6 font-weight-bold">Decisión del Docente</v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-alert
              v-if="request.status !== 'PENDIENTE'"
              type="info"
              class="mb-4"
              variant="tonal"
            >
              Esta solicitud ya fue resuelta el {{ formatDate(request.resolutionDate) }}.
            </v-alert>

            <template v-else>
              <div class="d-flex flex-column ga-3 mb-4">
                <v-btn color="error" variant="tonal" block @click="selectRejectMode">
                  <v-icon start>mdi-close-circle-outline</v-icon>
                  Rechazar
                </v-btn>
                <v-btn color="success" variant="tonal" block @click="selectApproveMode">
                  <v-icon start>mdi-check-circle-outline</v-icon>
                  Aprobar
                </v-btn>
              </div>

              <v-alert v-if="formError" type="error" class="mb-4" density="compact">
                {{ formError }}
              </v-alert>

              <div v-if="actionMode === 'reject'">
                <v-textarea
                  v-model="rejectComment"
                  label="Motivo de rechazo"
                  placeholder="Describe claramente por qué se rechaza la solicitud"
                  rows="4"
                  auto-grow
                  variant="outlined"
                  required
                />

                <v-btn
                  color="error"
                  block
                  :loading="submitting"
                  @click="submitReject"
                >
                  Confirmar rechazo
                </v-btn>
              </div>

              <div v-if="actionMode === 'approve'">
                <v-alert v-if="privateProgramsLoading" type="info" class="mb-4" variant="tonal">
                  Buscando programas privados del docente...
                </v-alert>

                <v-alert v-else-if="privatePrograms.length > 0" type="success" class="mb-4" variant="tonal">
                  Se encontraron programas privados. Selecciona uno para aprobar sin volver a subir el PDF.
                </v-alert>

                <v-card v-if="privatePrograms.length > 0" variant="outlined" class="mb-4">
                  <v-table density="compact">
                    <thead>
                      <tr>
                        <th>Curso origen</th>
                        <th>Año</th>
                        <th>Semestre</th>
                        <th>Sección</th>
                        <th>Fecha creación</th>
                        <th>Programa</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="program in privatePrograms" :key="program.id">
                        <td class="font-weight-bold">{{ program.courseCode }}</td>
                        <td>{{ program.year }}</td>
                        <td>{{ program.semester }}</td>
                        <td>{{ program.section }}</td>
                        <td>{{ formatDate(program.createdAt) }}</td>
                        <td>
                          <v-btn size="small" variant="text" color="primary" @click="openPdfInNewTab(program.programUrl)">
                            <v-icon start>mdi-eye</v-icon>
                            Ver
                          </v-btn>
                        </td>
                        <td>
                          <v-btn
                            size="small"
                            :color="selectedPrivateProgram?.id === program.id ? 'success' : 'primary'"
                            :variant="selectedPrivateProgram?.id === program.id ? 'flat' : 'tonal'"
                            @click="selectedPrivateProgram = program"
                          >
                            {{ selectedPrivateProgram?.id === program.id ? 'Seleccionado' : 'Seleccionar' }}
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>

                <v-file-input
                  v-if="privatePrograms.length === 0"
                  v-model="signedProgramFile"
                  label="Subir programa firmado (PDF)"
                  accept="application/pdf"
                  prepend-icon="mdi-file-pdf-box"
                  variant="outlined"
                  show-size
                  required
                />

                <v-alert v-if="privatePrograms.length > 0" type="info" class="mb-4" variant="tonal">
                  <strong>Programa seleccionado:</strong>
                  {{ selectedPrivateProgram ? `${selectedPrivateProgram.courseCode} - ${selectedPrivateProgram.year}/${selectedPrivateProgram.semester} ${selectedPrivateProgram.section}` : 'Ninguno' }}
                </v-alert>

                <v-btn
                  color="success"
                  block
                  :loading="submitting"
                  @click="submitApprove"
                >
                  Confirmar aprobación
                </v-btn>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

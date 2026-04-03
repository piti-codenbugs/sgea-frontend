<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { CourseDto } from '@/dtos/course.dto'
import type { ProfessorDto } from '@/dtos/professor.dto'
import { equivalencyService } from '@/services/student/equivalencyService'
import type { CreateEquivalencyRequestDto, ProgramCourseDto } from '@/dtos/equivalency.dto'

const router = useRouter()

// Estados generales
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const searchingOrigin = ref(false)
const section2Error = ref('')

// Sección 1: Equivalencia (curso destino)
const destinationCourseCode = ref<number | null>(null)
const professorId = ref<number | null>(null)
const certificateFile = ref<File | null>(null)
const certificateFilename = ref('')

// Sección 2: Curso Origen
const originCourseCode = ref('')
const year = ref<number | null>(null)
const semester = ref<number | null>(null)
const section = ref('')
const searchResults = ref<ProgramCourseDto[]>([])
const hasSearched = ref(false)
const selectedOriginCourse = ref<ProgramCourseDto | null>(null)
const programFile = ref<File | null>(null)
const programFilename = ref('')

// Catálogos
const courses = ref<CourseDto[]>([])
const professors = ref<ProfessorDto[]>([])
const filteredProfessors = ref<ProfessorDto[]>([])
const loadingData = ref(false)
const loadingProfessors = ref(false)

onMounted(async () => {
    await loadData()
})

const loadData = async () => {
    loadingData.value = true
    try {
        const [coursesResult, professorsResult] = await Promise.allSettled([
            equivalencyService.getAllCourses(),
            equivalencyService.getAllProfessors()
        ])

        if (coursesResult.status === 'fulfilled') {
            courses.value = coursesResult.value
        }

        if (professorsResult.status === 'fulfilled') {
            professors.value = professorsResult.value
        }
    } catch (e) {
        error.value = 'Error al cargar los datos'
        console.error(e)
    } finally {
        loadingData.value = false
    }
}

watch(destinationCourseCode, async (newCourseCode) => {
    if (newCourseCode === null) {
        filteredProfessors.value = []
        professorId.value = null
        return
    }

    loadingProfessors.value = true
    try {
        filteredProfessors.value = await equivalencyService.getProfessorsByDestinationCourse(newCourseCode)
        professorId.value = null
    } catch (e) {
        error.value = 'Error al cargar los docentes del curso'
        console.error(e)
        filteredProfessors.value = []
    } finally {
        loadingProfessors.value = false
    }
})

const onCertificateFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (file.type !== 'application/pdf') {
        error.value = 'Solo se permiten archivos PDF'
        target.value = ''
        certificateFile.value = null
        certificateFilename.value = ''
        return
    }

    certificateFile.value = file
    certificateFilename.value = file.name
    error.value = ''
}

const onProgramFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (file.type !== 'application/pdf') {
        error.value = 'Solo se permiten archivos PDF'
        target.value = ''
        programFile.value = null
        programFilename.value = ''
        return
    }

    programFile.value = file
    programFilename.value = file.name
    error.value = ''
}

const searchOriginCourses = async () => {
    section2Error.value = ''

    if (!originCourseCode.value.trim()) {
        section2Error.value = 'Debe ingresar un código de curso'
        return
    }

    // Permite formatos como "101" o "MAT-101" extrayendo el bloque numérico.
    const normalizedCode = originCourseCode.value.trim().replace(/\D/g, '')
    const numericCourseCode = Number(normalizedCode)

    if (!normalizedCode || Number.isNaN(numericCourseCode)) {
        section2Error.value = 'Código de curso inválido. Usa un formato como 101 o MAT-101'
        return
    }

    searchingOrigin.value = true
    hasSearched.value = true
    searchResults.value = []
    selectedOriginCourse.value = null

    try {
        searchResults.value = await equivalencyService.searchProgramCourses(numericCourseCode)

        error.value = ''
    } catch (e) {
        section2Error.value = 'Error al buscar cursos'
        console.error(e)
    } finally {
        searchingOrigin.value = false
    }
}

const selectOriginCourse = (course: ProgramCourseDto) => {
    selectedOriginCourse.value = course
}

const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES')
}

const openProgram = (url: string) => {
    window.open(url, '_blank')
}

const isSection1Valid = computed(() => {
    return destinationCourseCode.value && professorId.value && certificateFile.value
})

const isSection2Valid = computed(() => {
    if (!hasSearched.value) return false

    const hasOriginData = !!originCourseCode.value && !!year.value && !!semester.value && !!section.value

    // Caso 1: encontró registros en programa_curso y seleccionó uno.
    if (searchResults.value.length > 0) {
        return !!selectedOriginCourse.value
    }

    // Caso 2: no encontró registros, debe subir programa y llenar datos manuales.
    return hasOriginData && !!programFile.value
})

const canSubmit = computed(() => {
    return isSection1Valid.value && isSection2Valid.value
})

const handleSubmit = async () => {
    if (!canSubmit.value) {
        error.value = 'Debe completar todos los campos obligatorios'
        return
    }

    loading.value = true
    error.value = ''
    successMessage.value = ''

    try {
        const createRequest: CreateEquivalencyRequestDto = {
            destinationCourseCode: destinationCourseCode.value!,
            professorId: professorId.value!,
            certificateFile: certificateFile.value!,
            originCourseCode: originCourseCode.value,
            year: year.value || undefined,
            semester: semester.value || undefined,
            section: section.value || undefined
        }

        if (selectedOriginCourse.value) {
            createRequest.programCourseId = selectedOriginCourse.value.id
        } else {
            createRequest.programFile = programFile.value || undefined
        }

        await equivalencyService.createRequest(createRequest)
        successMessage.value = 'Solicitud de equivalencia creada exitosamente'

        setTimeout(() => {
            router.push('/student/dashboard/equivalencies')
        }, 1500)
    } catch (e: any) {
        error.value =
            e.response?.data?.message || 'Error al crear la solicitud de equivalencia'
        console.error(e)
    } finally {
        loading.value = false
    }
}

const destinationCourseName = computed(() => {
    const course = courses.value.find(c => c.code === destinationCourseCode.value)
    return course?.name || ''
})

const professorName = computed(() => {
    const prof = professors.value.find(p => p.id === professorId.value)
    return prof ? `${prof.firstName} ${prof.lastName}` : ''
})
</script>

<template>
    <v-container class="py-8">
        <v-row>
            <v-col cols="12" md="8" offset-md="2">
                <!-- Título -->
                <div class="mb-6">
                    <v-card-title class="text-h4 font-weight-bold mb-2">
                        Solicitar Equivalencia Académica
                    </v-card-title>
                    <v-divider></v-divider>
                </div>

                <!-- Mensajes de error y éxito -->
                <v-alert v-if="error" type="error" dismissible class="mb-4">
                    {{ error }}
                </v-alert>

                <v-alert v-if="successMessage" type="success" dismissible class="mb-4">
                    {{ successMessage }}
                </v-alert>

                <v-form @submit.prevent="handleSubmit">
                    <!-- SECCIÓN 1: INFORMACIÓN DE LA EQUIVALENCIA -->
                    <v-card class="mb-6">
                        <v-card-title class="text-h6 font-weight-bold">
                            1. Información de la Equivalencia
                        </v-card-title>
                        <v-divider></v-divider>

                        <v-card-text class="pt-6">
                            <!-- Select Curso Destino -->
                            <div class="mb-6">
                                <v-select v-model="destinationCourseCode" :items="courses" item-title="name"
                                    item-value="code" label="Selecciona el curso a equivalenciar" variant="outlined"
                                    :loading="loadingData" required>
                                    <template #item="{ props, item }">
                                        <v-list-item v-bind="props" :title="`${item?.code} - ${item?.name}`">
                                        </v-list-item>
                                    </template>

                                    <template #selection="{ item }">
                                        <span>{{ item?.code }} - {{ item?.name }}</span>
                                    </template>
                                </v-select>
                            </div>

                            <!-- Select Docente -->
                            <div class="mb-6">
                                <v-select v-model="professorId" :items="filteredProfessors" item-title="firstName"
                                    item-value="id" label="Selecciona el docente responsable" variant="outlined"
                                    :loading="loadingProfessors" :disabled="destinationCourseCode === null"
                                    :placeholder="destinationCourseCode === null ? 'Primero debes seleccionar un curso' : 'Selecciona el docente'"
                                    required>
                                    <template #item="{ props, item }">
                                        <v-list-item v-bind="props" :title="`${item?.firstName} ${item?.lastName}`">
                                        </v-list-item>
                                    </template>

                                    <template #selection="{ item }">
                                        <span>{{ item?.firstName }} {{ item?.lastName }}</span>
                                    </template>
                                </v-select>
                                <v-card-subtitle v-if="filteredProfessors.length === 0 && destinationCourseCode !== null" class="mt-2 text-warning">
                                    No hay docentes asignados a este curso
                                </v-card-subtitle>
                            </div>

                            <!-- Upload Constancia -->
                            <div class="mb-4">
                                <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                                    Constancia de Cursos *
                                </label>
                                <input type="file" accept=".pdf" @change="onCertificateFileChange"
                                    class="d-block mb-2" />
                                <v-chip v-if="certificateFilename" closable @click:close="
                                    () => {
                                        certificateFile = null
                                        certificateFilename = ''
                                    }
                                ">
                                    <v-icon start>mdi-file-pdf</v-icon>
                                    {{ certificateFilename }}
                                </v-chip>
                                <v-chip v-else color="surface-variant" disabled>
                                    <v-icon start>mdi-plus</v-icon>
                                    Subir constancia
                                </v-chip>
                            </div>

                            <!-- Alerta de validación -->
                            <v-alert type="warning" class="mt-4">
                                <v-alert-title class="font-weight-bold mb-2">
                                    ⚠️ Importante - Aviso de sanciones
                                </v-alert-title>
                                <div class="text-body-2">
                                    Solo puedes subir documentos válidos y auténticos. La presentación de documentos
                                    falsificados,
                                    adulterados o engañosos constituye falta grave y podría resultar en:
                                    <ul class="mt-2">
                                        <li>Pérdida de matrícula académica</li>
                                        <li>Cancelación de solicitudes pendientes</li>
                                        <li>Reporte a coordinación</li>
                                    </ul>
                                    Ten en cuenta que toda tu información está registrada con tu carnet de
                                    identificación.
                                </div>
                            </v-alert>
                        </v-card-text>
                    </v-card>

                    <!-- SECCIÓN 2: INFORMACIÓN DEL CURSO ORIGEN -->
                    <v-card class="mb-6">
                        <v-card-title class="text-h6 font-weight-bold">
                            2. Información del Curso Equivalente
                        </v-card-title>
                        <v-divider></v-divider>

                        <v-card-text class="pt-6">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="originCourseCode" label="Código del Curso" variant="outlined"
                                        placeholder="Ej: 101 o MAT-101" required></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model.number="year" label="Año que lo Cursó" type="number"
                                        variant="outlined" required></v-text-field>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select v-model.number="semester" :items="[1, 2]" label="Semestre"
                                        variant="outlined" required></v-select>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-text-field v-model="section" label="Sección" variant="outlined"
                                        placeholder="Ej: 01, A, B" required></v-text-field>
                                </v-col>
                            </v-row>

                            <!-- Botón Buscar -->
                            <div class="mt-4 mb-6">
                                <v-btn type="button" @click="searchOriginCourses" :loading="searchingOrigin"
                                    color="primary" variant="tonal" block>
                                    <v-icon start>mdi-magnify</v-icon>
                                    Buscar Curso
                                </v-btn>
                            </div>

                            <v-alert v-if="section2Error" type="error" variant="tonal" class="mb-4">
                                {{ section2Error }}
                            </v-alert>

                            <!-- Resultados de búsqueda -->
                            <div v-if="hasSearched" class="mt-6">
                                <v-alert v-if="searchResults.length === 0" type="info" class="mb-4">
                                    <v-alert-title class="font-weight-bold"> No se encontraron cursos </v-alert-title>
                                    Si aún no has cargado información del curso equivalente que deseas solicitar, debes:
                                    <ol class="mt-2">
                                        <li>Llenar todos los datos solicitados arriba</li>
                                        <li>Subir el programa del curso en PDF (requerido)</li>
                                        <li>El sistema completará la información del curso</li>
                                    </ol>
                                </v-alert>

                                <v-card variant="outlined" class="mb-4">
                                    <v-table>
                                        <thead>
                                            <tr>
                                                <th>Código origen</th>
                                                <th>Año</th>
                                                <th>Semestre</th>
                                                <th>Sección</th>
                                                <th>Fecha creación</th>
                                                <th>Programa</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="course in searchResults" :key="course.id">
                                                <td class="font-weight-bold">{{ course.courseCode }}</td>
                                                <td>{{ course.year }}</td>
                                                <td class="text-center">{{ course.semester }}</td>
                                                <td>{{ course.section }}</td>
                                                <td>{{ formatDate(course.createdAt) }}</td>
                                                <td>
                                                    <v-btn
                                                        size="small"
                                                        variant="text"
                                                        color="primary"
                                                        @click="openProgram(course.programUrl)"
                                                    >
                                                        <v-icon start>mdi-file-pdf-box</v-icon>
                                                        Ver programa
                                                    </v-btn>
                                                </td>
                                                <td class="text-center">
                                                    <v-btn
                                                        @click="selectOriginCourse(course)"
                                                        :variant="selectedOriginCourse?.id === course.id ? 'flat' : 'outlined'"
                                                        :color="selectedOriginCourse?.id === course.id ? 'success' : 'primary'"
                                                        size="small"
                                                        density="compact"
                                                    >
                                                        {{
                                                            selectedOriginCourse?.id === course.id
                                                                ? 'Seleccionado'
                                                                : 'Seleccionar'
                                                        }}
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-card>

                                <v-divider class="my-4"></v-divider>

                                <div class="text-body-2 mb-4">
                                    <strong>Programa seleccionado:</strong>
                                    <span v-if="selectedOriginCourse" class="text-success font-weight-bold">
                                        {{ selectedOriginCourse.courseCode }} - Año {{ selectedOriginCourse.year }},
                                        Semestre {{ selectedOriginCourse.semester }}, Sección {{ selectedOriginCourse.section }}
                                    </span>
                                    <span v-else class="text-secondary"> Ninguno </span>
                                </div>
                            </div>

                            <!-- Upload Programa -->
                            <div v-if="hasSearched && searchResults.length === 0" class="mt-6 pt-6 border-t">
                                <label class="text-subtitle-2 font-weight-bold mb-2 d-block">
                                    Programa del Curso Equivalente * (requerido si el curso no existe)
                                </label>
                                <input type="file" accept=".pdf" @change="onProgramFileChange" class="d-block mb-2" />
                                <v-chip v-if="programFilename" closable @click:close="
                                    () => {
                                        programFile = null
                                        programFilename = ''
                                    }
                                ">
                                    <v-icon start>mdi-file-pdf</v-icon>
                                    {{ programFilename }}
                                </v-chip>
                                <v-chip v-else color="surface-variant" disabled>
                                    <v-icon start>mdi-plus</v-icon>
                                    Subir programa
                                </v-chip>
                            </div>
                        </v-card-text>
                    </v-card>

                    <!-- Resumen y Botones de Acción -->
                    <v-card v-if="isSection1Valid || isSection2Valid" class="mb-6 bg-blue-lighten-5">
                        <v-card-text>
                            <v-card-title class="text-h6 font-weight-bold mb-4"> Resumen de tu Solicitud </v-card-title>

                            <v-row>
                                <v-col cols="12" md="6">
                                    <div class="mb-3">
                                        <div class="text-caption text-secondary">Curso a Equivalenciar</div>
                                        <div class="text-body-2 font-weight-bold">
                                            {{ destinationCourseCode }} - {{ destinationCourseName }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <div class="text-caption text-secondary">Docente Responsable</div>
                                        <div class="text-body-2 font-weight-bold">{{ professorName }}</div>
                                    </div>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <div class="mb-3">
                                        <div class="text-caption text-secondary">Constancia</div>
                                        <div class="text-body-2 font-weight-bold" v-if="certificateFilename">
                                            <v-icon size="small" color="success">mdi-check-circle</v-icon>
                                            {{ certificateFilename }}
                                        </div>
                                    </div>
                                    <div class="mb-3" v-if="selectedOriginCourse">
                                        <div class="text-caption text-secondary">Curso Origen</div>
                                        <div class="text-body-2 font-weight-bold">
                                            {{ selectedOriginCourse.courseCode }} - {{ selectedOriginCourse.courseName || '-'
                                            }}
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div class="text-caption text-secondary">Programa</div>
                                        <div class="text-body-2 font-weight-bold">
                                            {{ programFilename ? `(Archivo: ${programFilename})` : 'No subido' }}
                                        </div>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Botones de Acción -->
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-btn @click="router.back()" variant="outlined" color="secondary" block size="large">
                                Cancelar
                            </v-btn>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-btn @click="handleSubmit" :disabled="!canSubmit" :loading="loading" color="success" block
                                size="large">
                                <v-icon start>mdi-check</v-icon>
                                Enviar Solicitud
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.border-t {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>

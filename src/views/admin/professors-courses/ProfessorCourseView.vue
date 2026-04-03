<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'

const professors = ref<any[]>([])
const allCourses = ref<any[]>([]) 
const loading = ref(false)
const searchQuery = ref('')
const expanded = ref([])

const assignmentProfessorId = ref<number | null>(null)
const assignmentCourseIds = ref<number[]>([])
const assignLoading = ref(false)
const assignError = ref('')
const assignSuccess = ref('')

const isAssignDialogOpen = ref(false)
const selectedProfessor = ref<any>(null)
const courseSearchQuery = ref('')
const dialogLoading = ref(false)
const actionLoading = ref<number | null>(null)

const headers = [
    { title: 'Docente', key: 'fullName', align: 'start' },
    { title: 'Correo', key: 'email', align: 'start' },
    { title: 'Cant. Cursos', key: 'coursesCount', align: 'center' },
    { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
]

const courseHeaders = [
    { title: 'Curso', key: 'name', align: 'start' },
    { title: 'Código', key: 'code', align: 'start' },
    { title: 'Acción', key: 'action', align: 'end', sortable: false },
]

const availableProfessors = computed(() => {
    return professors.value.map((p: any) => ({
        title: p.fullName,
        value: p.id,
    }))
})

const availableCourses = computed(() => {
    return allCourses.value.map((course: any) => ({
        title: `${course.code} - ${course.name}`,
        value: course.code,
    }))
})

const fetchAssignments = async () => {
  loading.value = true
  try {
    const [approvedProfessors, assignments] = await Promise.all([
      adminService.getProfessorsByStatus('APROBADO'),
      adminService.getAssignments(),
    ])

    const coursesByProfessorName = (assignments || []).reduce((acc: Record<string, any[]>, assignment: any) => {
      const professorName = assignment.professorName || 'Sin nombre'

      if (!acc[professorName]) {
        acc[professorName] = []
      }

      acc[professorName].push({
        id: assignment.id,
        name: assignment.courseName,
        code: assignment.courseCode,
      })

      return acc
    }, {})

    professors.value = (approvedProfessors || []).map((p: any) => {
      const fullName = `${p.firstName} ${p.lastName}`
      const professorCourses = coursesByProfessorName[fullName] || []

      return {
        ...p,
        fullName,
        courses: professorCourses,
        coursesCount: professorCourses.length,
      }
    })
  } catch (error) {
    console.error('Error al obtener asignaciones:', error)
    professors.value = []
  } finally {
    loading.value = false
  }
}

const fetchAllCourses = async () => {
    dialogLoading.value = true
    try {
        allCourses.value = await adminService.getCourses()
    } catch (error) {
        console.error("Error al obtener cursos:", error)
    } finally {
        dialogLoading.value = false
    }
}

const openAssignDialog = (professor: any) => {
    selectedProfessor.value = professor
    courseSearchQuery.value = ''
    isAssignDialogOpen.value = true
    fetchAllCourses()
}

const isAssigned = (courseCode: number) => {
  return selectedProfessor.value?.courses?.some((c: any) => c.code === courseCode)
}

const handleToggleCourse = async (course: any) => {
    actionLoading.value = course.code
    try {
        if (isAssigned(course.code)) {
            console.log("Quitando curso:", course.name, "al profesor:", selectedProfessor.value.id)
        } else {
            console.log("Asignando curso:", course.name, "al profesor:", selectedProfessor.value.id)
        }
    } finally {
        actionLoading.value = null
    }
}

const handleAssignCourses = async () => {
    assignError.value = ''
    assignSuccess.value = ''

    if (!assignmentProfessorId.value) {
        assignError.value = 'Debe seleccionar un docente.'
        return
    }

    if (!assignmentCourseIds.value.length) {
        assignError.value = 'Debe seleccionar al menos un curso.'
        return
    }

    assignLoading.value = true
    try {
        const payload = {
            professorId: assignmentProfessorId.value,
            courseCode: assignmentCourseIds.value,
        }

        await adminService.assignCourses(payload)
        assignSuccess.value = 'Cursos asignados correctamente.'
        assignmentProfessorId.value = null
        assignmentCourseIds.value = []
        await fetchAssignments()
    } catch (error: any) {
        console.error('Error al asignar cursos:', error)
        assignError.value = error?.response?.data?.message || 'No se pudieron asignar los cursos.'
    } finally {
        assignLoading.value = false
    }
}

const filteredProfessors = computed(() => {
    const s = searchQuery.value.toLowerCase().trim()
    if (!s) return professors.value
    return professors.value.filter(p =>
        p.fullName.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s)
    )
})

onMounted(async () => {
    await Promise.all([fetchAssignments(), fetchAllCourses()])
})
</script>

<template>
    <v-container fluid class="pa-6">
        <div class="d-flex align-center mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold text-primary">Control de Asignaciones</h1>
                <p class="text-subtitle-1 text-grey">Gestiona la carga académica de los docentes</p>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-refresh" variant="tonal" color="primary" @click="fetchAssignments" :loading="loading"></v-btn>
        </div>


        <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por nombre o correo del docente..."
            variant="outlined"
            rounded="lg"
            class="mb-6 bg-white"
            hide-details
            clearable
        ></v-text-field>

        <v-card class="mb-6 pa-4" rounded="lg" border flat>
            <v-row>
                <v-col cols="12" md="4">
                    <v-select
                        v-model="assignmentProfessorId"
                        :items="availableProfessors"
                        label="Seleccionar docente"
                        variant="outlined"
                    />
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="assignmentCourseIds"
                        :items="availableCourses"
                        label="Seleccionar cursos"
                        variant="outlined"
                        multiple
                        chips
                    />
                </v-col>

                <v-col cols="12" md="2" class="d-flex align-end">
                    <v-btn
                        color="primary"
                        block
                        :loading="assignLoading"
                        @click="handleAssignCourses"
                    >
                        Guardar
                    </v-btn>
                </v-col>
            </v-row>

            <v-alert v-if="assignError" type="error" class="mt-3">
                {{ assignError }}
            </v-alert>

            <v-alert v-if="assignSuccess" type="success" class="mt-3">
                {{ assignSuccess }}
            </v-alert>
        </v-card>

        <v-card border flat rounded="lg">
            <v-data-table 
                v-model:expanded="expanded"
                :headers="headers" 
                :items="filteredProfessors" 
                :search="searchQuery"
                item-value="code"
                show-expand
            >
                <template v-slot:item.coursesCount="{ item }">
                    <v-chip size="small" :color="item.coursesCount > 0 ? 'primary' : 'grey'">
                        {{ item.coursesCount }} Cursos
                    </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn size="small" variant="elevated" color="primary" prepend-icon="mdi-account-edit"
                        @click="openAssignDialog(item)">
                        Gestionar
                    </v-btn>
                </template>

                <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                        <td :colspan="columns.length" class="pa-4 bg-grey-lighten-5">
                            <div v-if="item.courses.length > 0">
                                <p class="text-caption font-weight-bold mb-2">CURSOS ACTUALES:</p>
                                <v-row>
                                    <v-col v-for="c in item.courses" :key="c.id" cols="12" md="4">
                                        <v-card border flat class="pa-2 d-flex align-center rounded-lg bg-white">
                                            <v-icon color="secondary" size="small" class="mr-2">mdi-book-open-variant</v-icon>
                                            <span class="text-caption font-weight-bold">{{ c.name }}</span>
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </div>
                            <v-alert v-else type="info" variant="tonal" density="compact" text="El docente no tiene cursos asignados en este momento."></v-alert>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="isAssignDialogOpen" max-width="650px" scrollable>
            <v-card rounded="xl">
                <v-card-title class="pa-4 d-flex align-center bg-primary text-white">
                    <v-icon start>mdi-book-multiple</v-icon>
                    <div>
                        <div class="text-h6">Asignar Cursos</div>
                        <div class="text-caption" style="opacity: 0.8">Docente: {{ selectedProfessor?.fullName }}</div>
                    </div>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-close" variant="text" color="white" @click="isAssignDialogOpen = false"></v-btn>
                </v-card-title>

                <v-card-text class="pa-0">
                    <div class="pa-4 bg-grey-lighten-4">
                        <v-text-field 
                            v-model="courseSearchQuery" 
                            placeholder="Buscar curso por nombre o código..."
                            variant="solo" 
                            density="compact" 
                            prepend-inner-icon="mdi-filter-variant" 
                            hide-details
                            flat
                        ></v-text-field>
                    </div>

                    <v-data-table 
                        :headers="courseHeaders" 
                        :items="allCourses" 
                        :loading="dialogLoading"
                        :search="courseSearchQuery"
                        item-value="code"
                        density="comfortable" 
                        height="350px"
                        fixed-header
                    >
                        <template v-slot:item.action="{ item }">
                            <v-btn 
                                :color="isAssigned(item.code) ? 'error' : 'success'"
                                :variant="isAssigned(item.code) ? 'tonal' : 'elevated'"
                                size="x-small"
                                :loading="actionLoading === item.code"
                                @click="handleToggleCourse(item)"
                                :prepend-icon="isAssigned(item.code) ? 'mdi-minus' : 'mdi-plus'"
                            >
                                {{ isAssigned(item.code) ? 'Quitar' : 'Asignar' }}
                            </v-btn>
                        </template>

                        <template v-slot:no-data>
                            <div class="pa-4 text-center text-grey">No se encontraron cursos disponibles</div>
                        </template>
                    </v-data-table>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="isAssignDialogOpen = false">Cancelar</v-btn>
                    <v-btn color="primary" variant="flat" rounded="lg" width="120" @click="isAssignDialogOpen = false">
                        Listo
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
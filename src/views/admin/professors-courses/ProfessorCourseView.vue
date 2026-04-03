<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'

const professors = ref<any[]>([])
const allCourses = ref<any[]>([]) 
const loading = ref(false)
const searchQuery = ref('')
const expanded = ref([])

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
] as const

const courseHeaders = [
    { title: 'Curso', key: 'name', align: 'start' },
    { title: 'Código', key: 'code', align: 'start' },
    { title: 'Acción', key: 'action', align: 'end', sortable: false },
] as const

const fetchAssignments = async () => {
    loading.value = true
    try {
        const mockProfessors = [
            { id: 1, firstName: 'Oscar', lastName: 'García', email: 'oscar.garcia@univ.edu', courses: [{ id: 101, name: 'Base de Datos I', code: 'BD1' }] },
            { id: 2, firstName: 'Ana', lastName: 'Martínez', email: 'ana.mtz@univ.edu', courses: [] },
            { id: 3, firstName: 'Roberto', lastName: 'Solis', email: 'r.solis@univ.edu', courses: [] }
        ]

        professors.value = mockProfessors.map((p: any) => ({
            ...p,
            fullName: `${p.firstName} ${p.lastName}`,
            coursesCount: p.courses?.length || 0
        }))
    } catch (error) {
        console.error("Error:", error)
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

const isAssigned = (courseId: number) => {
    return selectedProfessor.value?.courses?.some((c: any) => c.id === courseId)
}

const handleToggleCourse = async (course: any) => {
    actionLoading.value = course.id
    try {
        if (isAssigned(course.id)) {
            console.log("Quitando curso:", course.name, "al profesor:", selectedProfessor.value.id)
        } else {
            console.log("Asignando curso:", course.name, "al profesor:", selectedProfessor.value.id)
        }
    } finally {
        actionLoading.value = null
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

onMounted(fetchAssignments)
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

        <v-card border flat rounded="lg">
            <v-data-table 
                v-model:expanded="expanded"
                :headers="headers" 
                :items="filteredProfessors" 
                :search="searchQuery"
                item-value="id"
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
                        item-value="id" 
                        density="comfortable" 
                        height="350px"
                        fixed-header
                    >
                        <template v-slot:item.action="{ item }">
                            <v-btn 
                                :color="isAssigned(item.id) ? 'error' : 'success'" 
                                :variant="isAssigned(item.id) ? 'tonal' : 'elevated'" 
                                size="x-small"
                                :loading="actionLoading === item.id" 
                                @click="handleToggleCourse(item)"
                                :prepend-icon="isAssigned(item.id) ? 'mdi-minus' : 'mdi-plus'"
                            >
                                {{ isAssigned(item.id) ? 'Quitar' : 'Asignar' }}
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
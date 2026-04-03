<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'
import type { CourseDto } from '@/dtos/course.dto'
import type { ProfessorDto } from '@/dtos/professor.dto'
import { VDataTable } from 'vuetify/components'

type ReadonlyDataTableHeader = VDataTable['$props']['headers']

const courses = ref<CourseDto[]>([])
const teachers = ref<ProfessorDto[]>([])
const loading = ref(false)
const searchQuery = ref('')
const teacherSearch = ref('')

const editDialog = ref(false)
const teacherDialog = ref(false)
const selectedCourse = ref<CourseDto | null>(null)

const headers: ReadonlyDataTableHeader = [
  { title: 'Código', key: 'code', align: 'start', sortable: true },
  { title: 'Nombre del Curso', key: 'name', align: 'start' },
  { title: 'Docente Asignado', key: 'professorName', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
]

const teacherHeaders: ReadonlyDataTableHeader = [
  { title: 'Nombre Completo', key: 'fullName' },
  { title: 'Acción', key: 'action', align: 'end', sortable: false }
]

const loadData = async () => {
  loading.value = true
  try {
    const [coursesResult, profsResult] = await Promise.allSettled([
      adminService.getCourses(),
      adminService.getProfessorRequests()
    ])
    if (coursesResult.status === 'fulfilled') courses.value = coursesResult.value || []
    if (profsResult.status === 'fulfilled') teachers.value = profsResult.value || []
  } finally {
    loading.value = false
  }
}

const getProfessorName = (professorId: number | null) => {
  if (!professorId) return 'Sin asignar'
  const prof = teachers.value.find(p => p.id === professorId)
  return prof ? `${prof.firstName} ${prof.lastName}` : 'No encontrado'
}

const openTeacherPicker = (course: CourseDto) => {
  selectedCourse.value = { ...course }
  teacherSearch.value = ''
  teacherDialog.value = true
}

const selectTeacher = async (professor: ProfessorDto) => {
  const course = selectedCourse.value;
  if (!course) return;

  try {
    await adminService.updateCourse(course.code, { 
      professorId: professor.id 
    });

    const index = courses.value.findIndex(c => c.code === course.code);
    

    if (index !== -1 && courses.value[index]) {
      courses.value[index].professorId = professor.id;
    }

    teacherDialog.value = false;
    teacherSearch.value = '';
    
  } catch (e) {
    console.error("Error en la asignación:", e);
    alert("No se pudo asignar el docente al curso.");
  }
}

const filteredTeachers = computed(() => {
  const q = teacherSearch.value.toLowerCase()
  return teachers.value
    .filter(p => p.status === 'APROBADO')
    .map(p => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }))
    .filter(p => p.fullName.toLowerCase().includes(q))
})

const openEdit = (course: CourseDto) => {
  selectedCourse.value = { ...course }
  editDialog.value = true
}

const saveEdit = async () => {
  if (!selectedCourse.value) return
  try {
    await adminService.updateCourse(selectedCourse.value.code, selectedCourse.value)
    const index = courses.value.findIndex(c => c.code === selectedCourse.value?.code)
    if (index !== -1) courses.value[index] = { ...selectedCourse.value }
    editDialog.value = false
  } catch (e) { alert("Error al guardar cambios") }
}

onMounted(loadData)
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8">
    <div class="d-flex align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">Gestión de Cursos</h1>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-refresh" @click="loadData" :loading="loading" color="primary" variant="tonal"></v-btn>
    </div>

    <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar curso..." variant="outlined"
      rounded="lg" class="mb-6 bg-white" hide-details clearable></v-text-field>

    <v-card border flat rounded="lg">
      <v-data-table :headers="headers" :items="courses" :search="searchQuery" :loading="loading" hover>
        
        <template v-slot:item.professorName="{ item }">
          <div class="d-flex align-center">
            <span :class="!item.professorId ? 'text-grey italic' : ''">
              {{ getProfessorName(item.professorId) }}
            </span>
            <v-btn icon="mdi-account-search" size="small" variant="text" color="primary" class="ml-2"
              @click="openTeacherPicker(item)"></v-btn>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" color="primary" variant="text" @click="openEdit(item)"></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="teacherDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="d-flex align-center">
          <span class="text-h5">Asignar Docente</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="teacherDialog = false"></v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="teacherSearch" prepend-inner-icon="mdi-magnify" label="Buscar por nombre..."
            variant="filled" density="compact" class="mb-4" hide-details></v-text-field>

          <v-data-table :headers="teacherHeaders" :items="filteredTeachers" density="compact" height="300" fixed-header
            no-data-text="No se encontraron docentes" hide-default-footer>
            <template v-slot:item.action="{ item }">
              <v-btn color="success" size="small" variant="tonal" @click="selectTeacher(item)">
                Seleccionar
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="500">
    </v-dialog>
  </v-container>
</template>
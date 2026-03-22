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

const editDialog = ref(false)
const selectedCourse = ref<CourseDto | null>(null)

const headers: ReadonlyDataTableHeader = [
  { title: 'Código', key: 'code', align: 'start', sortable: true },
  { title: 'Nombre del Curso', key: 'name', align: 'start' },
  { title: 'Semestre', key: 'semester', align: 'center' },
  { title: 'Docente Asignado', key: 'professorId', sortable: false, width: '250px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' },
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
  } catch (e) {
    alert("Error al guardar cambios")
  }
}

const assignTeacher = async (course: CourseDto) => {
  try {
    await adminService.updateCourse(course.code, { professorId: course.professorId })
  } catch (e) { alert("Error en la asignación") }
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

    <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Buscar por nombre o código..."
      variant="outlined" rounded="lg" class="mb-6 bg-white" hide-details clearable></v-text-field>

    <v-card border flat rounded="lg">
      <v-data-table :headers="headers" :items="courses" :search="searchQuery" :loading="loading"
        loading-text="Cargando información..." no-data-text="No hay cursos registrados"
        items-per-page-text="Filas por página" :items-per-page-options="[5, 10, 20, 50]" hover>
        <template v-slot:item.semester="{ item }">
          {{ item.semester }}° Semestre
        </template>

        <template v-slot:item.professorId="{ item }">
          <v-select v-model="item.professorId" :items="teachers"
            :item-title="(p: ProfessorDto) => `${p.firstName} ${p.lastName}`" item-value="id" label="Asignar..."
            variant="underlined" density="compact" hide-details @update:model-value="assignTeacher(item)"></v-select>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" color="primary" variant="text" density="comfortable" @click="openEdit(item)"></v-btn>
        </template>

        <template v-slot:loader>
          <v-progress-linear indeterminate color="primary" height="2"></v-progress-linear>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h5">Editar Curso</v-card-title>
        <v-card-text v-if="selectedCourse">
          <v-text-field v-model="selectedCourse.code" label="Código" variant="outlined" readonly
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedCourse.name" label="Nombre" variant="outlined" class="mb-2"></v-text-field>
          <v-text-field v-model="selectedCourse.semester" label="Semestre" variant="outlined" type="number"
            class="mb-2"></v-text-field>
          <v-text-field v-model="selectedCourse.curriculum" label="Pensum" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="elevated" @click="saveEdit">Guardar Cambios</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
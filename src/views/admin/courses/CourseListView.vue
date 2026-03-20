<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService } from '@/services/admin/adminService'
import type { CourseDto } from '@/dtos/course.dto'
import type { ProfessorDto } from '@/dtos/professor.dto'

// --- ESTADOS ---
const courses = ref<CourseDto[]>([])
const teachers = ref<ProfessorDto[]>([])
const loading = ref(false)
const search = ref('')

const editDialog = ref(false)
const selectedCourse = ref<CourseDto | null>(null)

// --- MÉTODOS ---
const loadData = async () => {
    loading.value = true
    try {
        // Obtenemos cursos y profesores aprobados para asignar
        const [coursesData, professorsData] = await Promise.all([
            adminService.getCourses(),
            adminService.getProfessorRequests() 
        ])
        courses.value = coursesData
        // Filtramos para mostrar solo los aprobados en el selector, si fuera necesario
        teachers.value = professorsData 
    } catch (error) {
        console.error("Error al cargar los datos:", error)
    } finally {
        loading.value = false
    }
}

const headers = [
    { title: 'Código', key: 'code' },
    { title: 'Nombre del curso', key: 'name' },
    { title: 'Semestre', key: 'semester' },
    { title: 'Pensum', key: 'curriculum' },
    { title: 'Docente asignado', key: 'professorId', sortable: false },
    { title: 'Acciones', key: 'actions', sortable: false },
]

const openEdit = (item: CourseDto) => {
    selectedCourse.value = { ...item }
    editDialog.value = true
}

const saveEdit = async () => {
    if (selectedCourse.value) {
        try {
            await adminService.updateCourse(selectedCourse.value.id, selectedCourse.value)
            await loadData()
            editDialog.value = false
        } catch (e) { 
            alert("Error al guardar los cambios") 
        }
    }
}

const assignTeacher = async (course: CourseDto) => {
    try {
        await adminService.updateCourse(course.id, { professorId: course.professorId })
        console.log(`Profesor ${course.professorId} asignado con éxito`)
    } catch (e) { 
        alert("Error en la asignación") 
    }
}

onMounted(loadData)
</script>

<template>
  <v-container>
    <v-card rounded="lg" elevation="2">
      <v-card-title class="pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-book-cog</v-icon>
        Gestión de Cursos
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar curso..."
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 300px;"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="courses"
        :search="search"
        :loading="loading"
        hover
        no-data-text="No hay cursos disponibles"
        loading-text="Cargando información..."
      >
        <template #[`item.professorId`]="{ item }">
          <v-select
            v-model="(item as any).professorId"
            :items="teachers"
            :item-title="(prof: ProfessorDto) => `${prof.firstName} ${prof.lastName}`"
            item-value="id"
            label="Asignar Docente"
            variant="underlined"
            density="compact"
            hide-details
            @update:model-value="assignTeacher(item)"
          ></v-select>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn 
            icon="mdi-pencil" 
            variant="text" 
            color="primary" 
            title="Editar curso"
            @click="openEdit(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="600px">
      <v-card title="Editar Información del Curso" rounded="xl" class="pa-4">
        <v-card-text v-if="selectedCourse">
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="selectedCourse.code" label="Código" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="selectedCourse.semester" label="Semestre" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="selectedCourse.name" label="Nombre del Curso" variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="selectedCourse.curriculum" label="Pensum / Malla Curricular" variant="outlined"></v-text-field>
            </v-col>
          </v-row>
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
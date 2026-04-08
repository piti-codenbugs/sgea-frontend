<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { professorService } from '@/services/professor/professorService'
import type { VDataTable } from 'vuetify/components'

type Headers = VDataTable['$props']['headers']

type ProfessorCourseRow = {
    id: number
    code: number
    name: string
    period: string
    assignmentDate: string
}

const myCourses = ref<ProfessorCourseRow[]>([])
const loading = ref(false)
// 1. Nueva variable reactiva para la búsqueda
const searchQuery = ref('')

const headers: Headers = [
    { title: 'Código', key: 'code', align: 'start', sortable: true },
    { title: 'Nombre del Curso', key: 'name', align: 'start' },
    { title: 'Período', key: 'period', align: 'center' },
    { title: 'Fecha de Asignación', key: 'assignmentDate', align: 'center' },
]

const loadCourses = async () => {
    loading.value = true
    try {
      myCourses.value = (await professorService.getMyCourses()).map((course: any) => ({
        id: course.id,
        code: course.courseCode,
        name: course.courseName,
        period: course.period,
        assignmentDate: course.assignmentDate,
      }))
    } catch (error) {
        console.error("Error al cargar mis cursos:", error)
    } finally {
        loading.value = false
    }
}

onMounted(loadCourses)
</script>

<template>
    <div>
        <div class="d-flex align-center mb-6">
            <h1 class="text-h4 font-weight-bold text-primary">Mis Cursos Asignados</h1>
            <v-spacer></v-spacer>
            <v-btn data-cy="professor-courses-refresh-button" icon="mdi-refresh" @click="loadCourses" :loading="loading" color="primary" variant="tonal"></v-btn>
        </div>

        <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por nombre o código de curso..."
            variant="outlined"
            rounded="lg"
            class="mb-6 bg-white"
            hide-details
            clearable
            data-cy="professor-courses-search-input"
        ></v-text-field>

        <v-card border flat rounded="lg">
            <v-data-table
                data-cy="professor-courses-table"
                :headers="headers"
                :items="myCourses"
                :search="searchQuery"
                :loading="loading"
                hover
                no-data-text="No tienes cursos asignados actualmente"
            >
                <template v-slot:item.period="{ item }">
                    <span :data-cy="`professor-course-period-${item.code}`">
                        {{ item.period || 'Sin período' }}
                    </span>
                </template>

                <template v-slot:item.assignmentDate="{ item }">
                    <span :data-cy="`professor-course-assignment-date-${item.code}`">
                        {{ item.assignmentDate ? new Date(item.assignmentDate).toLocaleString() : 'Sin fecha' }}
                    </span>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
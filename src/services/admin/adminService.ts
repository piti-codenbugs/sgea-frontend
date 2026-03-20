import api from '@/services/api'
import type { ProfessorDto, UpdateProfessorRequestDto } from '@/dtos/professor.dto'
import type { CourseDto, UpdateCourseRequestDto } from '@/dtos/course.dto'

export const adminService = {
    async getProfessorRequests(): Promise<ProfessorDto[]> {
        const { data } = await api.get<ProfessorDto[]>('/admin/professor-requests')
        return data
    },

    async approveProfessor(id: number): Promise<void> {
        await api.put(`/admin/professor-requests/${id}/approve`)
    },

    async rejectProfessor(id: number, reason: string): Promise<void> {
        await api.put(`/admin/professor-requests/${id}/reject`, { reason })
    },

    // Gestión de Cursos
    async getCourses(): Promise<CourseDto[]> {
        const { data } = await api.get<CourseDto[]>('/admin/courses')
        return data
    },

    async updateCourse(id: number, payload: UpdateCourseRequestDto): Promise<CourseDto> {
        const { data } = await api.put<CourseDto>(`/admin/courses/${id}`, payload)
        return data
    }
}
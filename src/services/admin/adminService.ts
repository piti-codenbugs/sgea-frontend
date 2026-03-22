import api from '@/services/api'
import type { ProfessorDto } from '@/dtos/professor.dto'
import type { CourseDto, UpdateCourseRequestDto } from '@/dtos/course.dto'

export const adminService = {
    // --- Gestión de Profesores ---
    async getProfessorRequests(): Promise<ProfessorDto[]> {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
            api.get<ProfessorDto[]>('/professor', { params: { status: 'PENDIENTE' } }),
            api.get<ProfessorDto[]>('/professor', { params: { status: 'APROBADO' } }),
            api.get<ProfessorDto[]>('/professor', { params: { status: 'RECHAZADO' } })
        ]);

        console.log("Datos cargados:", { 
            pendientes: pendingRes.data, 
            aprobados: approvedRes.data, 
            rechazados: rejectedRes.data 
        });

        return [
            ...(pendingRes.data || []),
            ...(approvedRes.data || []),
            ...(rejectedRes.data || [])
        ];
    },

    async updateProfessorStatus(id: number, status: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO'): Promise<void> {
        await api.patch(`/professor/${id}/status/${status}`);
    },

    async approveProfessor(id: number): Promise<void> {
        await api.patch(`/professor/${id}/approve`);
    },

    async rejectProfessor(id: number): Promise<void> {
        // pendiente en el backend
        await api.patch(`/professor/${id}/reject`);
    },

    // --- Gestión de Cursos ---
    async getCourses(): Promise<CourseDto[]> {
        const { data } = await api.get<CourseDto[]>('/admin/cursos')
        return data
    },


    async updateCourse(code: number, payload: UpdateCourseRequestDto): Promise<CourseDto> {
        const { data } = await api.put<CourseDto>(`/admin/cursos/${code}`, payload)
        return data
    }
}
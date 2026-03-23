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

        const pending = (pendingRes.data || []).map(p => ({ ...p, status: 'PENDIENTE' as const }));
        const approved = (approvedRes.data || []).map(p => ({ ...p, status: 'APROBADO' as const }));
        const rejected = (rejectedRes.data || []).map(p => ({ ...p, status: 'RECHAZADO' as const }));

        return [...pending, ...approved, ...rejected];
    },

    async updateAccountStatus(id: number, status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO', rejectionReason?: string): Promise<void> {
        await api.patch(`/professor/${id}/status`, {
            status,
            rejectionReason
        });
    },

    async updateProfessorInfo(
        id: number,
        data: {
            firstName: string,
            lastName: string,
            email: string,
            password?: string | null
        }
    ): Promise<void> {
        await api.patch(`/professor/${id}`, data);
    },

    async getProfessorAssignments() {
        const response = await api.get('/professor/assignments');
        return response.data;
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
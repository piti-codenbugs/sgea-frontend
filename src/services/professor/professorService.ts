import api from '@/services/api'
import type { CourseDto } from '@/dtos/course.dto'
import type { EquivalencyRequestDto, ProgramCourseDto } from '@/dtos/equivalency.dto'

export const professorService = {
    async getMyCourses(): Promise<CourseDto[]> {
        const response = await api.get<CourseDto[]>('/course-assignment/my-courses');
        return response.data;
    },

    async getPendingEquivalencies(): Promise<EquivalencyRequestDto[]> {
        const response = await api.get<EquivalencyRequestDto[]>('/equivalencias/professor/pending')
        return response.data
    },

    async getEquivalencyById(id: number): Promise<EquivalencyRequestDto> {
        const response = await api.get<EquivalencyRequestDto>(`/equivalencias/professor/${id}`)
        return response.data
    },

    async rejectEquivalency(id: number, comment: string): Promise<EquivalencyRequestDto> {
        const response = await api.patch<EquivalencyRequestDto>(`/equivalencias/professor/${id}/reject`, {
            comment
        })
        return response.data
    },

    async getPrivateProgramCourses(originCourseCode: string): Promise<ProgramCourseDto[]> {
        const response = await api.get<ProgramCourseDto[]>('/equivalencias/professor/private-programs', {
            params: { originCourseCode }
        })
        return response.data
    },

    async approveEquivalency(
        id: number,
        payload: { signedProgramFile?: File; programCourseId?: number }
    ): Promise<EquivalencyRequestDto> {
        const formData = new FormData()

        if (payload.signedProgramFile) {
            formData.append('signedProgramFile', payload.signedProgramFile)
        }

        if (payload.programCourseId) {
            formData.append('programCourseId', payload.programCourseId.toString())
        }

        const response = await api.patch<EquivalencyRequestDto>(
            `/equivalencias/professor/${id}/approve`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        return response.data
    }
}
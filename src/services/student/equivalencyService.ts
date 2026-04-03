import api from '@/services/api'
import type { CourseDto } from '@/dtos/course.dto'
import type { ProfessorDto } from '@/dtos/professor.dto'
import type { EquivalencyRequestDto, CreateEquivalencyRequestDto, ProgramCourseDto } from '@/dtos/equivalency.dto'

export const equivalencyService = {
  async createRequest(data: CreateEquivalencyRequestDto): Promise<EquivalencyRequestDto> {
    const formData = new FormData()
    formData.append('destinationCourseCode', data.destinationCourseCode.toString())
    formData.append('professorId', data.professorId.toString())
    if (data.programFile) formData.append('programFile', data.programFile)
    if (data.programCourseId) formData.append('programCourseId', data.programCourseId.toString())
    formData.append('certificateFile', data.certificateFile)
    
    if (data.originCourseCode) formData.append('originCourseCode', data.originCourseCode)
    if (data.year) formData.append('year', data.year.toString())
    if (data.semester) formData.append('semester', data.semester.toString())
    if (data.section) formData.append('section', data.section)

    const response = await api.post<EquivalencyRequestDto>('/equivalencias', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
    /* console.log('FormData entries:')
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1])
    }
    return null as unknown as EquivalencyRequestDto */
  },

  async getMyRequests(): Promise<EquivalencyRequestDto[]> {
    const response = await api.get<EquivalencyRequestDto[]>('/equivalencias/student')
    return response.data
  },

  async getRequestById(id: number): Promise<EquivalencyRequestDto> {
    const response = await api.get<EquivalencyRequestDto>(`/equivalencias/${id}`)
    return response.data
  },

  async getAllCourses(): Promise<CourseDto[]> {
    const response = await api.get<CourseDto[]>('/admin/cursos')
    return response.data
  },

  async getAllProfessors(): Promise<ProfessorDto[]> {
    const response = await api.get<ProfessorDto[]>('/professor', {
      params: { status: 'APROBADO' }
    })
    return response.data
  },

  async searchProgramCourses(courseCode: number): Promise<ProgramCourseDto[]> {
    const response = await api.get<ProgramCourseDto[]>('/equivalencias/programas-curso', {
      params: { courseCode }
    })
    return response.data
  }
}

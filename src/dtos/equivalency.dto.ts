export enum EquivalencyStatus {
  PENDIENTE = 'PENDIENTE',
  ACEPTADO = 'ACEPTADO',
  RECHAZADO = 'RECHAZADO'
}

export interface EquivalencyRequestDto {
  id: number
  destinationCourseCode: number
  destinationCourseName?: string
  studentId: number
  professorId: number
  professorFullName?: string
  status: EquivalencyStatus
  programUrl: string
  courseCertificateUrl: string
  signedProgramUrl?: string | null
  originCourseCode?: string
  year?: number
  semester?: number
  section?: string
  createdAt: string
  resolutionDate?: string | null
}

export interface ProgramCourseDto {
  id: number
  courseCode: number
  courseName: string
  professorId: number
  professorName: string
  year: number
  semester: number
  section: string
  programUrl: string
}

export interface CreateEquivalencyRequestDto {
  destinationCourseCode: number
  professorId: number
  programFile?: File
  programCourseId?: number
  certificateFile: File
  originCourseCode?: string
  year?: number
  semester?: number
  section?: string
}

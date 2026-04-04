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
  studentFullName?: string
  professorId: number
  professorFullName?: string
  status: EquivalencyStatus
  comment?: string | null
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
  courseCode: string
  courseName?: string | null
  professorId?: number | null
  professorName?: string | null
  year: number
  semester: number
  section: string
  programUrl: string
  createdAt?: string
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

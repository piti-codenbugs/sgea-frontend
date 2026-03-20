import { UserRole } from './auth.dto'

export interface ProfessorDto {
    id: number
    firstName: string
    lastName: string
    fullName?: string
    email: string
    role: UserRole.PROFESSOR
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string

}


export interface UpdateProfessorRequestDto {
    firstName?: string
    lastName?: string
    email?: string
    specialty?: string
}
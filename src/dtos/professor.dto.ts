import { UserRole } from './auth.dto'

export interface ProfessorDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    registrationDate: string;
    status?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
    rejectionReason?: string;
    fullName?: string;
}

export interface UpdateProfessorRequestDto {
    firstName?: string
    lastName?: string
    email?: string
    specialty?: string
}
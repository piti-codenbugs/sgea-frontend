export enum UserRole {
    STUDENT = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    ADMIN = 'ROLE_ADMIN'
}

export interface LoginRequestDto {
    email: string
    password: string
}

export interface LoginResponseDto {
    token: string
    message: string
    name: string
    email: string
    role: UserRole
}

export interface RegisterStudentRequestDto {
    firstName: string
    lastName: string
    email: string
    password: string
    carnet: string
}

export interface RegisterProfessorRequestDto {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface AuthUserDto {
    name: string
    email: string
    role: UserRole
}

export interface AuthResponseDto {
    token: string
    message: string
    name: string
    email: string
    role: UserRole
}
import api from '@/services/api'
import type {
    LoginRequestDto,
    RegisterStudentRequestDto,
    AuthResponseDto,
    RegisterProfessorRequestDto
} from '@/dtos/auth.dto'

/**
 * envia las credenciales al backend y retorna la respuesta con el token
 */
export async function login(payload: LoginRequestDto): Promise<AuthResponseDto> {
    const {data} = await api.post<AuthResponseDto>('/auth/login', payload)
    return data
}

/**
 * registra un estudiante y retorna la respuesta con el token
 */
export async function registerStudent(payload: RegisterStudentRequestDto): Promise<AuthResponseDto> {
    const {data} = await api.post<AuthResponseDto>('/auth/register-student', payload)
    return data
}

/**
 * registra un profesor y retorna la respuesta con el token
 */
export async function registerProfessor(payload: RegisterProfessorRequestDto): Promise<AuthResponseDto> {
    const {data} = await api.post<AuthResponseDto>('/auth/register-professor', payload)
    return data
}
export async function updateProfile(payload: {
    firstName: string
    lastName: string
    password?: string
}): Promise<{ firstName: string; lastName: string; email: string }> {
    const { data } = await api.put('/usuarios/profile', payload)
    return data
}

/**
 * obtiene el perfil del usuario autenticado
 */
export async function getProfile(): Promise<{ firstName: string; lastName: string; email: string }> {
    const { data } = await api.get('/usuarios/profile')
    return data
}
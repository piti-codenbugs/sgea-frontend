import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import type {AuthResponseDto, AuthUserDto, LoginRequestDto} from '@/dtos/auth.dto'
import {login as loginService} from '@/services/auth/authService'

// store para la sesion
export const useAuthStore = defineStore('auth', () => {

    // guardando token
    const token = ref<string | null>(localStorage.getItem('token'))

    // guardando usuario
    const user = ref<AuthUserDto | null>(
        JSON.parse(localStorage.getItem('user') || 'null')
    )

    // boolean de autenticacion
    const isAuthenticated = computed(() => !!token.value)

    // rol del usuario
    const userRole = computed(() => user.value?.role || null)

    // guardando sesion en memoria y localStorage
    function setSession(data: AuthResponseDto) {
        token.value = data.token
        user.value = {name: data.name, email: data.email, role: data.role}
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    // funcion para login
    async function login(email: string, password: string) {
        const data = await loginService({email, password})
        setSession(data)
    }

    // funcion para logout
    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    }

    return {token, user, isAuthenticated, userRole, login, logout, setSession}
})
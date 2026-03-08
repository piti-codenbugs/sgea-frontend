import axios from 'axios'
import router from '@/router'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ,
    headers: {
        'Content-Type': 'application/json'
    }
})
console.log('API URL:', import.meta.env.VITE_API_URL)

// interceptor de request -> agrega JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Interceptor de response -> maneja token expirado
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            router.push('/login')
        }

        return Promise.reject(error)
    }
)

export default api
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    headers: {'Content-Type': 'application/json'}
})

//agregando token a cada request
api.interceptors.request.use((config) => {
    //obteniendo token del localStorage
    const token = localStorage.getItem('token')
    //si hay token se agrega a config
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    //retornando connfig
    return config
})

// si el token expira redirige al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
import {createRouter, createWebHistory} from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import StudentDashboardView from '../views/student/StudentDashboardView.vue'
import ProfessorDashboardView from '../views/professor/ProfessorDashboardView.vue'
import {useAuthStore} from '@/stores/authStore.ts'

const routes = [
    {path: '/', component: WelcomeView},
    {path: '/login', component: LoginView},
    {path: '/register', component: RegisterView},
    {
        path: '/student/dashboard',
        component: StudentDashboardView,
        meta: {requiresAuth: true, role: 'STUDENT'}
    },
    {
        path: '/professor/dashboard',
        component: ProfessorDashboardView,
        meta: {requiresAuth: true, role: 'PROFESSOR'}
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const auth = useAuthStore()

    // si la ruta requiere sesion y no hay, manda a login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }

    // si la ruta requiere un rol especifico y no coincide manda a login
    if (to.meta.role && to.meta.role !== auth.userRole) {
        return '/login'
    }
})

export default router
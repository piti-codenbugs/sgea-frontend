import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import StudentDashboardView from '../views/student/StudentDashboardView.vue'
import ProfessorDashboardView from '../views/professor/ProfessorDashboardView.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import RequestListView from '../views/admin/requests/RequestListView.vue'
import AdminDashboardView from '@/views/admin/AdminDashboardView.vue'

const routes = [
    { path: '/', component: WelcomeView },
    { path: '/login', 
        tittle: 'Iniciar sesion - SGEA',
        component: LoginView },
    { path: '/register', 
        title: 'Registrarse - SGEA',
        component: RegisterView },
    {
        path: '/student/dashboard',
        component: StudentDashboardView,
        meta: { requiresAuth: true, role: 'STUDENT' }
    },
    {
        path: '/professor/dashboard',
        component: ProfessorDashboardView,
        meta: { requiresAuth: true, role: 'PROFESSOR' }
    },
{
        path: '/admin',
        component: AdminDashboardView,
        meta: { requiresAuth: true, role: 'ADMIN' }, 
        children: [
            {
                path: 'courses',
                name: 'admin-courses',
                component: () => import('@/views/admin/courses/CourseListView.vue'),
                meta: { title: 'Gestión de Cursos' }
            },
            {
                path: 'requests',
                name: 'professor-requests',
                component: () => import('@/views/admin/requests/RequestListView.vue'),
                meta: { title: 'Docentes Pendientes' }
            }
        ]
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {/*
    const auth = useAuthStore()

    // si la ruta requiere sesion y no hay, manda a login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }

    // si la ruta requiere un rol especifico y no coincide manda a login
    if (to.meta.role && to.meta.role !== auth.userRole) {
        return '/login'
    }*/
   return true
})

export default router
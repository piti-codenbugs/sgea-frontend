import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import StudentDashboardView from '../views/student/StudentDashboardView.vue'
import ProfessorDashboardView from '../views/professor/ProfessorDashboardView.vue'
import { useAuthStore } from '@/stores/authStore.ts'
import { components } from 'vuetify/dist/vuetify.js'

const routes = [
    { path: '/', component: WelcomeView },
    {
        path: '/login',
        tittle: 'Iniciar sesion - SGEA',
        component: LoginView
    },
    {
        path: '/register',
        title: 'Registrarse - SGEA',
        component: RegisterView
    },
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
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        children: [
            {
                path: 'courses',
                name: 'admin-courses',
                component: () => import('@/views/admin/courses/CourseListView.vue')
            },
            {
                path: 'professors',
                name: 'admin-professors',
                component: () => import('@/views/admin/requests/ProfessorsRequestView.vue')
            },
            {
                path: 'professors-courses',
                name: 'admin-professors-courses',
                component: () => import('@/views/admin/professors-courses/ProfessorCourseView.vue')
            }
        ],
        meta: { requiresAuth: true, role: 'ROLE_ADMIN' }
    }
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
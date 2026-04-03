import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import StudentDashboardView from '../views/student/StudentDashboardView.vue'
import { useAuthStore } from '@/stores/authStore.ts'

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
        children: [
            {
                path: '',
                name: 'student-home',
                component: () => import('@/views/student/StudentHomeView.vue')
            },
            {
                path: 'equivalencies',
                name: 'student-equivalencies',
                component: () => import('@/views/student/equivalencies/StudentEquivalenciesListView.vue')
            },
            {
                path: 'equivalencies/create',
                name: 'student-create-equivalency',
                component: () => import('@/views/student/equivalencies/StudentCreateEquivalencyView.vue')
            },
            {
                path: 'equivalencies/:id',
                name: 'student-equivalency-detail',
                component: () => import('@/views/student/equivalencies/StudentEquivalencyDetailView.vue')
            }
        ],
        meta: { requiresAuth: true, role: 'ROLE_STUDENT' }
    },
    {
        path: '/professor',
        component: () => import('@/views/professor/ProfessorDashboardView.vue'),
        children: [
            {
                path: '',
                name: 'professor-home',
                component: () => import('@/views/professor/ProfessorHomeView.vue')
            },
            {
                path: 'my-courses',
                name: 'professor-courses',
                component: () => import('@/views/professor/ProfessorCoursesView.vue')
            },
            {
                path: 'equivalencies/pending',
                name: 'professor-equivalencies-pending',
                component: () => import('@/views/professor/equivalencies/ProfessorPendingEquivalenciesView.vue')
            },
            {
                path: 'equivalencies/:id',
                name: 'professor-equivalency-review',
                component: () => import('@/views/professor/equivalencies/ProfessorEquivalencyReviewView.vue')
            }
        ],
        meta: { requiresAuth: true, role: 'ROLE_PROFESSOR' }
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
<script setup lant="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const router = useRouter()
const auth = useAuthStore()

const navLinks = [
    { title: 'Cursos', icon: 'mdi-book-open-variant', to: '/admin/courses' },
    { title: 'Solicitudes de profesores', icon: 'mdi-account-clock', to: '/admin/requests' }
]

const handleLogout = () => {
    auth.isAuthenticated = false
    auth.userRole = null
    router.push('/login')
}
</script>

<template>
    <v-app shadow>
        <v-app-bar color="primary" elevation="3">
            <v-app-bar-title class="font-weight-bold">
                SGEA <span class="text-sutitle-2 font-weigh-thin">| Administrador</span>
            </v-app-bar-title>
            <v-spacer></v-spacer>
            <div class="hideden-sm-and-down">
                <v-btn v-for="link in navLinks" :key="link.title" :to="link.to" variant="text" class="mxx-1">
                    {{ link.title }}
                </v-btn>
            </div>

            <v-divider vertical inset class="mx-4"></v-divider>

            <v-menu min-width="200px" rounded="lg">
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                        <v-avatar color="secondary" size="32">
                            <v-icon icon="mdi-account" size="small"></v-icon>
                        </v-avatar>
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item prepend-icon="mdi-account-circle-outline" title="Mi perfil"
                        to="/admin/profile"></v-list-item>

                    <v-divider class="my-2"></v-divider>

                    <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" color="error"
                        @click="handleLogout"></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="bg-grey-lighten-4">
            <v-container fluid class="pa-6">
                <router-view />
            </v-container>
        </v-main>
    </v-app>
</template>
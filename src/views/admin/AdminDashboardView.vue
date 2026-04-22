<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore';

const router = useRouter()
const auth = useAuthStore()

const navLinks = [
    { title: 'Cursos', icon: 'mdi-book-open-variant', to: { name: 'admin-courses' } },
    { title: 'Solicitudes de profesores', icon: 'mdi-account-clock', to: { name: 'admin-professors' } },
    { title: 'Profesores - cursos', icon: 'mdi-book', to: { name: 'admin-professors-courses' } }
]

const handleLogout = () => {
    auth.logout()
    router.push('/login')
}
</script>

<template>
    <v-app>
        <v-app-bar color="primary" elevation="3">
            <v-app-bar-title class="font-weight-bold">
                SGEA <span class="text-subtitle-2 font-weight-thin d-none d-sm-inline">| Administrador</span>
            </v-app-bar-title>

            <v-spacer></v-spacer>

            <div class="d-none d-md-flex">
                <v-btn v-for="link in navLinks" :key="link.title" :to="link.to" variant="text" class="mx-1">
                    <v-icon start :icon="link.icon"></v-icon>
                    {{ link.title }}
                </v-btn>
            </div>

            <v-divider vertical inset class="mx-4 d-none d-md-flex"></v-divider>

            <v-menu min-width="230px" rounded="lg">
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                        <v-avatar color="secondary" size="32">
                            <span v-if="auth.user?.name" class="text-caption">{{ auth.user.name.charAt(0).toUpperCase()
                            }}</span>
                            <v-icon v-else icon="mdi-account" size="small"></v-icon>
                        </v-avatar>
                    </v-btn>
                </template>

                <v-list>
                    <v-menu min-width="230px" rounded="lg">
                        <template v-slot:activator="{ props }">
                            <v-btn icon v-bind="props">
                                <v-avatar color="secondary" size="32">
                                    <span v-if="auth.user?.name" class="text-caption text-white">
                                        {{ auth.user.name.charAt(0).toUpperCase() }}
                                    </span>
                                    <v-icon v-else icon="mdi-account" size="small"></v-icon>
                                </v-avatar>
                            </v-btn>
                        </template>

                    </v-menu>

                    <v-divider></v-divider>

                    <div class="d-flex d-md-none flex-column">
                        <v-list-item v-for="link in navLinks" :key="'mobile-' + link.title" :to="link.to"
                            :prepend-icon="link.icon" :title="link.title" color="primary" class="mb-1"></v-list-item>
                        <v-divider class="my-2"></v-divider>
                    </div>

                    <v-list-item prepend-icon="mdi-account-circle-outline" title="Mi perfil"
                        :to="{ name: 'admin-profile' }"></v-list-item>

                    <v-divider class="my-2"></v-divider>

                    <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" color="error"
                        @click="handleLogout"></v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="bg-grey-lighten-4">
        <v-container fluid class="pa-4 pa-md-6 d-flex flex-column align-center" style="min-height: 100%;">
            <v-row justify="center" style="width: 100%; max-width: 1400px;">
            <v-col cols="12">
                <router-view />
            </v-col>
            </v-row>
        </v-container>
        </v-main>
    </v-app>
</template>
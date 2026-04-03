<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
    <v-container class="pa-0">
        <v-card class="pa-6 pa-md-8" rounded="lg" elevation="2">
            <div class="d-flex flex-column flex-md-row align-md-center">
                <div>
                    <h1 class="text-h4 font-weight-bold text-primary mb-2">Bienvenido, {{ auth.user?.name }}</h1>
                    <p class="text-subtitle-1 text-medium-emphasis mb-0">
                        Este es tu panel docente. Desde aqui puedes consultar tus cursos asignados y gestionar tus
                        actividades.
                    </p>
                </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="d-flex flex-column flex-sm-row ga-3">
                <v-btn color="primary" prepend-icon="mdi-book-open-variant" :to="{ name: 'professor-courses' }">
                    Ver Mis Cursos
                </v-btn>
            </div>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
    <v-container class="pa-0 professor-home">
        <v-card class="professor-hero pa-6 pa-md-8" rounded="xl" elevation="0">
            <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
                <div class="professor-hero__copy">
                    <div class="professor-kicker mb-3">Panel del docente</div>
                    <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">Bienvenido, {{ auth.user?.name }}</h1>
                    <p class="text-subtitle-1 text-medium-emphasis mb-0 professor-hero__lead">
                        Administra tus cursos asignados y revisa equivalencias pendientes desde un panel más limpio y directo.
                    </p>
                </div>

                <v-chip color="secondary" variant="elevated" prepend-icon="mdi-clipboard-check-outline" class="professor-hero__chip">
                    Gestión docente activa
                </v-chip>
            </div>

            <v-divider class="my-6"></v-divider>

            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="professor-feature h-100 d-flex flex-column" color="primary" variant="tonal">
                        <v-card-item>
                            <template #prepend>
                                <v-avatar icon="mdi-book-open-variant" color="primary" class="professor-feature__avatar"></v-avatar>
                            </template>

                            <v-card-title class="text-h6 font-weight-bold">Mis Cursos</v-card-title>
                            <v-card-subtitle>Consulta tus asignaciones por periodo</v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="flex-grow-1">
                            <p class="text-body-2">
                                Revisa los cursos que tienes asignados, identifica rápidamente tu carga y entra al detalle cuando lo necesites.
                            </p>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" variant="flat" prepend-icon="mdi-arrow-right" :to="{ name: 'professor-courses' }">
                                Ver cursos
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card class="professor-feature h-100 d-flex flex-column professor-feature--accent" variant="outlined">
                        <v-card-item>
                            <template #prepend>
                                <v-avatar icon="mdi-file-document-edit-outline" color="secondary" class="professor-feature__avatar"></v-avatar>
                            </template>

                            <v-card-title class="text-h6 font-weight-bold">Equivalencias Pendientes</v-card-title>
                            <v-card-subtitle>Revisa solicitudes listas para evaluar</v-card-subtitle>
                        </v-card-item>

                        <v-card-text class="flex-grow-1">
                            <p class="text-body-2">
                                Accede a las solicitudes pendientes, revisa la documentación y aprueba o rechaza según corresponda.
                            </p>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="secondary" variant="flat" prepend-icon="mdi-arrow-right" :to="{ name: 'professor-equivalencies-pending' }">
                                Revisar equivalencias
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<style scoped>
.professor-home {
    max-width: 1180px;
    margin: 0 auto;
}

.professor-hero {
    position: relative;
    overflow: hidden;
    background:
        radial-gradient(circle at top right, rgba(25, 118, 210, 0.16), transparent 30%),
        radial-gradient(circle at bottom left, rgba(255, 152, 0, 0.10), transparent 24%),
        linear-gradient(135deg, #ffffff 0%, #f6f8fd 100%);
    border: 1px solid rgba(25, 118, 210, 0.08);
}

.professor-hero::after {
    content: '';
    position: absolute;
    inset: -120px auto auto -110px;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: rgba(25, 118, 210, 0.06);
    pointer-events: none;
}

.professor-hero__copy,
.professor-feature {
    position: relative;
    z-index: 1;
}

.professor-kicker {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-primary));
    background: rgba(25, 118, 210, 0.08);
}

.professor-hero__lead {
    max-width: 52rem;
}

.professor-hero__chip {
    align-self: flex-start;
}

.professor-feature {
    border-radius: 20px;
    min-height: 100%;
}

.professor-feature--accent {
    background: linear-gradient(180deg, rgba(255, 152, 0, 0.06), rgba(255, 152, 0, 0.02));
    border-color: rgba(255, 152, 0, 0.2);
}

.professor-feature__avatar {
    box-shadow: 0 10px 24px rgba(25, 118, 210, 0.15);
}
</style>

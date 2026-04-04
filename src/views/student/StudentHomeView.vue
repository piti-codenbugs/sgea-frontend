<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const goToCreateEquivalency = () => {
  router.push('/student/dashboard/equivalencies/create')
}

const goToMyEquivalencies = () => {
  router.push('/student/dashboard/equivalencies')
}
</script>

<template>
  <v-container class="pa-0 student-home">
    <v-card class="student-hero pa-6 pa-md-8 mb-6" rounded="xl" elevation="0">
      <div class="student-hero__header d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
        <div class="student-hero__copy">
          <div class="student-kicker mb-3">Panel del estudiante</div>
          <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">Bienvenido, {{ auth.user?.name }}</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0 student-hero__lead">
            Gestiona tus solicitudes de equivalencia académica desde un panel claro, rápido y centralizado.
          </p>
        </div>

        <v-chip color="primary" variant="elevated" prepend-icon="mdi-school-outline" class="student-hero__chip">
          Acceso rápido a equivalencias
        </v-chip>
      </div>

      <v-divider class="my-6"></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="student-feature h-100 d-flex flex-column" variant="tonal" color="primary">
            <v-card-item>
              <template #prepend>
                <v-avatar icon="mdi-file-document-outline" color="primary" class="student-feature__avatar"></v-avatar>
              </template>

              <v-card-title class="text-h6 font-weight-bold">Mis Solicitudes</v-card-title>
              <v-card-subtitle>Consulta el estado y detalle de cada solicitud</v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1">
              <p class="text-body-2">
                Revisa tus solicitudes de equivalencia, identifica pendientes o aprobadas y entra al detalle cuando lo necesites.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="goToMyEquivalencies" color="primary" variant="flat" append-icon="mdi-arrow-right">
                Ver solicitudes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="student-feature h-100 d-flex flex-column student-feature--accent" variant="outlined">
            <v-card-item>
              <template #prepend>
                <v-avatar icon="mdi-plus-circle-outline" color="success" class="student-feature__avatar"></v-avatar>
              </template>

              <v-card-title class="text-h6 font-weight-bold">Nueva Solicitud</v-card-title>
              <v-card-subtitle>Inicia una equivalencia desde cero</v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1">
              <p class="text-body-2">
                Completa el formulario guiado para registrar un nuevo proceso de equivalencia de manera ordenada.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="goToCreateEquivalency" color="success" variant="flat" append-icon="mdi-arrow-right">
                Crear solicitud
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-alert type="info" variant="tonal" border="start" class="student-note">
      Estos son los módulos disponibles actualmente en tu panel. Más opciones se agregarán próximamente.
    </v-alert>
  </v-container>
</template>

<style scoped>
.student-home {
  max-width: 1180px;
  margin: 0 auto;
}

.student-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(25, 118, 210, 0.16), transparent 28%),
    radial-gradient(circle at bottom left, rgba(76, 175, 80, 0.12), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
  border: 1px solid rgba(25, 118, 210, 0.08);
}

.student-hero::after {
  content: '';
  position: absolute;
  inset: auto -80px -120px auto;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.08);
  filter: blur(8px);
  pointer-events: none;
}

.student-hero__header,
.student-hero__copy,
.student-feature {
  position: relative;
  z-index: 1;
}

.student-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  background: rgba(25, 118, 210, 0.08);
}

.student-hero__lead {
  max-width: 52rem;
}

.student-hero__chip {
  align-self: flex-start;
}

.student-feature {
  border-radius: 20px;
  min-height: 100%;
}

.student-feature--accent {
  background: linear-gradient(180deg, rgba(76, 175, 80, 0.06), rgba(76, 175, 80, 0.02));
  border-color: rgba(76, 175, 80, 0.2);
}

.student-feature__avatar {
  box-shadow: 0 10px 24px rgba(25, 118, 210, 0.15);
}

.student-note {
  border-radius: 16px;
}
</style>

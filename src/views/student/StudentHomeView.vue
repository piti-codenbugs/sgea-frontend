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
  <v-container class="pa-0">
    <v-card class="pa-6 pa-md-8 mb-6" rounded="lg" elevation="2">
      <div class="d-flex flex-column flex-md-row align-md-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold text-primary mb-2">Bienvenido, {{ auth.user?.name }}</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Gestiona tus solicitudes de equivalencia académica y mantente informado sobre el estado de tus tramites.
          </p>
        </div>
      </div>

      <v-divider class="my-6"></v-divider>

      <!-- Módulos disponibles -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="h-100 d-flex flex-column" variant="tonal" color="primary">
            <v-card-item>
              <template #prepend>
                <v-avatar icon="mdi-file-document" color="primary"></v-avatar>
              </template>

              <v-card-title class="text-h6 font-weight-bold">Equivalencias Académicas</v-card-title>
              <v-card-subtitle>Solicitar o revisar tus equivalencias</v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1">
              <p class="text-body-2">
                Solicita equivalencia por cursos que hayas completado en otras instituciones o programas académicos.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="goToMyEquivalencies"
                color="primary"
                variant="text"
                size="small"
                append-icon="mdi-eye"
              >
                Ver Solicitudes
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="h-100 d-flex flex-column" variant="outlined" color="success">
            <v-card-item>
              <template #prepend>
                <v-avatar icon="mdi-plus-circle" color="success"></v-avatar>
              </template>

              <v-card-title class="text-h6 font-weight-bold">Nueva Solicitud</v-card-title>
              <v-card-subtitle>Crear una nueva equivalencia</v-card-subtitle>
            </v-card-item>

            <v-card-text class="flex-grow-1">
              <p class="text-body-2">
                Inicia el proceso de solicitud de equivalencia académica completando el formulario correspondiente.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="goToCreateEquivalency"
                color="success"
                variant="text"
                size="small"
                append-icon="mdi-arrow-right"
              >
                Crear
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-alert type="info" variant="tonal" border="start">
      Estos son los módulos disponibles actualmente en tu panel. Más opciones se agregarán próximamente.
    </v-alert>
  </v-container>
</template>

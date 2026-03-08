<script setup lang="ts">
import {useAuthStore} from '@/stores/authStore'

const auth = useAuthStore()

const icons = [
  'mdi-github',
  'mdi-gmail'
]
</script>
<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height d-flex align-center justify-center">
        <v-card class="text-center pa-6 elevation-10 rounded-xl" width="520">

          <v-icon size="56" color="primary" class="mb-3">
            mdi-account
          </v-icon>

          <v-card-title class="text-h4 font-weight-bold">Bienvenido, {{ auth.user?.name }}</v-card-title>

          <v-card-text class="text-h6 mt-2 text-secondary">Profesor</v-card-text>

          <v-divider class="my-4"></v-divider>

          <v-card-actions class="justify-center">

            <v-btn
                color="error"
                size="large"
                rounded="xl"
                prepend-icon="mdi-logout"
                @click="auth.logout(); $router.push('/login')"
            >
              Cerrar Sesión
            </v-btn>

          </v-card-actions>

        </v-card>

      </v-container>

    </v-main>

    <v-footer
        class="text-center d-flex flex-column ga-1 py-2"
        color="primary"
        app
    >

      <div class="d-flex ga-2 justify-center">
        <v-btn
            v-for="icon in icons"
            :key="icon"
            :icon="icon"
            color="accent"
            density="compact"
            size="small"
            variant="text"
        />
      </div>

      <v-divider
          color="secondary"
          class="my-1"
          thickness="1"
          width="120"
      />

      <div class="text-caption text-background">
        <strong>SGEA. PITI - CodeNBugs</strong>
      </div>

    </v-footer>

  </v-app>

</template>

<style scoped>
</style>
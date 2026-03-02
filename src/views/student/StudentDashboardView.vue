<script setup lang="ts">
import {useAuthStore} from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="text-center pa-6" width="500">
      <v-card-title class="text-h4">
        bienvenido, {{ auth.user?.name }}
      </v-card-title>
      <v-card-text class="text-h6 mt-2">
        Bienvenido Estudiante
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="error" size="large" @click="auth.logout(); $router.push('/login')">
          Cerrar sesion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>

</style>
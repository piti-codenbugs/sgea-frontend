<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height d-flex align-center justify-center">
        <v-card class="text-center pa-8" width="520" elevation="8" rounded="xl">
          <v-avatar size="70" color="secondary" class="mx-auto mb-4">
            <v-icon size="36" color="white">mdi-school</v-icon>
          </v-avatar>
          <v-card-title class="text-h4 font-weight-bold text-primary">¡¡Bienvenido a SGEA!!</v-card-title>
          <v-divider class="my-4 mx-auto" width="80" thickness="3" color="accent"/>
          <v-card-text class="text-body-1 text-secondary">{{ mensaje }}</v-card-text>
          <v-card-actions class="justify-center mt-4">
            <v-btn color="primary" size="large" rounded="xl" elevation="2" to="/login" prepend-icon="mdi-login">
              Iniciar Sesión
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
    <v-footer class="text-center d-flex flex-column ga-1 py-2" color="primary" app>
      <div class="d-flex ga-2 justify-center">
        <v-btn v-for="icon in icons" :key="icon" :icon="icon" color="accent" density="compact" size="small"
               variant="text"/>
      </div>

      <v-divider color="secondary" class="my-1" thickness="1" width="120"/>

      <div class="text-caption text-background">
        <strong>SGEA. PITI - CodeNBugs </strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
const mensaje =
    'Este es un sistema que te permitirá solicitar equivalencia de cursos y mantener un seguimiento durante el proceso de tu equivalencia en el Centro Universitario de Occidente - Universidad San Carlos de Guatemala'

const icons = [
  'mdi-github',
  'mdi-gmail',
]
</script>
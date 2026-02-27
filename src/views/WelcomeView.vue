<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="text-center pa-6" width="500">
      <v-card-title class="text-h5">
        ¡¡Bienvenido a SGEA!!
      </v-card-title>
      <v-card-text>
        {{ mensaje }}
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" size="large" to="/login">
          Iniciar Sesion
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  const mensaje = 'textop de bienvenida al sistema'
</script>

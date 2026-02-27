<script setup lang="ts">
  import { ref } from 'vue'

  const password = ref('')
  const showPassword = ref(false)

</script>
<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-center">Inicio de Sesion</v-card-title>
      <v-card-text>
        <v-text-field label="Correo" />
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        />
      </v-card-text>
      <v-card-actions>
        <v-container class="text-center">
          <v-row class="justify-center">
            <v-col cols="12" md="4" sm="6">
              <v-btn
                block
                color="secondary"
                rounded="xl"
                size="x-large"
                to="/"
              >Regresar
              </v-btn>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-btn
                block
                color="primary"
                rounded="xl"
                size="x-large"
              >Ingresar</v-btn>
            </v-col>
          </v-row>
          <v-row class="justify-center mt-2">
            <v-col cols="12" md="8" sm="8">
              <v-btn
                block
                color="accent"
                rounded="xl"
                size="large"
                to="/register"
              >¿Sin cuenta aun? Registrate</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

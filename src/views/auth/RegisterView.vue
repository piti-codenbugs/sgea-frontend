<script setup lang="ts">
import {ref} from 'vue'

const password = ref('')
const showPassword = ref(false)
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-center">Registro</v-card-title>

      <v-card-text>
        <v-select
            :items="['Profesor', 'Estudiante']"
            label="Seleccione un rol"
        />
        <v-text-field label="Nombres"/>
        <v-text-field label="Apellidos"/>
        <v-text-field label="Correo"/>
        <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            label="Contraseña"
            :type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword"
        />
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-container class="text-center">
          <v-row class="justify-center">
            <v-col cols="12" md="4" sm="6">
              <v-btn
                  block
                  color="secondary"
                  rounded="xl"
                  size="x-large"
                  to="/login"
              >Iniciar Sesion
              </v-btn>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-btn
                  block
                  color="primary"
                  rounded="xl"
                  size="x-large"
              >Registrarse
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

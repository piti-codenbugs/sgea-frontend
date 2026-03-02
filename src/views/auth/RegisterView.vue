<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import api from '@/services/api'
import {useAuthStore} from '@/stores/authStore'
import type {RegisterStudentRequestDto, AuthResponseDto} from '@/dtos/auth.dto'

const auth = useAuthStore()
const router = useRouter()

const selectedRole = ref<'Estudiante' | 'Profesor'>('Estudiante')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const carnet = ref('')       // solo si es estudiante
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  error.value = ''
  try {
    if (selectedRole.value === 'Estudiante') {
      const payload: RegisterStudentRequestDto = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        carnet: carnet.value,
      }
      const {data} = await api.post<AuthResponseDto>('/auth/register-student', payload)

      auth.setSession(data)

    } else {
      // endpoint de profesor aún pendiente del backend
      error.value = 'El registro de profesores aún no está disponible'
      return
    }

    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al registrarse'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-center">Registro</v-card-title>
      <v-card-text>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-select
            v-model="selectedRole"
            :items="['Estudiante', 'Profesor']"
            label="Seleccione un rol"
        />
        <v-text-field v-model="firstName" label="Nombres"/>
        <v-text-field v-model="lastName" label="Apellidos"/>
        <v-text-field v-model="email" label="Correo" type="email"/>

        <!-- Carnet solo aparece si es estudiante -->
        <v-text-field
            v-if="selectedRole === 'Estudiante'"
            v-model="carnet"
            label="Carnet"
        />

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
              <v-btn block color="secondary" rounded="xl" size="x-large" to="/login">
                Iniciar Sesión
              </v-btn>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-btn
                  block
                  color="primary"
                  rounded="xl"
                  size="x-large"
                  :loading="loading"
                  @click="handleRegister"
              >Registrarse
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
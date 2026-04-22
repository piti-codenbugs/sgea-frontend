<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {
  registerStudent,
  registerProfessor
} from '@/services/auth/authService'

import type {
  RegisterStudentRequestDto,
  RegisterProfessorRequestDto
} from '@/dtos/auth.dto'

const router = useRouter()

const selectedRole = ref<'Estudiante' | 'Profesor'>('Estudiante')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const carnet = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)


const icons = [
  'mdi-github',
  'mdi-gmail'
]

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  carnet: ''
})

function validateForm(): boolean {
  let valid = true
  errors.value = { firstName: '', lastName: '', email: '', password: '', carnet: '' }

  if (!firstName.value.trim()) {
    errors.value.firstName = 'Los nombres son obligatorios'
    valid = false
  }
  if (!lastName.value.trim()) {
    errors.value.lastName = 'Los apellidos son obligatorios'
    valid = false
  }
  if (!email.value.trim()) {
    errors.value.email = 'El correo es obligatorio'
    valid = false
  }
  if (!password.value.trim()) {
    errors.value.password = 'La contraseña es obligatoria'
    valid = false
  }
  if (selectedRole.value === 'Estudiante' && !carnet.value.trim()) {
    errors.value.carnet = 'El carnet es obligatorio'
    valid = false
  }

  return valid
}

async function handleRegister() {
  if (!validateForm()) return

  loading.value = true
  error.value = ''

  try {
    //evaluando el rol del usuario a registrar
    if (selectedRole.value === 'Estudiante') {
      //si es estudiante se crea dto con los datos recibidos
      const payload: RegisterStudentRequestDto = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        carnet: carnet.value
      }
      await registerStudent(payload)

    } else if (selectedRole.value === 'Profesor') {
      //si es profesor se crea dto con los datos recibidos
      const payload: RegisterProfessorRequestDto = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
      }
      await registerProfessor(payload)
    }
    //mandando a login despues de registrarse
    router.push('/login')

  } catch (e: any) {
    error.value =
        e.response?.data?.message || 'Error al registrarse'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height d-flex align-center justify-center">
        <v-card width="520" class="pa-6 elevation-10 rounded-xl">
          <div class="text-center mb-4">
            <v-icon size="48" color="primary" class="mb-2">mdi-account-plus</v-icon>
            <v-card-title class="text-h5 font-weight-bold">Crear Cuenta</v-card-title>
            <div class="text-body-2 text-secondary">
              Regístrate para utilizar el sistema SGEA
            </div>
          </div>
          <v-divider class="mb-4"></v-divider>
          <v-card-text>
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

            <v-select v-model="selectedRole" :items="['Estudiante', 'Profesor']" label="Seleccione un rol"
                      variant="outlined" prepend-inner-icon="mdi-account" class="mb-3" data-cy="selectedRole"/>

            <v-text-field v-model="firstName" label="Nombres *" variant="outlined" prepend-inner-icon="mdi-account":error-messages="errors.firstName"
                          class="mb-3"/>

            <v-text-field v-model="lastName" label="Apellidos" variant="outlined" :error-messages="errors.lastName"
                          prepend-inner-icon="mdi-account-outline" class="mb-3"/>

            <v-text-field v-model="email" label="Correo" type="email" variant="outlined" prepend-inner-icon="mdi-email" :error-messages="errors.email"
                          class="mb-3"/>

            <v-text-field v-if="selectedRole === 'Estudiante'" v-model="carnet" label="Carnet" variant="outlined"
                          prepend-inner-icon="mdi-card-account-details" :error-messages="errors.carnet" class="mb-3" data-cy="carnet"/>

            <v-text-field v-model="password" label="Contraseña" variant="outlined" prepend-inner-icon="mdi-lock"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="showPassword ? 'text' : 'password'" 
                            :error-messages="errors.password"
                          @click:append="showPassword = !showPassword"/>

          </v-card-text>

          <v-divider class="mt-2 mb-4"></v-divider>

          <v-card-actions class="justify-center">
            <v-row class="w-100">
              <v-col cols="6">
                <v-btn block color="secondary" rounded="xl" size="large" to="/login">
                  Iniciar Sesión
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn block color="primary" rounded="xl" size="large" :loading="loading" @click="handleRegister"
                       data-cy="login-btn">
                  Registrarse
                </v-btn>
              </v-col>
            </v-row>
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
        <strong>SGEA. PITI - CodeNBugs</strong>
      </div>
    </v-footer>
  </v-app>
</template>
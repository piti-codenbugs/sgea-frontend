<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)

    // redireccion por rol
    if (auth.userRole === 'STUDENT') {
      router.push('/student/dashboard')
    } else if (auth.userRole === 'PROFESSOR') {
      router.push('/professor/dashboard')
    } else {
      router.push('/')
    }

  } catch (e: any) {
    error.value = e.response?.data?.message || 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card width="400">
      <v-card-title class="text-center">
        Inicio de Sesion
      </v-card-title>
      <v-card-text>
        <!-- error -->
        <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
        >
          {{ error }}
        </v-alert>
        <!-- email -->
        <v-text-field
            v-model="email"
            label="Correo"
            type="email"
            data-cy="email"
        />
        <v-text-field
            v-model="password"
            label="Contraseña"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            @click:append="showPassword = !showPassword"
            data-cy="password"
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
                  data-cy="btn-back"
              >
                Regresar
              </v-btn>
            </v-col>
            <v-col cols="12" md="4" sm="6">
              <v-btn
                  block
                  color="primary"
                  rounded="xl"
                  size="x-large"
                  :loading="loading"
                  @click="handleLogin"
                  data-cy="login-btn"
              >
                Ingresar
              </v-btn>
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
              >
                ¿Sin cuenta aun? Registrate
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
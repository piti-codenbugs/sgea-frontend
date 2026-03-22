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

const icons = ['mdi-github', 'mdi-gmail']

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    await auth.login(email.value, password.value)

    // redireccion por rol
    if (auth.userRole === 'ROLE_STUDENT') {
      router.push('/student/dashboard')
    } else if (auth.userRole === 'ROLE_PROFESSOR') {
      router.push('/professor/my-courses')
    } else if (auth.userRole === 'ROLE_ADMIN') {
      router.push('/admin/courses')
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
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height d-flex align-center justify-center">
        <v-card width="420" class="pa-8 text-center" rounded="xl" elevation="8">
          <v-avatar size="70" color="secondary" class="mx-auto mb-4">
            <v-icon size="36" color="white">mdi-school</v-icon>
          </v-avatar>

          <v-card-title class="text-h5 font-weight-bold text-primary">
            Inicio de Sesión
          </v-card-title>
          <v-divider class="my-4 mx-auto" width="60" thickness="3" color="accent" />

          <v-card-text>
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
              {{ error }}
            </v-alert>

            <v-text-field
              v-model="email"
              label="Correo"
              type="email"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-email-outline"
              data-cy="email"
            />

            <v-text-field
              v-model="password"
              label="Contraseña"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              @click:append-inner="showPassword = !showPassword"
              data-cy="password"
            />
          </v-card-text>

          <v-card-actions class="flex-column">
            <v-btn
              block
              color="primary"
              size="large"
              rounded="xl"
              elevation="2"
              :loading="loading"
              @click="handleLogin"
              data-cy="login-btn"
            >
              Ingresar
            </v-btn>

            <v-btn
              block
              color="secondary"
              variant="text"
              class="mt-2"
              to="/"
              data-cy="btn-back"
            >
              Regresar
            </v-btn>

            <v-btn
              block
              color="accent"
              class="mt-4"
              rounded="xl"
              size="large"
              to="/register"
            >
              ¿Sin cuenta aún? Regístrate
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <v-footer class="text-center d-flex flex-column ga-1 py-2" color="primary" app>
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

      <v-divider color="secondary" class="my-1" thickness="1" width="120" />

      <div class="text-caption text-background">
        <strong>SGEA. PITI - CodeNBugs</strong>
      </div>
    </v-footer>
  </v-app>
</template>

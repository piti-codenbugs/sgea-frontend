<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getProfile } from '@/services/auth/authService'

const auth = useAuthStore()

const [firstName = '', ...rest] = (auth.user?.name || '').split(' ')
const lastName = rest.join(' ')

const form = reactive({
  firstName: '',
  lastName: '',
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const data = await getProfile()
    form.firstName = data.firstName
    form.lastName = data.lastName
  } catch (e) {
    errorMsg.value = 'Error al cargar el perfil'
  }
})

const loading = ref(false)
const success = ref(false)
const errorMsg = ref('')
const showCurrentPassword = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)


const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  minPassword: (v: string) => !v || v.length >= 8 || 'Mínimo 8 caracteres',
  matchPassword: (v: string) => v === form.password || 'Las contraseñas no coinciden'
}

const handleSubmit = async () => {
  if (form.password && form.password !== form.confirmPassword) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }

  loading.value = true
  errorMsg.value = ''
  success.value = false

  try {
    const payload: { firstName: string; lastName: string; currentPassword?: string; password?: string } = {
      firstName: form.firstName,
      lastName: form.lastName,
    }
    if (form.password) {
        payload.currentPassword = form.currentPassword
        payload.password = form.password
    }

    await auth.updateProfile(payload)

    success.value = true
    form.password = ''
    form.confirmPassword = ''
  }  catch (e: any) {
        errorMsg.value = e?.response?.data?.message || e?.message || 'Error al actualizar el perfil'
} finally {
    loading.value = false
  }
}
</script>

<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="7" lg="5">
      <v-card rounded="xl" elevation="2" class="pa-2">
        <v-card-title class="pt-6 px-6 text-h6 font-weight-bold">
          Mi perfil
        </v-card-title>
        <v-card-subtitle class="px-6 pb-4">
          Administra tu información personal
        </v-card-subtitle>

        <v-divider></v-divider>

        <v-card-text class="pa-6">

          <v-text-field
            :model-value="auth.user?.email"
            label="Correo electrónico"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            readonly
            disabled
            class="mb-2"
            data-cy="email"
          ></v-text-field>

          <v-text-field
            v-model="form.firstName"
            label="Nombres"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-2"
            data-cy="firstName"
          ></v-text-field>

          <v-text-field
            v-model="form.lastName"
            label="Apellidos"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-2"
            data-cy="lastName"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>

          <p class="text-caption text-medium-emphasis mb-4">
            Deja los campos de contraseña en blanco si no deseas cambiarla.
          </p>

          <v-text-field
            v-model="form.currentPassword"
            label="Contraseña actual"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="showCurrentPassword ? 'text' : 'password'"
            variant="outlined"
            class="mb-2"
            data-cy="currentPassword"
            @click:append-inner="showCurrentPassword = !showCurrentPassword"
        ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Nueva contraseña"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :rules="[rules.minPassword]"
            class="mb-2"
            data-cy="password"
            @click:append-inner="showPassword = !showPassword"
          ></v-text-field>

          <v-text-field
            v-model="form.confirmPassword"
            label="Confirmar nueva contraseña"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            :type="showConfirmPassword ? 'text' : 'password'"
            variant="outlined"
            :rules="[rules.matchPassword]"
            class="mb-2"
            data-cy="confirmPassword"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          ></v-text-field>

          <v-alert
            v-if="success"
            type="success"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="success = false"
          >
            Perfil actualizado correctamente.
          </v-alert>

          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="errorMsg = ''"
          >
            {{ errorMsg }}
          </v-alert>

        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="loading"
            min-width="160"
            rounded="lg"
            data-cy="saveButton"
            @click="handleSubmit"
          >
            Guardar cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
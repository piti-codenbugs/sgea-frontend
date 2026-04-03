<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const navLinks = [
  { title: 'Inicio', icon: 'mdi-home-outline', to: { name: 'student-home' } },
]

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="3">
      <v-app-bar-title class="font-weight-bold">
        SGEA <span class="text-subtitle-2 font-weight-thin d-none d-sm-inline">| Estudiante</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <div class="d-none d-md-flex">
        <v-btn v-for="link in navLinks" :key="link.title" :to="link.to" variant="text" class="mx-1">
          <v-icon start :icon="link.icon"></v-icon>
          {{ link.title }}
        </v-btn>
      </div>

      <v-divider vertical inset class="mx-4 d-none d-md-flex"></v-divider>

      <v-menu min-width="230px" rounded="lg">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="secondary" size="32">
              <span v-if="auth.user?.name" class="text-caption">{{ auth.user.name.charAt(0).toUpperCase() }}</span>
              <v-icon v-else icon="mdi-account" size="small"></v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="pb-3">
            <template v-slot:prepend>
              <v-avatar color="primary" size="40">
                <span class="text-h6 text-white">{{ auth.user?.name?.charAt(0).toUpperCase() }}</span>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ auth.user?.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">Estudiante</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" color="error" @click="handleLogout"></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-4 pa-md-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

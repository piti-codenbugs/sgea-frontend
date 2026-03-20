<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const pendingRequests = ref([
  { id: 1, name: 'Docente 1', email: 'correo@correo', date: '2026-03-15' },
  { id: 2, name: 'Docente 2', email: 'correo@correo', date: '2026-03-16' },
  { id: 3, name: 'Docente 3', email: 'correo@correo', date: '2026-03-17' },
])

const isRejectDialogOpen = ref(false)
const rejectionReason = ref('')
const selectedRequest = ref<any>(null)

const approveRequest = (request: any) => {
  console.log(`Usuario aprobado: ${request.name}`)
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== request.id)
}

const openRejectDialog = (request: any) => {
  selectedRequest.value = request
  rejectionReason.value = ''
  isRejectDialogOpen.value = true
}

const confirmRejection = () => {
  if (!rejectionReason.value.trim()) return
  
  console.log(`Rechazada ${selectedRequest.value.name}. Razón: ${rejectionReason.value}`)
  
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== selectedRequest.value.id)
  
  isRejectDialogOpen.value = false
}

onMounted(() => {
  document.title = 'Pendiente'
})
</script>

<template>
  <v-container>
    <v-card border flat rounded="lg">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon start color="warning">mdi-account-clock</v-icon>
        Docentes pendientes de aprovación
        <v-chip size="small" color="primary">{{ pendingRequests.length }} Pendiente</v-chip>
      </v-card-title>

      <v-divider></v-divider>

      <v-table hover>
        <thead>
          <tr>
            <th class="text-left">Nombre</th>
            <th class="text-left">Email</th>
            <th class="text-left">Fecha solicitud</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in pendingRequests" :key="request.id">
            <td>{{ request.name }}</td>
            <td>{{ request.email }}</td>
            <td>{{ request.date }}</td>
            <td class="text-center">
              <v-btn
                color="success"
                variant="text"
                icon="mdi-check-circle"
                @click="approveRequest(request)"
              ></v-btn>
              
              <v-btn
                color="error"
                variant="text"
                icon="mdi-close-circle"
                @click="openRejectDialog(request)"
              ></v-btn>
            </td>
          </tr>
          <tr v-if="pendingRequests.length === 0">
            <td colspan="4" class="text-center py-4 text-grey">No hay solicitudes pendientes.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="isRejectDialogOpen" max-width="500">
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6">
          Solicitudes rechazadas
        </v-card-title>
        
        <v-card-text>
          <p class="mb-4">
            Razón de rechazo <strong>{{ selectedRequest?.name }}</strong>:
          </p>
          <v-textarea
            v-model="rejectionReason"
            placeholder="Escriba el motivo por el cuál es rechazado."
            variant="outlined"
            auto-grow
            counter
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isRejectDialogOpen = false">Cancelar</v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="!rejectionReason"
            @click="confirmRejection"
          >
            Confirmar rechazo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
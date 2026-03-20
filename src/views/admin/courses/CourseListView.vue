<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const dialogRechazo = ref(false);
const motivoRechazo = ref('')

const confirmarRechazo = () => {
    console.console.log('Rechazado por: ', motivoRechazo.value);
    dialogRechazo.ref = false;
    
};

</script>

<template>
  <v-card tittle="Gestión de Cursos">
    <v-data-table :headers="headers" :items="courses">
      <template #[`item.teacher`]="{ item }">
        <v-select
          v-mode="item.teacherId"
          :items="teachers"
          item-tittle="name"
          item_value="id"
          label="Asignar Docente"
          variant="underlined"
          dense
          @update:model-value="assignTeacher(item)"
        ></v-select>
      </template>
    </v-data-table>
  </v-card>
</template>

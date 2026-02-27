/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'sgeaTheme',
    themes: {
      sgeaTheme: {
        dark: false,
        colors: {
          primary: '#243B6B', // azul oscuro
          secondary: '#5E7E96', // azul palido
          accent: '#E8AC59', // naranja - amarillo
          background: '#C9C3BA', //blanco hueso
          surface: '#FFFFFF', //blanco
          alert: '#c22424', //rojo
          success: 'rgb(78,212,0)', //verde
        },
      },
    },
  },
})

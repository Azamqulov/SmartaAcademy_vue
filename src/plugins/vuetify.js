import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

// localStorage'dan theme holatini olish
const storedTheme = localStorage.getItem("theme") || 'light'; // default tema sifatida 'light'
console.log(storedTheme);

export default createVuetify({
  theme: {
    themes: {
      light: {
        primary: "#1976D2", // Primary rang (Blue)
        background: "#ECEFF1", // Oq fon
        surface: "#F5F5F5", // Yuzasi
        colors:{
          surface: "#ECEFF1", // Yuzasi

        }
      },
      dark: {
        primary: "#BB86FC", // Primary rang (Purple)
        background: "#091f1f6f", // Qora fon
        surface: "#091f1f6f", // Yuzasi
        sidebar: "#203B37", // Yuzasi
        colors:{
          surface: "#263238", // Yuzasi

        }
      },
    },
    defaultTheme: storedTheme, // localStorage'dan olingan theme holatini qo'llash
  },
})

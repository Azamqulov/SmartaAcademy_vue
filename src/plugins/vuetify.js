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
        primary: "#fff", // Primary rang (Purple)
        background: "#0d111785 ", // Qora fon
        surface: "#0d111785 ", // Yuzasi
        sidebar: "#0D1117", // Yuzasi
        colors:{
          surface: "#0d111785 ", // Yuzasi

        }
      },
    },
    defaultTheme: storedTheme, // localStorage'dan olingan theme holatini qo'llash
  },
})

import { createApp } from "vue";
import { registerPlugins } from "@/plugins";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router"; // Router qo'shildi

const app = createApp(App); // Faqat bitta app yaratiladi

registerPlugins(app); // Plaginlarni ro‘yxatdan o‘tkazish
app.use(router).use(vuetify); // Vuetify va Router ulanishi

app.mount("#app"); // Bir marta mount qilish

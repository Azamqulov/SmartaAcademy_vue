/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";
import vuetify from './plugins/vuetify'
// Composables
// import Toastify from 'toastify-js';
import { createApp } from "vue";
import 'toastify-js/src/toastify.css';  // CSS faylini import qilish

const app = createApp(App);

registerPlugins(app);


app.mount("#app");
app.use(vuetify);
createApp(App).use(router).mount("#app");

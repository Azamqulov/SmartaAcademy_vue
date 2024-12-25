import { createApp } from "vue";
import { registerPlugins } from "@/plugins";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
const app = createApp(App);

registerPlugins(app);

app.mount("#app");
createApp(App).use(router).use(vuetify).mount("#app");

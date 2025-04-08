// plugins/index.js
import vuetify from './vuetify';
import router from '@/router';

export function registerPlugins(app) {
  app.use(vuetify).use(router);  // Vuetify va router birga ulanadi
}

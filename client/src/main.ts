import { createApp } from 'vue';
import { Quasar } from "quasar";
import { createRouter, createWebHistory } from 'vue-router';
import './style.css'
import App from './App.vue'
import { routes } from "vue-router/auto-routes";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";

const app = createApp(App);

const router = createRouter({
    history: createWebHistory(),
    routes
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(Quasar, {
    plugins: {},
    config: {
        dark: 'auto'
    }
});
app.use(router);
app.use(pinia);

app.mount('#app')

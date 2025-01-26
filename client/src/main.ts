import { createApp, type Component } from "vue";
import { Quasar, Notify } from "quasar";
import { createRouter, createWebHistory } from "vue-router";
import "./style-helpers.css";
import App from "./App.vue";
import { routes } from "vue-router/auto-routes";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";

const app = createApp(App as Component);

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(Quasar, {
    plugins: {
        Notify,
    },
    config: {
        dark: "auto",
        notify: {
            progress: true,
        },
    },
});
app.use(router);
app.use(pinia);

app.mount("#app");

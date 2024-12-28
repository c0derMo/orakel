import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Axios from "axios";
import { loadFonts } from "./plugins/webfontloader";

loadFonts();

Axios.defaults.headers.common["Authorization"] = `Bearer ${store.state.token}`;

createApp(App).use(router).use(store).use(vuetify).mount("#app");

// Necessary imports
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'
import Axios from 'axios'
import * as VueRouter from 'vue-router'

// Component & view imports
import App from './App.vue'
import Landing from './views/Landing.vue'
import Tournament from './views/Tournament.vue'
import Login from './views/Login.vue'

const routes = [
    { path: "/", component: Landing },
    { path: "/tournament/:tid", component: Tournament },
    { path: "/login", component: Login }
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

const app = createApp(App);

Axios.defaults.headers.common['Authorization'] = `Bearer ${store.state.token}`;

app.use(ElementPlus);
app.use(store);
app.use(router);
app.mount('#app');
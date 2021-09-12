import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import store from './store'
import Axios from 'axios'

const app = createApp(App);

Axios.defaults.headers.common['Authorization'] = `Bearer ${store.state.token}`;

app.use(ElementPlus);
app.use(store);
app.mount('#app');
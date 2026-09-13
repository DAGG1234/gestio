import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // <--- 1. Importa el router que creamos
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router) // <--- 2. Regístralo en la aplicación

app.mount('#app')
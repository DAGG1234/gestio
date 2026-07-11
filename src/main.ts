import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 1. Importa Pinia
import App from './App.vue';
import router from './router'; 
import './style.css'; 

const app = createApp(App);

// 2. CREA E INSTALA PINIA PRIMERO
const pinia = createPinia();
app.use(pinia); 

// 3. AHORA SÍ, importa y usa el store
import { useUserStore } from './stores/userStore';
const store = useUserStore();

if (store.isDarkMode) {
  document.documentElement.classList.add('dark');
}

// 4. Monta el resto
app.use(router);
app.mount('#app');
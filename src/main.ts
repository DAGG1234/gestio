import { createApp } from 'vue';
import { createPinia } from 'pinia'; 
import App from './App.vue';
import router from './router'; 
import './style.css'; 

const app = createApp(App);

const pinia = createPinia();
app.use(pinia); 


import { useUserStore } from './stores/userStore';
const store = useUserStore();

if (store.isDarkMode) {
  document.documentElement.classList.add('dark');
}

app.use(router);
app.mount('#app');
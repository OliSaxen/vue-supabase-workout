import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/useUserStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initiera användarstore efter att appen är redo
app.mount('#app')

// Initiera auth state
const userStore = useUserStore()
userStore.initialize()

<template>
  <div class="auth-view">
    <div class="auth-card">
      <h1>Registrera konto</h1>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="fullName">Fullständigt namn</label>
          <input
            v-model="form.fullName"
            type="text"
            id="fullName"
            required
            placeholder="Anders Andersson"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            v-model="form.email"
            type="email"
            id="email"
            required
            placeholder="din@email.se"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Lösenord</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            required
            placeholder="Minst 6 tecken"
          />
          <small class="password-hint">Minst 6 tecken</small>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Bekräfta lösenord</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            id="confirmPassword"
            required
            placeholder="Samma lösenord igen"
          />
        </div>
        
        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>
        
        <button type="submit" :disabled="userStore.isLoading || !passwordsMatch" class="auth-button">
          <span v-if="userStore.isLoading">Registrerar...</span>
          <span v-else>Registrera</span>
        </button>
        
        <div class="auth-links">
          <p>Redan konto? <router-link to="/login">Logga in</router-link></p>
          <p><router-link to="/">Tillbaka till startsidan</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordsMatch = computed(() => {
  return form.value.password === form.value.confirmPassword && form.value.password.length >= 6
})

const handleRegister = async () => {
  if (!passwordsMatch.value) return
  
  const result = await userStore.signUp(
    form.value.email,
    form.value.password,
    { fullName: form.value.fullName }
  )
  
  if (result.success) {
    // Visa bekräftelsemeddelande
    alert('Registrering lyckades! Kontrollera din email för verifiering.')
    router.push('/')
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
}

.auth-button {
  width: 100%;
  padding: 14px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.auth-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.auth-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
}

.auth-links {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
}

.auth-links a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}
.password-hint {
  display: block;
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
}
</style>
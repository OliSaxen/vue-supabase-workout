<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">
        Workout
      </router-link>
      
      <!-- Hamburger ikon för mobil -->
      <button 
        class="hamburger-button" 
        @click="toggleMenu"
        :class="{ 'active': isMenuOpen }"
        aria-label="Meny"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
      
      <!-- Navigationslänkar -->
      <div class="nav-links" :class="{ 'active': isMenuOpen }">
        <router-link to="/" @click="closeMenu">Hem</router-link>
        <router-link to="/events" @click="closeMenu">Events</router-link>
        <router-link to="/progress" @click="closeMenu">Mina framsteg</router-link>
        
        <!-- Användarmeny -->
        <div v-if="userStore.isAuthenticated" class="user-menu">
          <router-link to="/profile" class="user-link" @click="closeMenu">
            👤 {{ userStore.userName }}
          </router-link>
          <router-link to="/" @click="handleLogout" class="logout-button">
            Logga ut
          </router-link>
        </div>
        
        <div v-else class="auth-links">
          <router-link to="/login" class="login-button" @click="closeMenu">Logga in</router-link>
          <router-link to="/register" class="register-button" @click="closeMenu">Registrera</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleLogout = async () => {
  await userStore.signOut()
  router.push('/')
  closeMenu()
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  position: relative;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
  z-index: 1001;
}

/* Hamburger button styles */
.hamburger-button {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.hamburger-line {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #4b5563;
  border-radius: 2px;
  transition: all 0.3s ease-in-out;
}

.hamburger-button.active .hamburger-line:nth-child(1) {
  transform: translateY(10px) rotate(45deg);
}

.hamburger-button.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-button.active .hamburger-line:nth-child(3) {
  transform: translateY(-10px) rotate(-45deg);
}

/* Navigationslänkar */
.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #3b82f6;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-links {
  display: flex;
  gap: 15px;
}

.login-button, .logout-button {
  padding: 8px 20px;
  border-radius: 6px;
  color: #3b82f6;
  text-decoration: none;
  border: 1px solid #3b82f6;
}

.register-button {
  padding: 8px 20px;
  border-radius: 6px;
  background-color: #3b82f6;
  color: white !important;
  text-decoration: none;
}

.login-button:hover,
.register-button:hover,
.logout-button:hover {
  opacity: 0.9;
}

/* Responsiva styles */
@media (max-width: 768px) {
  .hamburger-button {
    display: flex;
  }
  
  .nav-links {
    position: fixed;
    top: 70px;
    left: 0;
    width: 100%;
    height: calc(100vh - 70px);
    background: white;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 40px;
    gap: 30px;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .nav-links.active {
    transform: translateX(0);
  }
  
  .nav-links a {
    font-size: 18px;
    padding: 10px 0;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
  }
  
  .auth-links {
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
  }
  
  .login-button,
  .register-button,
  .logout-button {
    width: 200px;
    text-align: center;
  }
}

@media (min-width: 769px) {
  .nav-links {
    transform: translateX(0) !important;
  }
}
</style>
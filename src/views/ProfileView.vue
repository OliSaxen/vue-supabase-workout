<template>
  <div class="profile-view">
    <div class="profile-card">
      <h1>Min Profil</h1>
      
      <div v-if="userStore.profile" class="profile-info">
        <div class="info-item">
          <label>Namn:</label>
          <span>{{ userStore.profile.full_name }}</span>
        </div>
        <div class="info-item">
          <label>Email:</label>
          <span>{{ userStore.user.email }}</span>
        </div>
        <div class="info-item">
          <label>Fitness Level:</label>
          <span>{{ userStore.profile.fitness_level }}</span>
        </div>
        <div class="info-item">
          <label>Medlem sedan:</label>
          <span>{{ formatDate(userStore.profile.created_at) }}</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <button @click="handleEdit" class="edit-button">Redigera profil</button>
        <button @click="handleLogout" class="logout-button">Logga ut</button>
      </div>
    
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/useUserStore'
import { useEventStore } from '@/stores/useEventStore'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const userStore = useUserStore()
const eventStore = useEventStore()

onMounted(() => {
  return
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('sv-SE')
}

const handleEdit = () => {
  // Implementera redigeringsmodal eller sida
  alert('Redigeringsfunktion kommer snart!')
}

const handleLogout = async () => {
  await userStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
}

.profile-info {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item label {
  font-weight: 600;
  color: #374151;
}

.info-item span {
  color: #6b7280;
}

.profile-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 40px;
}

.edit-button,
.logout-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.logout-button {
  background-color: white;
  color: #dc2626;
  border: 2px solid #dc2626;
}

.edit-button:hover {
  background-color: #2563eb;
}

.logout-button:hover {
  background-color: #fee2e2;
}
</style>
<template>
  <div class="events-view">
    <h1>Tränings Events</h1>
    
    <!-- Loading state -->
    <div v-if="eventStore.isLoading" class="loading">
      <div class="spinner"></div>
      <p>Laddar events...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="eventStore.error" class="error-message">
      <p>Kunde inte ladda events: {{ eventStore.error }}</p>
      <button @click="eventStore.fetchEvents()">Försök igen</button>
    </div>
    
    <!-- No events -->
    <div v-else-if="eventStore.events.length === 0" class="no-events">
      <p>Inga events tillgängliga just nu.</p>
    </div>
    
    <!-- Events grid -->
    <div v-else class="events-container">
      <div class="events-grid">
        <EventCard
          v-for="event in eventStore.events"
          :key="event.id"
          :event="event"
          @register="handleRegister"
        />
      </div>
      
      <!-- Statistics -->
      <div class="stats">
        <p>Totalt: {{ eventStore.events.length }} events</p>
        <p>Öppen anmälan: {{ eventStore.registrationOpen.length }} events</p>
        <p>Anmälda: {{ eventStore.registeredEvents.length }} events</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEventStore } from '@/stores/useEventStore'
import { onMounted } from 'vue'
import EventCard from '@/components/events/EventCard.vue'

const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
})

const handleRegister = (eventId) => {
  eventStore.registerForEvent(eventId)
  // Du kan lägga till en toast/notification här senare
}
</script>

<style scoped>
.events-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #1f2937;
}

.loading {
  text-align: center;
  padding: 48px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 24px;
  background-color: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
}

.error-message button {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-events {
  text-align: center;
  padding: 48px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.stats p {
  font-weight: 600;
  color: #475569;
}
</style>
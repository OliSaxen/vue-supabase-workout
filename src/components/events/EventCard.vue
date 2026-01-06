<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="event-card">
    <div class="event-info">
      <div
        class="event-badge"
        :class="{
          'badge-open': event.registration_open && !event.isRegistered,
          'badge-closed': !event.registration_open || event.isRegistered,
        }"
      >
        {{ event.registration_open ? 'Registration open' : 'Registration closed' }}
      </div>
      <div>{{ event.location }}</div>
    </div>
    <div class="event-header">{{ event.name }}</div>
    <div class="event-subtitle">{{ event.date }}</div>

    <a v-if="event.registration_open" class="event-button" :href="event.website">Anmäl dig</a>
    <span v-else class="event-button event-button-disabled" aria-disabled="true"> Anmäl dig </span>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
}
</script>

<style scoped>
/* Din CSS här (samma som tidigare) */
.event-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: #3b82f6;
}

.event-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.event-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.badge-open {
  background: #d1fae5;
  color: #065f46;
}

.badge-closed {
  background: #f3f4f6;
  color: #6b7280;
}

.event-header {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}

.event-subtitle {
  font-size: 1rem;
  text-align: center;
  margin-bottom: 16px;
  color: #666;
}

.event-button {
  display: block;
  width: 100%;
  padding: 12px;
  text-align: center;
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.event-button:hover {
  background-color: #2563eb;
}

.event-button-disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>

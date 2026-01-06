<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <!-- Hero title -->
          <h1 class="hero-title">
            <span class="hero-gradient">Workout</span>
            <span class="hero-subtitle">Din personliga träningspartner</span>
          </h1>
          <!-- hero description -->
          <p class="hero-description">
            Följ din progress, anmäl dig till events och nå dina fitness-mål tillsammans med oss.
          </p>
          <!-- if user not logged in, buttons to login and register -->
          <div class="hero-actions" v-if="!userStore.isAuthenticated">
            <router-link to="/register" class="hero-button primary"> Kom igång gratis </router-link>
            <router-link to="/login" class="hero-button secondary"> Logga in </router-link>
          </div>
          <!-- if user is logged in, buttons to see own progress and events -->
          <div class="hero-actions" v-else>
            <router-link to="/progress" class="hero-button primary">
              📊 Se min progress
            </router-link>
            <router-link to="/events" class="hero-button secondary"> 🏆 Visa events </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section, highlights of key featutures (some of them still in development) -->
    <section class="features-section">
      <div class="section-header">
        <h2>Allt du behöver för att nå dina mål</h2>
        <p>En komplett plattform för din fitnessresa</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📈</div>
          <h3>Progress Tracking</h3>
          <p>Följ din vikt, löpning och steg med snygga diagram. Se hur du utvecklas över tid.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3>Events & Tävlingar</h3>
          <p>Anmäl dig till träningsevents i din stad. Möt andra och håll motivationen uppe.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3>Personlig Statistik</h3>
          <p>Få detaljerad statistik om dina träningsvanor. Sätt mål och fira framsteg.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>Målsättning</h3>
          <p>Sätt upp personliga mål och få reminders. Nå nya PRs varje vecka.</p>
        </div>
      </div>
    </section>

    <!-- Quick Stats (for logged in users) -->
    <section class="stats-section" v-if="userStore.isAuthenticated">
      <div class="section-header">
        <h2>Din statistik just nu</h2>
        <p>Översikt över din senaste aktivitet</p>
      </div>

      <div class="stats-cards">
        <!-- weight stat card -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">⚖️</span>
            <span class="stat-title">Vikt</span>
          </div>
          <!-- show latest weight -->
          <div class="stat-value" v-if="latestWeight">{{ latestWeight }} kg</div>
          <div class="stat-value" v-else>Ingen data</div>
          <!-- show weight change -->
          <div class="stat-change" v-if="weightChange !== null">
            <span :class="weightChange >= 0 ? 'positive' : 'negative'">
              {{ weightChange >= 0 ? '+' : '' }}{{ weightChange.toFixed(1) }} kg
            </span>
            <span class="stat-period">senaste månaden</span>
          </div>
          <router-link to="/progress" class="stat-link"> Lägg till vikt → </router-link>
        </div>
        <!-- running stat card -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">🏃</span>
            <span class="stat-title">Löpning</span>
          </div>
          <!-- total running distance -->
          <div class="stat-value">{{ totalRunningDistance.toFixed(1) }} km</div>
          <!-- number of running activities registered -->
          <div class="stat-subtitle">{{ runningActivities.length }} löpturer</div>
          <!-- average running distance per activity -->
          <div class="stat-info">Snitt: {{ averageRunningDistance.toFixed(1) }} km/tur</div>
          <router-link to="/progress" class="stat-link"> Logga löpning → </router-link>
        </div>
        <!-- walking stat card -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-icon">🚶‍♀️</span>
            <span class="stat-title">Gång</span>
          </div>
          <!-- total steps -->
          <div class="stat-value">
            {{ totalSteps.toLocaleString() }}
          </div>
          <div class="stat-subtitle">steg totalt</div>
          <!-- estimated distance of km walked based on average stride length -->
          <div class="stat-info">≈ {{ (totalSteps / 1538).toFixed(1) }} km</div>
          <router-link to="/progress" class="stat-link"> Lägg till steg → </router-link>
        </div>
      </div>
    </section>

    <!-- Upcoming Events -->
    <section class="events-section" v-if="upcomingEvents.length > 0">
      <div class="section-header">
        <h2>Kommande events</h2>
        <p>Anmäl dig och träna tillsammans</p>
      </div>
      <!-- preview upcoming events -->
      <div class="events-preview">
        <!-- loop through the first 3 upcoming events -->
        <div v-for="event in upcomingEvents.slice(0, 3)" :key="event.id" class="event-preview-card">
          <div class="event-preview-header">
            <h3>{{ event.name }}</h3>
            <span class="event-date">{{ formatDate(event.date) }}</span>
          </div>
          <div class="event-preview-details">
            <span class="event-location">📍 {{ event.location }}</span>
          </div>
          <div class="event-preview-actions">
            <router-link :to="'/events'" class="event-details-button"> Visa detaljer </router-link>
          </div>
        </div>
      </div>

      <div class="view-all-events">
        <router-link to="/events" class="view-all-button">
          Visa alla events ({{ upcomingEvents.length }})
        </router-link>
      </div>
    </section>

    <!-- Call to Action (unlogged users) -->
    <section class="cta-section" v-if="!userStore.isAuthenticated">
      <div class="cta-content">
        <h2>Redo att börja din resa?</h2>
        <p>Registrera dig gratis idag och få tillgång till alla funktioner.</p>
        <div class="cta-actions">
          <router-link to="/register" class="cta-button"> Skapa konto </router-link>
          <router-link to="/login" class="cta-button secondary"> Logga in </router-link>
        </div>
      </div>
    </section>

    <!-- Recent Activity (for logged in users) -->
    <section
      class="activity-section"
      v-if="userStore.isAuthenticated && recentActivities.length > 0"
    >
      <div class="section-header">
        <h2>Senaste aktiviteterna</h2>
        <p>Din senaste träningshistorik</p>
      </div>

      <div class="activity-timeline">
        <div
          v-for="activity in recentActivities.slice(0, 3)"
          :key="activity.id"
          class="timeline-item"
        >
          <div class="timeline-marker">
            <span class="marker-icon">{{ getActivityIcon(activity.type) }}</span>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <h4>{{ getActivityLabel(activity.type) }}</h4>
              <span class="timeline-date">{{ formatDateTime(activity.created_at) }}</span>
            </div>
            <div class="timeline-details">
              <span v-if="activity.type === 'running'">
                🏃 {{ activity.running_distance }} km • ⏱️ {{ activity.running_minutes }} min
              </span>
              <span v-if="activity.type === 'walking'">
                🚶 {{ activity.steps.toLocaleString() }} steg
              </span>
              <span v-if="activity.type === 'weight'"> ⚖️ {{ activity.weight }} kg </span>
            </div>
            <p v-if="activity.notes" class="timeline-notes">
              "{{ truncateText(activity.notes, 80) }}"
            </p>
          </div>
        </div>
      </div>

      <div class="view-all-activity">
        <router-link to="/progress" class="view-activity-button">
          Visa hela historiken
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/useUserStore'
import { useEventStore } from '@/stores/useEventStore'
import { useProgressStore } from '@/stores/useProgressStore'

//initiate pinia stores
const userStore = useUserStore()
const eventStore = useEventStore()
const progressStore = useProgressStore()

// Hämta data när sidan laddas
onMounted(async () => {
  await eventStore.fetchEvents()
  await progressStore.fetchActivities()
})

//computed properties

//EVENTS
// Get upcoming events sorted by date
const upcomingEvents = computed(() => {
  const today = new Date().toISOString().split('T')[0] //get today's date
  return eventStore.events
    .filter((event) => event.date >= today) //only future events
    .sort((a, b) => new Date(a.date) - new Date(b.date)) //sort by date
    .slice(0, 5) //limit to 5 closest events
})
//WEIGHT
// users latest weight entry
const latestWeight = computed(() => {
  if (!progressStore.activities || progressStore.activities.length === 0) return null

  const weightActivities = progressStore.activities
    //filter to only weight activities
    .filter((a) => a.type === 'weight')
    //sort by date
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return weightActivities.length > 0 ? weightActivities[0].weight : null
})

// weight change over the last month
const weightChange = computed(() => {
  const weightActivities =
    progressStore.activities
      ?.filter((a) => a.type === 'weight')
      .sort((a, b) => new Date(a.date) - new Date(b.date)) || []

  //need at least 2 entries to calculate change
  if (weightActivities.length < 2) return null

  //calculate date one month ago
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  //filter activities within the last month
  const recentWeights = weightActivities.filter((a) => new Date(a.date) >= oneMonthAgo)
  if (recentWeights.length < 2) return null

  //calculate the difference
  const first = parseFloat(recentWeights[0].weight)
  const last = parseFloat(recentWeights[recentWeights.length - 1].weight)

  return last - first
})

//RUNNING
//get all running activities
const runningActivities = computed(() => {
  return progressStore.activities?.filter((a) => a.type === 'running') || []
})

//calculate total running distance
const totalRunningDistance = computed(() => {
  return runningActivities.value.reduce(
    (total, activity) => total + parseFloat(activity.running_distance || 0),
    0,
  )
})

//calculate average running distance
const averageRunningDistance = computed(() => {
  if (runningActivities.value.length === 0) return 0
  return totalRunningDistance.value / runningActivities.value.length
})

//WALKING
//calculate total steps
const totalSteps = computed(() => {
  const walkingActivities = progressStore.activities?.filter((a) => a.type === 'walking') || []
  return walkingActivities.reduce((total, activity) => total + parseInt(activity.steps || 0), 0)
})

//ACTIVITIES
//get last 10 activities logged
const recentActivities = computed(() => {
  return progressStore.activities?.slice(0, 10) || []
})

// Helper functions
//format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
//format datetime
const formatDateTime = (datetimeString) => {
  const date = new Date(datetimeString)
  return date.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
//truncate text
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
//get specific emoji for activity type
const getActivityIcon = (type) => {
  const icons = {
    running: '🏃',
    walking: '🚶‍♀️',
    weight: '⚖️',
  }
  return icons[type] || '📝'
}
//get specific label for activity type
const getActivityLabel = (type) => {
  const labels = {
    running: 'Löpning',
    walking: 'Gång',
    weight: 'Vikt',
  }
  return labels[type] || 'Aktivitet'
}
</script>

<style scoped>
.home-view {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 24px;
  margin: 20px 0 60px 0;
  overflow: hidden;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
  align-items: center;
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-gradient {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #4b5563;
  font-weight: 500;
}

.hero-description {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  justify-content: center;
}

.hero-button {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.hero-button.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.hero-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
}

.hero-button.secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.hero-button.secondary:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
}

/* Features Section */
.features-section {
  margin: 80px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 1.125rem;
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* Stats Section */
.stats-section {
  margin: 80px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-10px);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.stat-icon {
  font-size: 24px;
}

.stat-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 5px;
}

.stat-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 10px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.stat-change .positive {
  color: #10b981;
  font-weight: 600;
}

.stat-change .negative {
  color: #ef4444;
  font-weight: 600;
}

.stat-period {
  font-size: 0.75rem;
  color: #9ca3af;
}

.stat-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 10px 0;
}

.stat-link {
  display: inline-block;
  margin-top: 15px;
  color: #3b82f6;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s;
}

.stat-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Events Section */
.events-section {
  margin: 80px 0;
}

.events-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.event-preview-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.event-preview-card:hover {
  transform: translateY(-5px);
}

.event-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.event-preview-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.event-date {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 600;
  background: #eff6ff;
  padding: 4px 12px;
  border-radius: 20px;
  white-space: nowrap;
}

.event-preview-details {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.event-location {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.event-description {
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.9375rem;
}

.event-preview-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-details-button {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.event-details-button:hover {
  background: #2563eb;
}

.view-all-events {
  text-align: center;
}

.view-all-button {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 12px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.3s;
}

.view-all-button:hover {
  transform: translateY(-2px);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  padding: 80px 40px;
  border-radius: 24px;
  margin: 80px 0;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cta-button {
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.cta-button {
  background: white;
  color: #3b82f6;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.secondary:hover {
  background: white;
  color: #3b82f6;
}

/* Activity Section */
.activity-section {
  margin: 80px 0;
}

.activity-timeline {
  max-width: 800px;
  margin: 0 auto 40px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 24px;
  top: 60px;
  bottom: -20px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-marker {
  position: relative;
  z-index: 1;
}

.marker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: default;
  transition: all 0.3s ease;
}

.marker-icon:hover {
  transform: scale(1.1);
  font-size: 25px;
}

.timeline-content {
  flex: 1;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 1.125rem;
}

.timeline-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.timeline-details span {
  background: #e2e7f0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #4d5a69;
}

.timeline-notes {
  margin: 10px 0 0 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
}

.view-all-activity {
  text-align: center;
}

.view-activity-button {
  display: inline-block;
  padding: 12px 32px;
  background: #3b82f6;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.view-activity-button:hover {
  background: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-view {
    padding: 0 15px;
  }

  .hero-section {
    padding: 40px 0;
  }

  .hero-content {
    padding: 0 20px;
  }

  .hero-gradient {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  /* change the display of the buttons */
  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .hero-button {
    width: 100%;
    text-align: center;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .features-grid,
  .stats-cards,
  .events-preview {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 40px 20px;
  }

  .cta-content h2 {
    font-size: 2rem;
  }

  .cta-actions {
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
    text-align: center;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>

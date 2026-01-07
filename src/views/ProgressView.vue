<template>
  <div class="progress-view">
    <h1>Framsteg</h1>
    <h2>Logga din aktivitet</h2>
    <!-- Välj aktivitetstyp -->
    <div class="activity-type-selector">
      <button
        v-for="type in activityTypes"
        :key="type.id"
        @click="selectActivityType(type.id)"
        :class="['type-button', { selected: newActivity.type === type.id }]"
      >
        <span class="type-label">{{ type.label }}</span>
      </button>
    </div>

    <!-- Formulär för vald aktivitet -->
    <div class="activity-form-container" v-if="newActivity.type">
      <form @submit.prevent="addActivity" class="activity-form">
        <!-- Löpning -->
        <div v-if="newActivity.type === 'running'" class="activity-fields">
          <div class="form-group">
            <label>Distans (km)</label>
            <input
              v-model.number="newActivity.running_distance"
              type="number"
              step="0.1"
              min="0.1"
              max="42.2"
              placeholder="t.ex. 5"
              required
            />
          </div>

          <div class="form-group">
            <label>Tid (minuter)</label>
            <input
              v-model.number="newActivity.running_minutes"
              type="number"
              min="1"
              placeholder="t.ex. 30"
              required
            />
          </div>
        </div>

        <!-- Gång -->
        <div v-else-if="newActivity.type === 'walking'" class="activity-fields">
          <div class="form-group">
            <label>Antal steg</label>
            <input
              v-model.number="newActivity.steps"
              type="number"
              min="100"
              step="100"
              placeholder="t.ex. 5000"
              required
            />
          </div>
        </div>

        <!-- Vikt -->
        <div v-else-if="newActivity.type === 'weight'" class="activity-fields">
          <div class="form-group">
            <label>Vikt (kg)</label>
            <input
              v-model.number="newActivity.weight"
              type="number"
              step="0.1"
              min="30"
              max="200"
              placeholder="t.ex. 75.5"
              required
            />
          </div>
        </div>

        <!-- Gemensamma fält -->
        <div class="common-fields">
          <div class="form-group">
            <label>Datum</label>
            <input v-model="newActivity.date" type="date" :max="today" required />
          </div>

          <div class="form-group">
            <label>Anteckningar (valfritt)</label>
            <textarea v-model="newActivity.notes" rows="2"></textarea>
          </div>
        </div>

        <!-- Warning om redan finns data för datumet -->
        <div v-if="hasExistingDataForDate" class="warning-message">
          ⚠️ Du har redan {{ existingActivityType }} loggat för detta datum. Det nya inlägget kommer
          att ersätta det gamla.
        </div>

        <!-- Submit knapp -->
        <button type="submit" :disabled="progressStore.isLoading" class="submit-button">
          {{ progressStore.isLoading ? 'Sparar...' : getSubmitButtonText() }}
        </button>

        <!-- Felmeddelande -->
        <div v-if="formError" class="error-message">
          {{ formError }}
        </div>
      </form>
    </div>

    <!-- Diagram sektion -->
    <div class="charts-section" v-if="hasAnyData">
      <h2>Din Statistik</h2>

      <div class="charts-grid">
        <!-- Löpning diagram -->
        <div class="chart-wrapper" v-if="uniqueRunningData.length > 0">
          <AdvancedChart
            :title="'Löpning'"
            :data="uniqueRunningData"
            type="line"
            :value-suffix="' km'"
          />
        </div>

        <!-- Gång diagram -->
        <div class="chart-wrapper" v-if="uniqueWalkingData.length > 0">
          <AdvancedChart
            :title="'Gång'"
            :data="uniqueWalkingData"
            type="bar"
            :value-suffix="' steg'"
          />
        </div>

        <!-- Vikt diagram -->
        <div class="chart-wrapper" v-if="uniqueWeightData.length > 0">
          <AdvancedChart
            :title="'Vikt'"
            :data="uniqueWeightData"
            type="line"
            :value-suffix="' kg'"
          />
        </div>
      </div>
    </div>

    <!-- Inga data ännu -->
    <div v-else class="no-data-section">
      <div class="no-data-content">
        <span class="no-data-icon">📊</span>
        <h3>Ingen data ännu</h3>
        <p>Börja med att lägga till din första aktivitet ovan!</p>
        <p class="hint">Diagram och statistik kommer automatiskt</p>
      </div>
    </div>

    <!-- Aktivitetshistorik -->
    <div class="activity-history" v-if="uniqueActivities.length > 0">
      <div class="history-header">
        <h2>Din Historik</h2>
        <div class="history-stats">
          <span>{{ uniqueActivities.length }} aktiviteter</span>
          <span>{{ totalDays }} dagar</span>
        </div>
      </div>

      <!-- Filtreringsalternativ -->
      <div class="history-filters">
        <button
          v-for="filter in activityFilters"
          :key="filter.type"
          @click="setActivityFilter(filter.type)"
          :class="['filter-button', { active: activityFilter === filter.type }]"
        >
          {{ filter.icon }} {{ filter.label }}
        </button>
      </div>

      <!-- Aktivitetslista -->
      <div class="activities-list">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-item"
          :class="activity.type"
        >


          <div class="activity-content">
            <div class="activity-header">
              <h4>{{ getActivityLabel(activity.type) }}</h4>
              <div class="activity-meta">
                <span class="activity-date">{{ formatDate(activity.date) }}</span>
                <span class="activity-time">{{ formatTime(activity.created_at) }}</span>
              </div>
            </div>

            <div class="activity-details">
              <!-- Löpning -->
              <div v-if="activity.type === 'running'" class="running-details">
                <span>📏 {{ activity.running_distance }} km</span>
                <span>⏱️ {{ activity.running_minutes }} min</span>
                <span>⚡ {{ calculatePace(activity) }} min/km</span>
              </div>

              <!-- Gång -->
              <div v-else-if="activity.type === 'walking'" class="walking-details">
                <span>👣 {{ activity.steps.toLocaleString() }} steg</span>
                <span>📏 ≈ {{ (activity.steps / 1538).toFixed(1) }} km</span>
              </div>

              <!-- Vikt -->
              <div v-else-if="activity.type === 'weight'" class="weight-details">
                <span>⚖️ {{ activity.weight }} kg</span>
              </div>
            </div>

            <p v-if="activity.notes" class="activity-notes">{{ activity.notes }}</p>

            <!-- Delete button -->
            <button
              @click="confirmDeleteActivity(activity.id)"
              class="delete-activity-button"
              title="Ta bort aktivitet"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Visa fler/färre knapp -->
      <div v-if="uniqueActivities.length > 5" class="show-more-container">
        <button @click="showAllActivities = !showAllActivities" class="show-more-button">
          {{ showAllActivities ? 'Visa färre' : `Visa alla aktiviteter` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProgressStore } from '@/stores/useProgressStore'
import AdvancedChart from '@/components/charts/AdvancedChart.vue'

const progressStore = useProgressStore()
const showAllActivities = ref(false)
const formError = ref('')
const activityFilter = ref('all')

// Activity types
const activityTypes = [
  { id: 'running', label: 'Löpning', icon: '🏃' },
  { id: 'walking', label: 'Gång', icon: '🚶‍♀️' },
  { id: 'weight', label: 'Vikt', icon: '⚖️' },
]

const activityFilters = [
  { type: 'all', label: 'Alla', icon: '📊' },
  { type: 'running', label: 'Löpning', icon: '🏃' },
  { type: 'walking', label: 'Gång', icon: '🚶‍♀️' },
  { type: 'weight', label: 'Vikt', icon: '⚖️' },
]

// Form data
const newActivity = ref({
  type: null,
  running_distance: null,
  running_minutes: null,
  steps: null,
  weight: null,
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const today = new Date().toISOString().split('T')[0]

// Hämta aktiviteter när sidan laddas
onMounted(() => {
  progressStore.fetchActivities()
})

// Kolla om det finns data för valt datum
const hasExistingDataForDate = computed(() => {
  if (!newActivity.value.type || !newActivity.value.date) return false

  const existing = progressStore.activities.find(
    (activity) =>
      activity.type === newActivity.value.type && activity.date === newActivity.value.date,
  )

  return !!existing
})

const existingActivityType = computed(() => {
  if (!hasExistingDataForDate.value) return ''

  const activity = progressStore.activities.find(
    (a) => a.type === newActivity.value.type && a.date === newActivity.value.date,
  )

  if (!activity) return ''

  switch (activity.type) {
    case 'running':
      return 'en löptur'
    case 'walking':
      return 'steg'
    case 'weight':
      return 'vikt'
    default:
      return 'data'
  }
})

// UNIK DATA: Ta bara den senaste aktiviteten per dag och typ
const uniqueActivities = computed(() => {
  const activities = progressStore.activities || []

  // Gruppera efter datum och typ, ta den senaste (sorterat efter created_at)
  const grouped = {}

  activities.forEach((activity) => {
    const key = `${activity.date}_${activity.type}`

    if (!grouped[key] || new Date(activity.created_at) > new Date(grouped[key].created_at)) {
      grouped[key] = activity
    }
  })

  // Konvertera tillbaka till array och sortera efter datum (nyaste först)
  return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Förbered UNIK data för diagram (senaste per dag)
const uniqueWeightData = computed(() => {
  // Hämta bara vikt-aktiviteter, gruppera per datum
  const weightActivities = uniqueActivities.value.filter((a) => a.type === 'weight')

  // Sortera efter datum (äldst först för diagram)
  return weightActivities
    .map((a) => ({
      value: parseFloat(a.weight),
      date: a.date,
      rawDate: new Date(a.date),
    }))
    .sort((a, b) => a.rawDate - b.rawDate)
})

const uniqueRunningData = computed(() => {
  const runningActivities = uniqueActivities.value.filter((a) => a.type === 'running')

  return runningActivities
    .map((a) => ({
      value: parseFloat(a.running_distance),
      date: a.date,
      rawDate: new Date(a.date),
    }))
    .sort((a, b) => a.rawDate - b.rawDate)
})

const uniqueWalkingData = computed(() => {
  const walkingActivities = uniqueActivities.value.filter((a) => a.type === 'walking')

  return walkingActivities
    .map((a) => ({
      value: parseInt(a.steps),
      date: a.date,
      rawDate: new Date(a.date),
    }))
    .sort((a, b) => a.rawDate - b.rawDate)
})

// Check if we have any data
const hasAnyData = computed(() => {
  return (
    uniqueWeightData.value.length > 0 ||
    uniqueRunningData.value.length > 0 ||
    uniqueWalkingData.value.length > 0
  )
})

// Filtered activities for history
const filteredActivities = computed(() => {
  let activities = showAllActivities.value
    ? uniqueActivities.value
    : uniqueActivities.value.slice(0, 5)

  if (activityFilter.value !== 'all') {
    activities = activities.filter((a) => a.type === activityFilter.value)
  }

  return activities
})

// Statistics
const totalDays = computed(() => {
  const dates = new Set(uniqueActivities.value.map((a) => a.date))
  return dates.size
})

// Helper functions
const selectActivityType = (type) => {
  newActivity.value.type = type
  formError.value = ''
}

const getSubmitButtonText = () => {
  if (hasExistingDataForDate.value) {
    return 'Uppdatera aktivitet'
  }
  return 'Spara aktivitet'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('sv-SE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (datetimeString) => {
  if (!datetimeString) return ''
  const date = new Date(datetimeString)
  return date.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}



const getActivityLabel = (type) => {
  const typeObj = activityTypes.find((t) => t.id === type)
  return typeObj ? typeObj.label : 'Aktivitet'
}

const calculatePace = (activity) => {
  if (!activity.running_distance || !activity.running_minutes) return '0:00'
  const pace = activity.running_minutes / activity.running_distance
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const setActivityFilter = (type) => {
  activityFilter.value = type
}

// Add new activity
const addActivity = async () => {
  if (!newActivity.value.type) {
    formError.value = 'Välj en aktivitetstyp'
    return
  }

  const activityData = {
    type: newActivity.value.type,
    date: newActivity.value.date,
    notes: newActivity.value.notes || '',
  }

  // Add type-specific fields
  switch (newActivity.value.type) {
    case 'running':
      if (!newActivity.value.running_distance || !newActivity.value.running_minutes) {
        formError.value = 'Fyll i både distans och tid'
        return
      }
      activityData.running_distance = newActivity.value.running_distance
      activityData.running_minutes = newActivity.value.running_minutes
      break
    case 'walking':
      if (!newActivity.value.steps) {
        formError.value = 'Ange antal steg'
        return
      }
      activityData.steps = newActivity.value.steps
      break
    case 'weight':
      if (!newActivity.value.weight) {
        formError.value = 'Ange vikt'
        return
      }
      activityData.weight = newActivity.value.weight
      break
  }

  const result = await progressStore.addActivity(activityData)

  if (result.success) {
    // Reset form but keep the same activity type
    const currentType = newActivity.value.type
    newActivity.value = {
      type: currentType,
      running_distance: null,
      running_minutes: null,
      steps: null,
      weight: null,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    }
    formError.value = ''
  } else {
    formError.value = result.error || 'Kunde inte spara aktiviteten'
  }
}

// Delete activity
const confirmDeleteActivity = async (activityId) => {
  if (confirm('Är du säker på att du vill ta bort denna aktivitet?')) {
    const result = await progressStore.deleteActivity(activityId)
    if (!result.success) {
      alert('Kunde inte ta bort aktiviteten: ' + result.error)
    }
  }
}
</script>

<style scoped>
.progress-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.progress-view h2{
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
  font-size: 2rem;
}

/* Activity Type Selector */
.activity-type-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-button:hover {
  transform: translateY(-2px);
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-button.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.type-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.type-label {
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

/* Activity Form */
.activity-form-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 40px;
}

.activity-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.common-fields {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

input,
textarea {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.warning-message {
  background-color: #fef3c7;
  color: #92400e;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  border-left: 4px solid #f59e0b;
}

.submit-button {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-top: 10px;
}

/* Charts Section */
.charts-section {
  margin: 40px 0;
}

.charts-section h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
  font-size: 1.8rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.chart-wrapper {
  height: 400px;
}

/* No Data Section */
.no-data-section {
  background: #f8fafc;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  margin: 40px 0;
}

.no-data-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-data-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-data-content h3 {
  margin: 0 0 10px 0;
  color: #374151;
}

.no-data-content p {
  color: #6b7280;
  margin: 5px 0;
}

.hint {
  font-size: 14px;
  color: #9ca3af;
}

/* Activity History */
.activity-history {
  margin-top: 40px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.history-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.8rem;
}

.history-stats {
  display: flex;
  gap: 15px;
}

.history-stats span {
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 20px;
  color: #4b5563;
  font-weight: 500;
  font-size: 14px;
}

.history-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 8px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.filter-button:hover {
  border-color: #d1d5db;
}

.filter-button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Activities List */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
  position: relative;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.activity-item.running {
  border-left: 4px solid #10b981;
}

.activity-item.walking {
  border-left: 4px solid #3b82f6;
}

.activity-item.weight {
  border-left: 4px solid #8b5cf6;
}

.activity-icon {
  font-size: 24px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.activity-content {
  flex: 1;
  min-width: 0; /* För att text inte ska bryta layouten */
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.activity-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.activity-date {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.activity-time {
  color: #9ca3af;
  font-size: 12px;
}

.activity-details {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.activity-details span {
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.activity-notes {
  margin: 10px 0 0 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  color: #4b5563;
  font-style: italic;
  line-height: 1.5;
}

.delete-activity-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: all 0.3s;
  opacity: 0;
}

.activity-item:hover .delete-activity-button {
  opacity: 1;
}

.delete-activity-button:hover {
  color: #dc2626;
  background: #fee2e2;
}

/* Show More Button */
.show-more-container {
  text-align: center;
  margin-top: 30px;
}

.show-more-button {
  padding: 12px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.show-more-button:hover {
  background-color: #2563eb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .progress-view {
    padding: 15px;
  }

  .activity-type-selector {
    grid-template-columns: 1fr;
  }

  .type-button {
    padding: 15px 10px;
  }

  .activity-form-container {
    padding: 20px;
  }

  .activity-fields {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    height: 350px;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .history-stats {
    width: 100%;
    justify-content: space-between;
  }

  .activity-header {
    flex-direction: column;
  }

  .activity-meta {
    align-items: flex-start;
  }

  .delete-activity-button {
    opacity: 1; /* Visa alltid på mobil */
  }
}
</style>

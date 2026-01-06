<template>
  <div class="advanced-chart">
    <!-- Chart Header -->
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="chart-controls" v-if="data.length > 0">
        <button 
          v-for="period in timePeriods" 
          :key="period.value"
          @click="setTimePeriod(period.value)"
          :class="['period-btn', { 'active': selectedPeriod === period.value }]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>
    
    <!-- Chart Canvas -->
    <div class="chart-canvas-container" v-if="filteredData.length > 0">
      <canvas ref="chartRef"></canvas>
    </div>
    
    <!-- No Data Message -->
    <div v-else class="no-data-chart">
      <div class="no-data-content">
        <span class="no-data-icon">{{ icon }}</span>
        <p>Ingen data för vald period</p>
        <p class="hint">Ändra tidsperiod eller lägg till mer data</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { Chart } from 'chart.js/auto'

const props = defineProps({
  title: {
    type: String,
    default: 'Diagram'
  },
  data: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar'].includes(value)
  },
  icon: {
    type: String,
    default: '📊'
  },
  valueSuffix: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chart = null
const selectedPeriod = ref('all')

const timePeriods = [
  { value: 'week', label: '7 dagar' },
  { value: 'month', label: '30 dagar' },
  { value: 'quarter', label: '90 dagar' },
  { value: 'all', label: 'Alltid' }
]

// Filtrera data baserat på vald period
const filteredData = computed(() => {
  if (!props.data.length || selectedPeriod.value === 'all') {
    return props.data
  }
  
  const now = new Date()
  const cutoff = new Date()
  
  switch(selectedPeriod.value) {
    case 'week':
      cutoff.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoff.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoff.setMonth(now.getMonth() - 3)
      break
  }
  
  return props.data.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= cutoff
  })
})

// Skapa diagram
const createChart = () => {
  if (!chartRef.value || !filteredData.value.length) return
  
  // Förstör tidigare diagram
  if (chart) {
    chart.destroy()
  }
  
  const ctx = chartRef.value.getContext('2d')
  
  // Förbered data
  const labels = filteredData.value.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('sv-SE', { 
      day: 'numeric',
      month: 'short'
    })
  })
  
  const values = filteredData.value.map(item => item.value)
  
  // Välj färger baserat på typ
  let backgroundColor, borderColor, gradient
  if (props.type === 'line') {
    borderColor = '#3b82f6'
    gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)')
    backgroundColor = gradient
  } else {
    // Stapeldiagram - gradient för varje stapel
    backgroundColor = filteredData.value.map((_, index) => {
      const hue = 210 // Blå
      const opacity = 0.6 - (index * 0.4 / filteredData.value.length)
      return `hsla(${hue}, 100%, 60%, ${opacity})`
    })
    borderColor = '#3b82f6'
  }
  
  // Skapa diagram
  chart = new Chart(ctx, {
    type: props.type,
    data: {
      labels: labels,
      datasets: [{
        label: props.title,
        data: values,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: props.type === 'line' ? 3 : 1,
        fill: props.type === 'line',
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderRadius: props.type === 'bar' ? 4 : 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#3b82f6',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y}${props.valueSuffix}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#6b7280',
            maxRotation: 45
          }
        },
        y: {
          beginAtZero: props.type === 'bar',
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            color: '#6b7280',
            callback: (value) => {
              return `${value}${props.valueSuffix}`
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

// Statistiken
const getStats = () => {
  if (!filteredData.value.length) return []
  
  const sorted = [...filteredData.value].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  )
  
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const total = filteredData.value.reduce((sum, item) => sum + item.value, 0)
  const average = total / filteredData.value.length
  
  let stats = []
  
  // Olika statistik baserat på diagramtyp
  if (props.title.includes('Vikt')) {
    const change = last.value - first.value
    stats = [
      { label: 'Start', value: `${first.value}${props.valueSuffix}` },
      { label: 'Nu', value: `${last.value}${props.valueSuffix}` },
      { 
        label: 'Förändring', 
        value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}${props.valueSuffix}`,
        class: change >= 0 ? 'positive' : 'negative'
      }
    ]
  } else if (props.title.includes('Löpning')) {
    stats = [
      { label: 'Totalt', value: `${total.toFixed(1)}${props.valueSuffix}` },
      { label: 'Antal', value: `${filteredData.value.length} löpturer` },
      { label: 'Snitt', value: `${average.toFixed(1)}${props.valueSuffix}` }
    ]
  } else if (props.title.includes('Gång')) {
    const km = total / 1538
    stats = [
      { label: 'Totalt', value: `${total.toLocaleString()}${props.valueSuffix}` },
      { label: 'Antal', value: `${filteredData.value.length} dagar` },
      { label: '≈ Distans', value: `${km.toFixed(1)} km` }
    ]
  }
  
  return stats
}

// Ändra tidsperiod
const setTimePeriod = (period) => {
  selectedPeriod.value = period
}

// Watch för dataändringar
watch([filteredData, () => props.type], () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    createChart()
  })
})
</script>

<style scoped>
.advanced-chart {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.chart-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.period-btn {
  padding: 6px 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s;
}

.period-btn:hover {
  border-color: #d1d5db;
}

.period-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.chart-canvas-container {
  flex: 1;
  min-height: 200px;
  position: relative;
}

.no-data-chart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.no-data-content {
  text-align: center;
  color: #9ca3af;
}

.no-data-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
  opacity: 0.5;
}

.hint {
  font-size: 14px;
  color: #d1d5db;
  margin-top: 5px;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 10px;
  background: #f8fafc;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.stat-item .positive {
  color: #10b981;
}

.stat-item .negative {
  color: #ef4444;
}

@media (max-width: 768px) {
  .advanced-chart {
    padding: 20px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: center;
  }
  
  .chart-stats {
    grid-template-columns: 1fr;
  }
}
</style>
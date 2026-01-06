<template>
  <div class="simple-chart">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
    validator: (value) => ['line', 'bar', 'doughnut'].includes(value)
  },
  labelKey: {
    type: String,
    default: 'date'
  },
  valueKey: {
    type: String,
    default: 'value'
  }
})

const chartRef = ref(null)
let chart = null

const createChart = () => {
  if (!chartRef.value || !props.data.length) return
  
  // Förstör tidigare diagram
  if (chart) {
    chart.destroy()
  }
  
  const ctx = chartRef.value.getContext('2d')
  
  // Förbered data
  const labels = props.data.map(item => item[props.labelKey])
  const values = props.data.map(item => item[props.valueKey])
  
  // Välj färg baserat på diagramtyp
  let backgroundColor, borderColor
  switch(props.title.toLowerCase()) {
    case 'vikt': 
      backgroundColor = 'rgba(59, 130, 246, 0.2)'
      borderColor = '#3b82f6'
      break
    case 'löpning':
      backgroundColor = 'rgba(34, 197, 94, 0.2)'
      borderColor = '#22c55e'
      break
    case 'gång':
      backgroundColor = 'rgba(168, 85, 247, 0.2)'
      borderColor = '#a855f7'
      break
    default:
      backgroundColor = 'rgba(99, 102, 241, 0.2)'
      borderColor = '#6366f1'
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
        borderWidth: 3,
        fill: props.type === 'line',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  })
}

// Watch för dataändringar
watch(() => props.data, () => {
  createChart()
}, { deep: true })

// När komponenten laddas
onMounted(() => {
  createChart()
})
</script>

<style scoped>
.simple-chart {
  height: 250px;
  width: 100%;
}
</style>
<template>
  <div id="app">
    <!-- Navigation bar -->
    <Navbar />

    <!-- Router view - här visas dina sidor (Home, Events, Progress) -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/ui/Navbar.vue'
import Footer from '@/components/ui/Footer.vue'
</script>

<style>
/* Reset och grundläggande styling */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Ubuntu, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Responsiv design */
@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}
</style>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import AuthModal from './components/AuthModal.vue'
</script>

<template>
  <div class="min-h-screen min-w-0 flex flex-col justify-between">
    <div>
      <Navbar />
      <main class="mx-auto w-full min-w-0 max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- Application Footer with Secret Bendahara Access -->
    <Footer />

    <!-- Global Auth Modal for Bendahara Login -->
    <AuthModal />
  </div>
</template>

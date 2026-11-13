<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { GraduationCap, ChevronDown, Check, Sparkles } from 'lucide-vue-next'
import { useSemester } from '../composables/useSemester'

const { semesters, selectedSemester, selectedSemesterId, setSelectedSemester } = useSemester()
const isOpen = ref(false)
const dropdownRef = ref(null)

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectSemester(semester) {
  setSelectedSemester(semester._id)
  isOpen.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left min-w-0 max-w-full">
    <button
      type="button"
      class="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:border-emerald-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95 max-w-full min-w-0"
      :aria-expanded="isOpen"
      aria-haspopup="true"
      @click="toggleDropdown"
    >
      <div class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
        <GraduationCap class="h-3 w-3" />
      </div>

      <span class="max-w-[70px] min-[400px]:max-w-[100px] min-[520px]:max-w-[140px] sm:max-w-[180px] truncate text-slate-800 font-bold">
        {{ selectedSemester?.nama || 'Pilih Semester' }}
      </span>

      <!-- Status dot on mobile screens (< sm) -->
      <span 
        class="h-2 w-2 rounded-full shrink-0 sm:hidden" 
        :class="selectedSemester?.isAktif ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-400'"
        :title="selectedSemester?.isAktif ? 'Semester Aktif' : 'Semester Arsip'"
      ></span>

      <!-- Full status badge on sm+ screens -->
      <span
        class="hidden sm:inline-block rounded-full px-1.5 py-0.2 text-[10px] font-extrabold uppercase tracking-wider shrink-0"
        :class="selectedSemester?.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
      >
        {{ selectedSemester?.isAktif ? 'Aktif' : 'Arsip' }}
      </span>

      <ChevronDown
        class="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 sm:right-0 sm:left-auto z-40 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md focus:outline-none ring-1 ring-slate-900/5"
        role="menu"
      >
        <div class="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Pilih Semester</span>
          <Sparkles class="h-3 w-3 text-emerald-500" />
        </div>

        <div class="max-h-56 overflow-y-auto py-1 space-y-1">
          <button
            v-for="semester in semesters"
            :key="semester._id"
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors duration-150"
            :class="semester._id === selectedSemesterId 
              ? 'bg-emerald-50 text-emerald-900 font-bold' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
            role="menuitem"
            @click="selectSemester(semester)"
          >
            <div class="min-w-0 pr-2">
              <p class="truncate">{{ semester.nama }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[10px] text-slate-400 font-mono">{{ semester.kode }}</span>
                <span
                  class="rounded-full px-1.5 text-[9px] font-bold"
                  :class="semester.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                >
                  {{ semester.isAktif ? 'Aktif' : 'Arsip' }}
                </span>
              </div>
            </div>

            <Check
              v-if="semester._id === selectedSemesterId"
              class="h-4 w-4 shrink-0 text-emerald-600 font-black"
            />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

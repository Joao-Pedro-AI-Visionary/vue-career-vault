<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import SkillMatrixBar from '@/components/SkillMatrixBar.vue'
import JobMatcherWorkspace from '@/components/JobMatcherWorkspace.vue'
import SnippetVaultWorkspace from '@/components/SnippetVaultWorkspace.vue'

const store = useCareerVaultStore()
const activeTab = ref<'jobs' | 'snippets'>('jobs')

onMounted(() => {
  if (store.jobs.length === 0) {
    store.initialize()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#0B0F17] text-[#F8FAFC]">
    <!-- Top Telemetry Header -->
    <header class="border-b border-slate-800/80 bg-[#111827]/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 font-mono-tech text-sm font-bold text-amber-400">
            CV
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono-tech text-xs font-bold tracking-wider text-amber-400">
                CAREER_VAULT // VUE 3.5 + PINIA
              </span>
              <span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono-tech text-[10px] text-emerald-300">
                LOCAL-FIRST
              </span>
            </div>
            <h1 class="font-display text-lg font-bold text-slate-100">
              Precision Job Skill Matcher & Technical Snippet Vault
            </h1>
          </div>
        </div>

        <!-- Navigation & Global Telemetry -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs">
            <span class="text-slate-400">Média de Match: </span>
            <span class="font-mono-tech font-bold text-emerald-400">{{ store.averageMatchScore }}%</span>
          </div>

          <nav class="flex rounded-lg border border-slate-800 bg-slate-950 p-1" aria-label="Navegação Principal">
            <button
              type="button"
              data-testid="nav-tab-jobs"
              class="min-h-[44px] rounded-md px-4 py-1.5 text-xs font-semibold transition"
              :class="
                activeTab === 'jobs'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              "
              @click="activeTab = 'jobs'"
            >
              Analisador de Vagas ({{ store.jobs.length }})
            </button>
            <button
              type="button"
              data-testid="nav-tab-snippets"
              class="min-h-[44px] rounded-md px-4 py-1.5 text-xs font-semibold transition"
              :class="
                activeTab === 'snippets'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              "
              @click="activeTab = 'snippets'"
            >
              Cofre de Snippets ({{ store.snippets.length }})
            </button>
          </nav>

          <button
            type="button"
            class="min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600"
            @click="store.resetToDefaultSeed()"
          >
            Restaurar Demo
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <SkillMatrixBar />
      <JobMatcherWorkspace v-if="activeTab === 'jobs'" />
      <SnippetVaultWorkspace v-else />
    </main>
  </div>
</template>

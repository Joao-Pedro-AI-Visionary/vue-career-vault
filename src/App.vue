<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import SkillMatrixBar from '@/components/SkillMatrixBar.vue'
import JobMatcherWorkspace from '@/components/JobMatcherWorkspace.vue'
import SnippetVaultWorkspace from '@/components/SnippetVaultWorkspace.vue'

const store = useCareerVaultStore()
const activeTab = ref<'jobs' | 'snippets'>('jobs')
const showBackupDrawer = ref(false)
const backupJsonText = ref('')
const backupError = ref('')
const backupSuccess = ref('')

onMounted(() => {
  if (store.jobs.length === 0) {
    store.initialize()
  }
})

function openBackupPanel() {
  showBackupDrawer.value = !showBackupDrawer.value
  backupError.value = ''
  backupSuccess.value = ''
  if (showBackupDrawer.value) {
    backupJsonText.value = store.exportBackupJson()
  }
}

function handleImportBackup() {
  backupError.value = ''
  backupSuccess.value = ''
  try {
    store.importBackupJson(backupJsonText.value)
    backupSuccess.value = 'Backup JSON validado e importado com sucesso!'
  } catch (err) {
    backupError.value = err instanceof Error ? err.message : 'Falha ao validar backup JSON.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0B0F17] text-[#F8FAFC]">
    <!-- Top Telemetry Header -->
    <header class="border-b border-slate-800/80 bg-[#111827]/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 font-mono-tech text-sm font-bold text-amber-400">
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
          <div class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs">
            <span class="text-slate-400">Média de Match: </span>
            <span class="font-mono-tech font-bold text-emerald-400">{{ store.averageMatchScore }}%</span>
          </div>

          <nav class="flex rounded-lg border border-slate-800 bg-slate-950 p-1" aria-label="Navegação Principal">
            <button
              type="button"
              data-testid="nav-tab-jobs"
              class="min-h-[48px] rounded-md px-4 py-1.5 text-xs font-semibold transition"
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
              class="min-h-[48px] rounded-md px-4 py-1.5 text-xs font-semibold transition"
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
            data-testid="open-backup-btn"
            class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400"
            @click="openBackupPanel"
          >
            Backup JSON
          </button>

          <button
            type="button"
            data-testid="reset-demo-btn"
            class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-300 hover:border-slate-600"
            @click="store.resetToDefaultSeed()"
          >
            Restaurar Demo
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <!-- Backup Export/Import Drawer -->
      <section
        v-if="showBackupDrawer"
        data-testid="backup-drawer"
        class="space-y-3 rounded-xl border border-amber-500/40 bg-[#111827] p-5"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-display text-base font-semibold text-amber-300">
            Exportar / Importar Snapshot JSON (Validação de Schema v1)
          </h2>
          <button
            type="button"
            class="text-xs text-slate-400 hover:text-slate-200"
            @click="showBackupDrawer = false"
          >
            Fechar
          </button>
        </div>
        <p
          v-if="backupError"
          data-testid="backup-error-alert"
          role="alert"
          class="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-200"
        >
          {{ backupError }}
        </p>
        <p
          v-if="backupSuccess"
          data-testid="backup-success-alert"
          class="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-200"
        >
          {{ backupSuccess }}
        </p>
        <textarea
          v-model="backupJsonText"
          data-testid="backup-json-textarea"
          rows="5"
          class="font-mono-tech w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200"
        ></textarea>
        <div class="flex gap-3">
          <button
            type="button"
            data-testid="import-backup-submit"
            class="min-h-[48px] rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
            @click="handleImportBackup"
          >
            Validar e Importar JSON
          </button>
        </div>
      </section>

      <SkillMatrixBar />
      <JobMatcherWorkspace v-if="activeTab === 'jobs'" />
      <SnippetVaultWorkspace v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import type { ApplicationStatus, JobRoleLevel, WorkMode } from '@/domain/contracts'

const store = useCareerVaultStore()

const showNewJobForm = ref(false)
const title = ref('')
const company = ref('')
const level = ref<JobRoleLevel>('Pleno')
const workMode = ref<WorkMode>('remote')
const requiredInput = ref('')
const bonusInput = ref('')
const notes = ref('')

const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Mapeada',
  applied: 'Candidatura Enviada',
  interview: 'Entrevista Técnica',
  technical_test: 'Teste Técnico',
  offer: 'Proposta Recebida'
}

function handleCreateJob() {
  if (!title.value.trim() || !company.value.trim()) return

  const requiredSkills = requiredInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const bonusSkills = bonusInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  store.addJob({
    title: title.value.trim(),
    company: company.value.trim(),
    level: level.value,
    workMode: workMode.value,
    status: 'saved',
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['Vue 3'],
    bonusSkills,
    notes: notes.value.trim()
  })

  title.value = ''
  company.value = ''
  requiredInput.value = ''
  bonusInput.value = ''
  notes.value = ''
  showNewJobForm.value = false
}
</script>

<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- Left Column: Job Opportunities Pipeline -->
    <aside class="space-y-4 lg:col-span-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-mono-tech text-xs text-slate-400 uppercase">Pipeline de Vagas</p>
          <h3 class="font-display text-lg font-semibold text-slate-100">
            Vagas Analisadas ({{ store.jobs.length }})
          </h3>
        </div>
        <button
          type="button"
          data-testid="open-new-job-form"
          class="min-h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-400"
          @click="showNewJobForm = !showNewJobForm"
        >
          {{ showNewJobForm ? 'Fechar Formulário' : '+ Nova Vaga' }}
        </button>
      </div>

      <!-- New Job Form -->
      <form
        v-if="showNewJobForm"
        data-testid="submit-new-job"
        class="space-y-3 rounded-xl border border-amber-500/40 bg-slate-900/95 p-4 shadow-xl"
        @submit.prevent="handleCreateJob"
      >
        <p class="font-mono-tech text-xs font-semibold text-amber-400 uppercase">
          Cadastrar Vaga para Análise de Match
        </p>
        <div>
          <label class="block text-xs text-slate-300">Título da Vaga</label>
          <input
            v-model="title"
            data-testid="input-job-title"
            type="text"
            required
            placeholder="Ex: Desenvolvedor Fullstack Pleno PHP/Vue"
            class="mt-1 min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-slate-300">Empresa</label>
            <input
              v-model="company"
              data-testid="input-job-company"
              type="text"
              required
              placeholder="Nome da empresa"
              class="mt-1 min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-300">Senioridade</label>
            <select
              v-model="level"
              class="mt-1 min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Jr">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sr">Sênior</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-slate-300">Skills Obrigatórias (separadas por vírgula)</label>
          <input
            v-model="requiredInput"
            data-testid="input-job-required"
            type="text"
            placeholder="PHP 8.3, Laravel 12, Vue 3, MySQL"
            class="mt-1 min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300">Skills Diferenciais / Bônus (separadas por vírgula)</label>
          <input
            v-model="bonusInput"
            data-testid="input-job-bonus"
            type="text"
            placeholder="Docker, TypeScript, Pest"
            class="mt-1 min-h-[44px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300">Notas da Vaga / Teste Técnico</label>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="Observações sobre arquitetura ou etapas..."
            class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          ></textarea>
        </div>
        <button
          type="submit"
          class="min-h-[44px] w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          Salvar e Calcular Match
        </button>
      </form>

      <!-- Job Cards List -->
      <div class="space-y-3">
        <article
          v-for="{ job, analysis } in store.jobsWithScores"
          :key="job.id"
          class="cursor-pointer rounded-xl border p-4 transition"
          :class="
            store.selectedJob?.id === job.id
              ? 'border-amber-500/70 bg-slate-900 shadow-lg ring-1 ring-amber-500/30'
              : 'border-slate-800/80 bg-[#111827]/70 hover:border-slate-700'
          "
          @click="store.selectedJobId = job.id"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <span
                class="font-mono-tech inline-block rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
              >
                {{ job.company }} · {{ job.level }} · {{ job.workMode }}
              </span>
              <h4 class="font-display mt-1.5 text-base font-semibold text-slate-100">
                {{ job.title }}
              </h4>
            </div>
            <div class="text-right">
              <span
                class="font-mono-tech inline-block rounded-lg px-2.5 py-1 text-sm font-bold"
                :class="
                  analysis.overallScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : analysis.overallScore >= 60
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                "
              >
                {{ analysis.overallScore }}%
              </span>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Status: {{ statusLabels[job.status] }}</span>
            <span>{{ analysis.matchedRequired.length }}/{{ job.requiredSkills.length }} obrigatórias</span>
          </div>
        </article>
      </div>
    </aside>

    <!-- Right Column: Signature Skill Coverage Telemetry -->
    <section
      v-if="store.selectedJob && store.selectedJobAnalysis"
      class="space-y-6 rounded-xl border border-slate-800 bg-[#111827] p-6 lg:col-span-7"
    >
      <div class="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono-tech rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
              {{ store.selectedJobAnalysis.readinessLabel }}
            </span>
            <span class="font-mono-tech text-xs text-slate-400">
              ID: {{ store.selectedJob.id }}
            </span>
          </div>
          <h2 class="font-display mt-2 text-2xl font-bold text-slate-50">
            {{ store.selectedJob.title }}
          </h2>
          <p class="text-sm text-slate-400">
            {{ store.selectedJob.company }} — Nível {{ store.selectedJob.level }}
          </p>
        </div>

        <div class="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/90 px-5 py-3">
          <div>
            <p class="font-mono-tech text-[11px] text-slate-400 uppercase">Aderência Total</p>
            <p
              data-testid="overall-match-score"
              class="font-mono-tech text-3xl font-bold"
              :class="
                store.selectedJobAnalysis.overallScore >= 80
                  ? 'text-emerald-400'
                  : store.selectedJobAnalysis.overallScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
              "
            >
              {{ store.selectedJobAnalysis.overallScore }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Decomposed Progress Bars (75% Required / 25% Bonus) -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-800/90 bg-slate-900/60 p-4">
          <div class="flex justify-between text-xs">
            <span class="font-mono-tech text-slate-300 uppercase">Requisitos Obrigatórios (Peso 75%)</span>
            <span class="font-mono-tech font-semibold text-emerald-400">
              {{ store.selectedJobAnalysis.requiredScore }}%
            </span>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              class="h-full bg-emerald-500 transition-all duration-200"
              :style="{ width: `${store.selectedJobAnalysis.requiredScore}%` }"
            ></div>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="skill in store.selectedJobAnalysis.matchedRequired"
              :key="skill"
              class="rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-200"
            >
              ✓ {{ skill }}
            </span>
            <span
              v-for="skill in store.selectedJobAnalysis.missingRequired"
              :key="skill"
              class="rounded border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-xs text-rose-200"
            >
              ✗ {{ skill }}
            </span>
          </div>
        </div>

        <div class="rounded-lg border border-slate-800/90 bg-slate-900/60 p-4">
          <div class="flex justify-between text-xs">
            <span class="font-mono-tech text-slate-300 uppercase">Diferenciais Competitivos (Peso 25%)</span>
            <span class="font-mono-tech font-semibold text-amber-400">
              {{ store.selectedJobAnalysis.bonusScore }}%
            </span>
          </div>
          <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              class="h-full bg-amber-500 transition-all duration-200"
              :style="{ width: `${store.selectedJobAnalysis.bonusScore}%` }"
            ></div>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="skill in store.selectedJobAnalysis.matchedBonus"
              :key="skill"
              class="rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200"
            >
              ★ {{ skill }}
            </span>
            <span
              v-for="skill in store.selectedJobAnalysis.missingBonus"
              :key="skill"
              class="rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300"
            >
              ○ {{ skill }}
            </span>
          </div>
        </div>
      </div>

      <!-- Prioritized Study Plan -->
      <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h3 class="font-mono-tech text-xs font-semibold tracking-wider text-slate-300 uppercase">
          Plano de Estudo Priorizado para Esta Vaga
        </h3>
        <p
          v-if="store.selectedJobAnalysis.studyPlan.length === 0"
          class="mt-2 text-sm text-emerald-300"
        >
          100% dos requisitos cobertos! Você está pronto para submeter o currículo e o teste técnico.
        </p>
        <ul v-else class="mt-3 space-y-2">
          <li
            v-for="item in store.selectedJobAnalysis.studyPlan"
            :key="item.skill"
            class="flex items-start justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/90 px-3.5 py-2.5 text-xs"
          >
            <div>
              <span class="font-semibold text-slate-100">{{ item.skill }}</span>
              <p class="mt-0.5 text-slate-400">{{ item.reason }}</p>
            </div>
            <span
              class="font-mono-tech shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase"
              :class="
                item.priority === 'high'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-amber-500/20 text-amber-300'
              "
            >
              {{ item.priority === 'high' ? 'Prioridade Alta' : 'Diferencial' }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Status & Notes Footer -->
      <div class="flex flex-col justify-between gap-4 border-t border-slate-800 pt-4 sm:flex-row sm:items-center">
        <div class="flex items-center gap-3">
          <label class="font-mono-tech text-xs text-slate-400">Estágio do Processo:</label>
          <select
            :value="store.selectedJob.status"
            aria-label="Estágio da candidatura"
            class="min-h-[44px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100"
            @change="
              store.updateJobStatus(
                store.selectedJob.id,
                ($event.target as HTMLSelectElement).value as ApplicationStatus
              )
            "
          >
            <option value="saved">Mapeada</option>
            <option value="applied">Candidatura Enviada</option>
            <option value="interview">Entrevista Técnica</option>
            <option value="technical_test">Teste Técnico</option>
            <option value="offer">Proposta Recebida</option>
          </select>
        </div>
        <p class="text-xs text-slate-400 italic">
          {{ store.selectedJob.notes }}
        </p>
      </div>
    </section>
  </div>
</template>

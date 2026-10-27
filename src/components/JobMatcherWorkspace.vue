<script setup lang="ts">
import { ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import type { ApplicationStatus, JobOpportunity, JobRoleLevel, WorkMode } from '@/domain/contracts'

const store = useCareerVaultStore()

const showJobForm = ref(false)
const editingJobId = ref<string | null>(null)
const title = ref('')
const company = ref('')
const level = ref<JobRoleLevel>('Pleno')
const workMode = ref<WorkMode>('remote')
const requiredInput = ref('')
const bonusInput = ref('')
const notes = ref('')
const jobError = ref('')

const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Mapeada',
  applied: 'Candidatura Enviada',
  interview: 'Entrevista Técnica',
  technical_test: 'Teste Técnico',
  offer: 'Proposta Recebida'
}

function parseFlexibleSkillList(raw: string): string[] {
  // Lei de Postel (16) & Lei de Tesler (15): Aceita vírgula, ponto-e-vírgula, pipe ou quebra de linha
  return raw
    .split(/[,;|\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function openCreateForm() {
  editingJobId.value = null
  title.value = ''
  company.value = ''
  level.value = 'Pleno'
  workMode.value = 'remote'
  requiredInput.value = ''
  bonusInput.value = ''
  notes.value = ''
  jobError.value = ''
  showJobForm.value = !showJobForm.value
}

function openEditForm(job: JobOpportunity) {
  editingJobId.value = job.id
  title.value = job.title
  company.value = job.company
  level.value = job.level
  workMode.value = job.workMode
  requiredInput.value = job.requiredSkills.join(', ')
  bonusInput.value = job.bonusSkills.join(', ')
  notes.value = job.notes
  jobError.value = ''
  showJobForm.value = true
}

function handleSaveJob() {
  jobError.value = ''
  const requiredSkills = parseFlexibleSkillList(requiredInput.value)
  const bonusSkills = parseFlexibleSkillList(bonusInput.value)

  try {
    if (editingJobId.value) {
      store.updateJob(editingJobId.value, {
        title: title.value,
        company: company.value,
        level: level.value,
        workMode: workMode.value,
        requiredSkills,
        bonusSkills,
        notes: notes.value.trim()
      })
    } else {
      store.addJob({
        title: title.value,
        company: company.value,
        level: level.value,
        workMode: workMode.value,
        status: 'saved',
        requiredSkills,
        bonusSkills,
        notes: notes.value.trim()
      })
    }

    title.value = ''
    company.value = ''
    requiredInput.value = ''
    bonusInput.value = ''
    notes.value = ''
    editingJobId.value = null
    showJobForm.value = false
  } catch (err) {
    jobError.value = err instanceof Error ? err.message : 'Erro ao salvar vaga.'
  }
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
          class="min-h-[48px] rounded-lg border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 focus:outline-none focus:ring-2 focus:ring-amber-400"
          @click="openCreateForm"
        >
          {{ showJobForm && !editingJobId ? 'Fechar Formulário' : '+ Nova Vaga' }}
        </button>
      </div>

      <!-- Create / Update Job Form -->
      <form
        v-if="showJobForm"
        data-testid="submit-new-job"
        class="space-y-3 rounded-xl border border-amber-500/40 bg-slate-900/95 p-4 shadow-xl"
        novalidate
        @submit.prevent="handleSaveJob"
      >
        <p class="font-mono-tech text-xs font-semibold text-amber-400 uppercase">
          {{ editingJobId ? 'Editar Vaga Selecionada' : 'Cadastrar Vaga para Análise de Match' }}
        </p>

        <p
          v-if="jobError"
          data-testid="job-error-alert"
          role="alert"
          class="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-200"
        >
          {{ jobError }}
        </p>

        <div>
          <label class="block text-xs text-slate-300">Título da Vaga</label>
          <input
            v-model="title"
            data-testid="input-job-title"
            type="text"
            placeholder="Ex: Desenvolvedor Fullstack Pleno PHP/Vue"
            class="mt-1 min-h-[48px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs text-slate-300">Empresa</label>
            <input
              v-model="company"
              data-testid="input-job-company"
              type="text"
              placeholder="Nome da empresa"
              class="mt-1 min-h-[48px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-300">Senioridade</label>
            <select
              v-model="level"
              data-testid="select-job-level"
              class="mt-1 min-h-[48px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="Jr">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sr">Sênior</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs text-slate-300">Skills Obrigatórias (vírgula ou ponto-e-vírgula)</label>
          <input
            v-model="requiredInput"
            data-testid="input-job-required"
            type="text"
            placeholder="PHP 8.3, Laravel 12, Vue 3, MySQL"
            class="mt-1 min-h-[48px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300">Skills Diferenciais / Bônus</label>
          <input
            v-model="bonusInput"
            data-testid="input-job-bonus"
            type="text"
            placeholder="Docker, TypeScript, Pest"
            class="mt-1 min-h-[48px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300">Notas da Vaga / Teste Técnico</label>
          <textarea
            v-model="notes"
            data-testid="input-job-notes"
            rows="2"
            placeholder="Observações sobre arquitetura ou etapas..."
            class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          ></textarea>
        </div>
        <button
          type="submit"
          data-testid="save-job-btn"
          class="min-h-[48px] w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          {{ editingJobId ? 'Atualizar Vaga' : 'Salvar e Calcular Match' }}
        </button>
      </form>

      <!-- Job Cards List -->
      <div class="space-y-3">
        <article
          v-for="{ job, analysis } in store.jobsWithScores"
          :key="job.id"
          :data-testid="`job-card-${job.id}`"
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
          <h2 data-testid="selected-job-title" class="font-display mt-2 text-2xl font-bold text-slate-50">
            {{ store.selectedJob.title }}
          </h2>
          <p class="text-sm text-slate-400">
            {{ store.selectedJob.company }} — Nível {{ store.selectedJob.level }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="rounded-xl border border-slate-800 bg-slate-950/90 px-5 py-3">
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
          <div class="flex flex-col gap-2">
            <button
              type="button"
              data-testid="edit-selected-job-btn"
              class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-amber-400"
              @click="openEditForm(store.selectedJob)"
            >
              Editar Vaga
            </button>
            <button
              type="button"
              data-testid="delete-selected-job-btn"
              class="min-h-[48px] rounded-lg border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25"
              @click="store.deleteJob(store.selectedJob.id)"
            >
              Excluir Vaga
            </button>
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

      <!-- Prioritized Study Plan (Efeito Zeigarnik 10 + Gradiente de Meta 11 + Regra do Pico-Fim 09) -->
      <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-mono-tech text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Plano de Estudo Priorizado (Progresso: {{ store.selectedJobAnalysis.matchedRequired.length }} de {{ store.selectedJob.requiredSkills.length }} obrigatórias)
          </h3>
        </div>
        <div
          v-if="store.selectedJobAnalysis.studyPlan.length === 0"
          class="mt-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-300"
        >
          ✓ 100% dos requisitos técnicos validados! Seu perfil está pronto para submissão imediata nesta vaga.
        </div>
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
            data-testid="select-job-status"
            :value="store.selectedJob.status"
            aria-label="Estágio da candidatura"
            class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-100"
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

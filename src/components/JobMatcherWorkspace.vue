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
          <p class="font-mono-tech text-xs font-semibold text-slate-500 uppercase">Pipeline de Vagas</p>
          <h3 class="font-display text-lg font-bold text-slate-900">
            Vagas Analisadas ({{ store.jobs.length }})
          </h3>
        </div>
        <button
          type="button"
          data-testid="open-new-job-form"
          class="min-h-[44px] rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          @click="openCreateForm"
        >
          {{ showJobForm && !editingJobId ? 'Fechar Formulário' : '+ Nova Vaga' }}
        </button>
      </div>

      <!-- Create / Update Job Form -->
      <form
        v-if="showJobForm"
        data-testid="submit-new-job"
        class="space-y-3.5 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm"
        novalidate
        @submit.prevent="handleSaveJob"
      >
        <p class="font-mono-tech text-xs font-bold text-indigo-700 uppercase">
          {{ editingJobId ? 'Editar Vaga Selecionada' : 'Cadastrar Vaga para Análise de Match' }}
        </p>

        <p
          v-if="jobError"
          data-testid="job-error-alert"
          role="alert"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700"
        >
          {{ jobError }}
        </p>

        <div>
          <label class="block text-xs font-semibold text-slate-700">Título da Vaga *</label>
          <input
            v-model="title"
            data-testid="input-job-title"
            type="text"
            placeholder="Ex: Desenvolvedor Fullstack Pleno PHP/Vue"
            class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Empresa *</label>
            <input
              v-model="company"
              data-testid="input-job-company"
              type="text"
              placeholder="Nome da empresa"
              class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700">Senioridade</label>
            <select
              v-model="level"
              data-testid="select-job-level"
              class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:border-indigo-600 shadow-2xs"
            >
              <option value="Jr">Júnior</option>
              <option value="Pleno">Pleno</option>
              <option value="Sr">Sênior</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700">Skills Obrigatórias (vírgula ou ponto-e-vírgula)</label>
          <input
            v-model="requiredInput"
            data-testid="input-job-required"
            type="text"
            placeholder="PHP 8.3, Laravel 12, Vue 3, MySQL"
            class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700">Skills Diferenciais / Bônus</label>
          <input
            v-model="bonusInput"
            data-testid="input-job-bonus"
            type="text"
            placeholder="Docker, TypeScript, Pest"
            class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700">Notas da Vaga / Teste Técnico</label>
          <textarea
            v-model="notes"
            data-testid="input-job-notes"
            rows="2"
            placeholder="Observações sobre arquitetura ou etapas..."
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          ></textarea>
        </div>
        <button
          type="submit"
          data-testid="save-job-btn"
          class="min-h-[48px] w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-xs"
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
          class="cursor-pointer rounded-2xl border p-4.5 transition"
          :class="
            store.selectedJob?.id === job.id
              ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
              : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
          "
          @click="store.selectedJobId = job.id"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <span
                class="font-mono-tech inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
              >
                {{ job.company }} · {{ job.level }} · {{ job.workMode }}
              </span>
              <h4 class="font-display mt-1.5 text-base font-bold text-slate-900">
                {{ job.title }}
              </h4>
            </div>
            <div class="text-right">
              <span
                class="font-mono-tech inline-block rounded-xl px-2.5 py-1 text-sm font-bold shadow-2xs"
                :class="
                  analysis.overallScore >= 80
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : analysis.overallScore >= 60
                      ? 'border border-amber-200 bg-amber-50 text-amber-700'
                      : 'border border-rose-200 bg-rose-50 text-rose-700'
                "
              >
                {{ analysis.overallScore }}%
              </span>
            </div>
          </div>

          <div class="mt-3.5 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
            <span class="font-medium">Status: <strong class="text-slate-800">{{ statusLabels[job.status] }}</strong></span>
            <div class="flex gap-2">
              <button
                type="button"
                :data-testid="`edit-job-btn-${job.id}`"
                class="font-semibold text-indigo-600 hover:text-indigo-800"
                @click.stop="openEditForm(job)"
              >
                Editar
              </button>
              <button
                type="button"
                :data-testid="`delete-job-btn-${job.id}`"
                class="font-semibold text-rose-600 hover:text-rose-800"
                @click.stop="store.deleteJob(job.id)"
              >
                Excluir
              </button>
            </div>
          </div>
        </article>
      </div>
    </aside>

    <!-- Right Column: Deep Analysis & Stage Advancement -->
    <section v-if="store.selectedJob" class="space-y-5 lg:col-span-7">
      <div class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 font-mono-tech text-xs font-bold text-indigo-700">
                {{ store.selectedJob.company }}
              </span>
              <span class="font-mono-tech text-xs text-slate-400">
                Modo {{ store.selectedJob.workMode }}
              </span>
            </div>
            <h2 data-testid="selected-job-title" class="font-display mt-1.5 text-xl font-bold text-slate-900">
              {{ store.selectedJob.title }}
            </h2>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex flex-col items-start sm:items-end">
              <span data-testid="overall-match-score" class="font-mono-tech text-2xl font-black text-indigo-600">
                {{ store.selectedJobAnalysis?.overallScore }}%
              </span>
              <span class="font-mono-tech text-[11px] font-semibold text-slate-500">Aderência Global</span>
            </div>
            <button
              type="button"
              data-testid="edit-selected-job-btn"
              class="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
              @click="openEditForm(store.selectedJob)"
            >
              Editar Vaga
            </button>
            <button
              type="button"
              data-testid="delete-selected-job-btn"
              class="min-h-[44px] rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
              @click="store.deleteJob(store.selectedJob.id)"
            >
              Excluir Vaga
            </button>
          </div>
        </div>

        <!-- Stage Pipeline Chips (Efeito Zeigarnik 10) -->
        <div class="mt-5 border-t border-slate-100 pt-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <label class="block font-mono-tech text-xs font-semibold text-slate-500 uppercase">
              Estágio no Processo Seletivo (Clique para avançar)
            </label>
            <select
              data-testid="select-job-status"
              :value="store.selectedJob.status"
              aria-label="Estágio da candidatura"
              class="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:bg-white focus:border-indigo-600 focus:outline-none"
              @change="
                store.updateJobStatus(
                  store.selectedJob.id,
                  ($event.target as HTMLSelectElement).value as ApplicationStatus
                )
              "
            >
              <option v-for="(label, st) in statusLabels" :key="st" :value="st">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="mt-2.5 flex flex-wrap gap-2">
            <button
              v-for="(label, st) in statusLabels"
              :key="st"
              type="button"
              :data-testid="`set-status-${st}`"
              class="min-h-[44px] rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shadow-2xs"
              :class="
                store.selectedJob.status === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
              "
              @click="store.updateJobStatus(store.selectedJob.id, st)"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <!-- Diagnostic Radar: Missing & Covered Skills -->
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-4">
          <div class="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <p class="font-mono-tech text-xs font-bold text-emerald-800 uppercase">
              Skills Cobertas ({{ store.selectedJobAnalysis?.matchedRequired.length }})
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="s in store.selectedJobAnalysis?.matchedRequired"
                :key="s"
                class="rounded-lg border border-emerald-200 bg-white px-2 py-0.5 font-mono-tech text-xs font-medium text-emerald-800 shadow-2xs"
              >
                ✓ {{ s }}
              </span>
            </div>
          </div>

          <div class="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
            <p class="font-mono-tech text-xs font-bold text-rose-800 uppercase">
              Gaps a Desenvolver ({{ store.selectedJobAnalysis?.missingRequired.length }})
            </p>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <span
                v-for="s in store.selectedJobAnalysis?.missingRequired"
                :key="s"
                class="rounded-lg border border-rose-200 bg-white px-2 py-0.5 font-mono-tech text-xs font-medium text-rose-800 shadow-2xs"
              >
                ! {{ s }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="store.selectedJob.notes" class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="font-mono-tech text-xs font-semibold text-slate-500 uppercase">Observações & Anotações de Entrevista</p>
          <p class="mt-1 text-sm text-slate-800 whitespace-pre-line">{{ store.selectedJob.notes }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import type { SkillCategory } from '@/domain/contracts'

const store = useCareerVaultStore()
const activeCategory = ref<SkillCategory | 'all'>('all')
const showAddSkill = ref(false)
const manageMode = ref(false)
const newSkillName = ref('')
const newSkillCategory = ref<SkillCategory>('backend')
const errorMsg = ref('')

// Lei de Miller (05): Chunking de categorias em até 6 grupos claros
const categories: Array<{ id: SkillCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'database', label: 'Database' },
  { id: 'testing', label: 'Testing' },
  { id: 'devops', label: 'DevOps & Arch' }
]

const visibleSkills = computed(() => {
  if (activeCategory.value === 'all') return store.skills
  if (activeCategory.value === 'devops') {
    return store.skills.filter((s) => s.category === 'devops' || s.category === 'architecture')
  }
  return store.skills.filter((s) => s.category === activeCategory.value)
})

const activeCount = computed(() => store.skills.filter((s) => s.active).length)

function handleAddSkill() {
  errorMsg.value = ''
  try {
    store.addSkill(newSkillName.value, newSkillCategory.value)
    newSkillName.value = ''
    showAddSkill.value = false
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Erro ao criar skill.'
  }
}
</script>

<template>
  <section
    aria-label="Matriz de Competências do Candidato"
    class="rounded-xl border border-slate-800/90 bg-[#111827]/90 p-5 shadow-lg"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
          <p class="font-mono-tech text-xs tracking-widest text-amber-400 uppercase">
            Perfil Técnico Ativo ({{ activeCount }}/{{ store.skills.length }} skills ativas)
          </p>
        </div>
        <h2 class="font-display mt-1 text-lg font-semibold text-slate-100">
          Ative ou desative suas skills para simular a aderência em menos de 100ms
        </h2>
      </div>

      <!-- Lei de Hick (02): Progressive Disclosure para adição e gestão de skills -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="toggle-skill-manage"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          @click="manageMode = !manageMode"
        >
          {{ manageMode ? 'Concluir Edição' : 'Gerenciar Skills' }}
        </button>
        <button
          type="button"
          data-testid="open-add-skill-btn"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
          @click="
            showAddSkill = !showAddSkill;
            errorMsg = '';
          "
        >
          {{ showAddSkill ? 'Fechar Campo' : '+ Adicionar Nova Skill' }}
        </button>
      </div>
    </div>

    <p
      v-if="errorMsg"
      data-testid="skill-error-alert"
      role="alert"
      class="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3.5 py-2 text-xs font-medium text-rose-200"
    >
      {{ errorMsg }}
    </p>

    <form
      v-if="showAddSkill"
      data-testid="add-skill-form"
      class="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 p-3"
      @submit.prevent="handleAddSkill"
    >
      <input
        v-model="newSkillName"
        data-testid="input-skill-name"
        type="text"
        placeholder="Nome da skill (ex: GraphQL)..."
        aria-label="Nome da nova skill"
        class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
      />
      <select
        v-model="newSkillCategory"
        data-testid="select-skill-category"
        aria-label="Categoria da skill"
        class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
      >
        <option value="frontend">Frontend</option>
        <option value="backend">Backend</option>
        <option value="database">Database</option>
        <option value="testing">Testing</option>
        <option value="devops">DevOps</option>
        <option value="architecture">Architecture</option>
      </select>
      <button
        type="submit"
        data-testid="submit-skill-btn"
        class="min-h-[48px] rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
      >
        Salvar Skill
      </button>
    </form>

    <!-- Lei de Miller (05): Chunking por categoria -->
    <div class="mt-4 flex flex-wrap gap-1.5 border-b border-slate-800/80 pb-3">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        :data-testid="`skill-cat-${cat.id}`"
        class="min-h-[40px] rounded-md px-3 py-1 text-xs font-medium transition"
        :class="
          activeCategory === cat.id
            ? 'bg-slate-800 text-amber-300'
            : 'text-slate-400 hover:text-slate-200'
        "
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Lei de Fitts (01): Alvos de toque de no mínimo 48px de altura -->
    <div class="mt-4 flex flex-wrap gap-2">
      <div
        v-for="skill in visibleSkills"
        :key="skill.id"
        class="inline-flex items-center gap-1"
      >
        <button
          type="button"
          :data-testid="`skill-toggle-${skill.name}`"
          :aria-pressed="skill.active"
          class="group inline-flex min-h-[48px] items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition duration-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          :class="
            skill.active
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          "
          @click="store.toggleSkill(skill.id)"
        >
          <span
            class="h-2 w-2 rounded-full transition"
            :class="skill.active ? 'bg-emerald-400' : 'bg-slate-600'"
          ></span>
          <span class="font-medium">{{ skill.name }}</span>
          <span class="font-mono-tech text-[10px] opacity-70">
            {{ skill.active ? 'ON' : 'OFF' }}
          </span>
        </button>

        <button
          v-if="manageMode"
          type="button"
          :data-testid="`delete-skill-${skill.name}`"
          aria-label="Remover skill"
          class="min-h-[48px] rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 text-xs font-bold text-rose-300 hover:bg-rose-500/30"
          @click="store.deleteSkill(skill.id)"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>

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
    class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
          <p class="font-mono-tech text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            Perfil Técnico Ativo ({{ activeCount }}/{{ store.skills.length }} skills ativas)
          </p>
        </div>
        <h2 class="font-display mt-1 text-lg font-bold text-slate-900">
          Ative ou desative suas skills para simular a aderência em tempo real
        </h2>
      </div>

      <!-- Lei de Hick (02): Progressive Disclosure para adição e gestão de skills -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="toggle-skill-manage"
          class="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:border-slate-300"
          @click="manageMode = !manageMode"
        >
          {{ manageMode ? 'Concluir Edição' : 'Gerenciar Skills' }}
        </button>
        <button
          type="button"
          data-testid="open-add-skill-btn"
          class="min-h-[48px] rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
      class="mt-3.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700"
    >
      {{ errorMsg }}
    </p>

    <form
      v-if="showAddSkill"
      data-testid="add-skill-form"
      class="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5"
      @submit.prevent="handleAddSkill"
    >
      <input
        v-model="newSkillName"
        data-testid="input-skill-name"
        type="text"
        placeholder="Nome da skill (ex: GraphQL)..."
        aria-label="Nome da nova skill"
        class="min-h-[48px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
      />
      <select
        v-model="newSkillCategory"
        data-testid="select-skill-category"
        aria-label="Categoria da skill"
        class="min-h-[48px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none shadow-xs"
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
        class="min-h-[48px] rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        Salvar Skill
      </button>
    </form>

    <!-- Lei de Miller (05): Chunking por categoria -->
    <div class="mt-4 flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        :data-testid="`skill-cat-${cat.id}`"
        class="min-h-[38px] rounded-lg px-3 py-1 text-xs font-semibold transition"
        :class="
          activeCategory === cat.id
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
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
        class="inline-flex items-center gap-1.5"
      >
        <button
          type="button"
          :data-testid="`skill-toggle-${skill.name}`"
          :aria-pressed="skill.active"
          class="group inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition duration-150 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :class="
            skill.active
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
          "
          @click="store.toggleSkill(skill.id)"
        >
          <span
            class="h-2 w-2 rounded-full transition"
            :class="skill.active ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'"
          ></span>
          <span>{{ skill.name }}</span>
          <span class="font-mono-tech text-[10px] font-bold opacity-60">
            {{ skill.active ? 'ON' : 'OFF' }}
          </span>
        </button>

        <button
          v-if="manageMode"
          type="button"
          :data-testid="`delete-skill-${skill.name}`"
          aria-label="Remover skill"
          class="min-h-[48px] rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
          @click="store.deleteSkill(skill.id)"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>

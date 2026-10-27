<script setup lang="ts">
import { ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import type { SkillCategory } from '@/domain/contracts'

const store = useCareerVaultStore()
const newSkillName = ref('')
const newSkillCategory = ref<SkillCategory>('backend')

function handleAddSkill() {
  if (!newSkillName.value.trim()) return
  store.addSkill(newSkillName.value, newSkillCategory.value)
  newSkillName.value = ''
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
            Perfil Técnico Ativo // Simulador em Tempo Real
          </p>
        </div>
        <h2 class="font-display mt-1 text-lg font-semibold text-slate-100">
          Clique nas suas skills para calibrar a aderência às vagas instantaneamente
        </h2>
      </div>

      <form class="flex flex-wrap items-center gap-2" @submit.prevent="handleAddSkill">
        <input
          v-model="newSkillName"
          type="text"
          placeholder="Adicionar skill (ex: GraphQL)..."
          aria-label="Nome da nova skill"
          class="min-h-[44px] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        />
        <select
          v-model="newSkillCategory"
          aria-label="Categoria da skill"
          class="min-h-[44px] rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
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
          class="min-h-[44px] rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          + Incluir Skill
        </button>
      </form>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="skill in store.skills"
        :key="skill.id"
        type="button"
        :data-testid="`skill-toggle-${skill.name}`"
        :aria-pressed="skill.active"
        class="group inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-400"
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
    </div>
  </section>
</template>

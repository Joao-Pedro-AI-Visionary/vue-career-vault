<script setup lang="ts">
import { ref } from 'vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import type { CodeSnippet, SnippetLanguage } from '@/domain/contracts'

const store = useCareerVaultStore()

const languages: Array<{ id: SnippetLanguage | 'all'; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'vue', label: 'Vue 3' },
  { id: 'laravel', label: 'Laravel' },
  { id: 'php', label: 'PHP 8.3' },
  { id: 'ts', label: 'TypeScript' },
  { id: 'sql', label: 'SQL' },
  { id: 'bash', label: 'Bash' }
]

const showSnippetForm = ref(false)
const editingSnippetId = ref<string | null>(null)
const newTitle = ref('')
const newLanguage = ref<SnippetLanguage>('vue')
const newTags = ref('')
const newSummary = ref('')
const newCode = ref('')
const snippetError = ref('')
const copiedId = ref<string | null>(null)

function openNewSnippetForm() {
  editingSnippetId.value = null
  newTitle.value = ''
  newLanguage.value = 'vue'
  newTags.value = ''
  newSummary.value = ''
  newCode.value = ''
  snippetError.value = ''
  showSnippetForm.value = !showSnippetForm.value
}

function openEditSnippet(snippet: CodeSnippet) {
  editingSnippetId.value = snippet.id
  newTitle.value = snippet.title
  newLanguage.value = snippet.language
  newTags.value = snippet.tags.join(', ')
  newSummary.value = snippet.summary
  newCode.value = snippet.code
  snippetError.value = ''
  showSnippetForm.value = true
}

function handleSaveSnippet() {
  snippetError.value = ''
  const tags = newTags.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  try {
    if (editingSnippetId.value) {
      store.updateSnippet(editingSnippetId.value, {
        title: newTitle.value,
        language: newLanguage.value,
        tags,
        summary: newSummary.value,
        code: newCode.value
      })
    } else {
      store.addSnippet({
        title: newTitle.value,
        language: newLanguage.value,
        tags,
        summary: newSummary.value,
        code: newCode.value,
        favorite: true
      })
    }
    newTitle.value = ''
    newTags.value = ''
    newSummary.value = ''
    newCode.value = ''
    editingSnippetId.value = null
    showSnippetForm.value = false
  } catch (err) {
    snippetError.value = err instanceof Error ? err.message : 'Erro ao salvar snippet.'
  }
}

async function copyCode(id: string, code: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(code)
  }
  copiedId.value = id
  setTimeout(() => {
    if (copiedId.value === id) copiedId.value = null
  }, 1500)
}
</script>

<template>
  <section class="space-y-6">
    <!-- Filter and Search Bar -->
    <div class="flex flex-col gap-4 rounded-xl border border-slate-800 bg-[#111827] p-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="lang in languages"
          :key="lang.id"
          type="button"
          :data-testid="`lang-filter-${lang.id}`"
          class="min-h-[48px] rounded-lg px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-400"
          :class="
            store.snippetLanguageFilter === lang.id
              ? 'bg-amber-500 text-slate-950'
              : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
          "
          @click="store.snippetLanguageFilter = lang.id"
        >
          {{ lang.label }}
        </button>

        <button
          type="button"
          data-testid="toggle-only-favorites"
          class="min-h-[48px] rounded-lg border px-3.5 py-2 text-xs font-semibold transition"
          :class="
            store.showOnlyFavorites
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-slate-800 bg-slate-900 text-slate-300'
          "
          @click="store.showOnlyFavorites = !store.showOnlyFavorites"
        >
          ★ Favoritos
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="store.snippetSearchQuery"
          data-testid="snippet-search-input"
          type="search"
          placeholder="Buscar por título, tag ou código..."
          aria-label="Buscar snippets"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:border-amber-400 focus:outline-none"
        />
        <button
          type="button"
          data-testid="open-new-snippet-btn"
          class="min-h-[48px] rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
          @click="openNewSnippetForm"
        >
          {{ showSnippetForm && !editingSnippetId ? 'Cancelar' : '+ Novo Snippet' }}
        </button>
      </div>
    </div>

    <!-- Add / Edit Snippet Form -->
    <form
      v-if="showSnippetForm"
      data-testid="snippet-form"
      class="space-y-3 rounded-xl border border-amber-500/40 bg-slate-900 p-5"
      novalidate
      @submit.prevent="handleSaveSnippet"
    >
      <h3 class="font-display text-base font-semibold text-amber-300">
        {{ editingSnippetId ? 'Editar Snippet Técnico' : 'Salvar Padrão Técnico no Cofre' }}
      </h3>
      <p
        v-if="snippetError"
        data-testid="snippet-error-alert"
        role="alert"
        class="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-medium text-rose-200"
      >
        {{ snippetError }}
      </p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          v-model="newTitle"
          data-testid="input-snippet-title"
          type="text"
          placeholder="Título do snippet"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 sm:col-span-2"
        />
        <select
          v-model="newLanguage"
          data-testid="select-snippet-language"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        >
          <option value="vue">Vue 3</option>
          <option value="laravel">Laravel</option>
          <option value="php">PHP 8.3</option>
          <option value="ts">TypeScript</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
        </select>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          v-model="newSummary"
          data-testid="input-snippet-summary"
          type="text"
          placeholder="Explicação curta de quando usar este padrão"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        />
        <input
          v-model="newTags"
          data-testid="input-snippet-tags"
          type="text"
          placeholder="Tags separadas por vírgula (ex: pinia, tdd)"
          class="min-h-[48px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        />
      </div>
      <textarea
        v-model="newCode"
        data-testid="input-snippet-code"
        rows="5"
        placeholder="Cole o bloco de código aqui..."
        class="font-mono-tech w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100"
      ></textarea>
      <button
        type="submit"
        data-testid="save-snippet-btn"
        class="min-h-[48px] rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
      >
        {{ editingSnippetId ? 'Atualizar Snippet' : 'Salvar no Cofre' }}
      </button>
    </form>

    <!-- Snippets Grid -->
    <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <article
        v-for="snippet in store.filteredSnippets"
        :key="snippet.id"
        :data-testid="`snippet-card-${snippet.id}`"
        class="flex flex-col justify-between rounded-xl border border-slate-800 bg-[#111827] p-5 shadow-md"
      >
        <div>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="font-mono-tech rounded bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 uppercase">
              {{ snippet.language }}
            </span>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                :data-testid="`fav-snippet-${snippet.id}`"
                class="min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs"
                :class="snippet.favorite ? 'text-amber-400' : 'text-slate-500'"
                @click="store.toggleSnippetFavorite(snippet.id)"
              >
                {{ snippet.favorite ? '★ Favorito' : '☆ Favoritar' }}
              </button>
              <button
                type="button"
                :data-testid="`edit-snippet-${snippet.id}`"
                class="min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-400"
                @click="openEditSnippet(snippet)"
              >
                Editar
              </button>
              <button
                type="button"
                :data-testid="`delete-snippet-${snippet.id}`"
                class="min-h-[48px] rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/25"
                @click="store.deleteSnippet(snippet.id)"
              >
                Excluir
              </button>
              <button
                type="button"
                class="min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700"
                @click="copyCode(snippet.id, snippet.code)"
              >
                {{ copiedId === snippet.id ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
          </div>

          <h4 class="font-display mt-2 text-lg font-semibold text-slate-100">
            {{ snippet.title }}
          </h4>
          <p class="mt-1 text-xs text-slate-400">
            {{ snippet.summary }}
          </p>

          <pre class="font-mono-tech mt-3 overflow-x-auto rounded-lg border border-slate-800/90 bg-slate-950 p-3.5 text-xs leading-relaxed text-slate-200"><code>{{ snippet.code }}</code></pre>
        </div>

        <div class="mt-4 flex flex-wrap gap-1.5 pt-2">
          <span
            v-for="tag in snippet.tags"
            :key="tag"
            class="font-mono-tech rounded bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400"
          >
            #{{ tag }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

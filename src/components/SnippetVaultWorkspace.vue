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
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="lang in languages"
          :key="lang.id"
          type="button"
          :data-testid="`lang-filter-${lang.id}`"
          class="min-h-[44px] rounded-xl px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
          :class="
            store.snippetLanguageFilter === lang.id
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
          "
          @click="store.snippetLanguageFilter = lang.id"
        >
          {{ lang.label }}
        </button>

        <button
          type="button"
          data-testid="toggle-only-favorites"
          class="min-h-[44px] rounded-xl border px-3.5 py-2 text-xs font-semibold transition"
          :class="
            store.showOnlyFavorites
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          "
          @click="store.showOnlyFavorites = !store.showOnlyFavorites"
        >
          ★ Favoritos
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="store.snippetSearchQuery"
          data-testid="snippet-search-input"
          type="search"
          placeholder="Buscar por título, tag ou código..."
          aria-label="Buscar snippets"
          class="min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
        />

        <button
          type="button"
          data-testid="open-new-snippet-btn"
          class="min-h-[44px] rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          @click="openNewSnippetForm"
        >
          {{ showSnippetForm && !editingSnippetId ? 'Fechar Formulário' : '+ Novo Snippet' }}
        </button>
      </div>
    </div>

    <!-- Create / Edit Snippet Form -->
    <form
      v-if="showSnippetForm"
      data-testid="submit-new-snippet"
      class="space-y-3.5 rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm"
      @submit.prevent="handleSaveSnippet"
    >
      <p class="font-mono-tech text-xs font-bold text-indigo-700 uppercase">
        {{ editingSnippetId ? 'Editar Snippet' : 'Cadastrar Novo Snippet para Testes Técnicos' }}
      </p>

      <p
        v-if="snippetError"
        data-testid="snippet-error-alert"
        role="alert"
        class="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700"
      >
        {{ snippetError }}
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700">Título do Snippet *</label>
          <input
            v-model="newTitle"
            data-testid="input-snippet-title"
            type="text"
            placeholder="Ex: Laravel Custom Cast para JSON Monad"
            class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700">Linguagem / Stack</label>
          <select
            v-model="newLanguage"
            data-testid="select-snippet-language"
            class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-indigo-600 shadow-2xs"
          >
            <option value="vue">Vue 3</option>
            <option value="laravel">Laravel</option>
            <option value="php">PHP 8.3</option>
            <option value="ts">TypeScript</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700">Tags (separadas por vírgula)</label>
        <input
          v-model="newTags"
          data-testid="input-snippet-tags"
          type="text"
          placeholder="eloquent, cache, redis, performance"
          class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700">Resumo Técnico</label>
        <input
          v-model="newSummary"
          data-testid="input-snippet-summary"
          type="text"
          placeholder="Explicação do trade-off arquitetural..."
          class="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700">Código-Fonte *</label>
        <textarea
          v-model="newCode"
          data-testid="input-snippet-code"
          rows="6"
          placeholder="Cole aqui o código de produção..."
          class="font-mono-tech mt-1 w-full rounded-xl border border-slate-800 bg-[#0F172A] p-3 text-xs text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <button
        type="submit"
        data-testid="save-snippet-btn"
        class="min-h-[48px] rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 shadow-xs"
      >
        {{ editingSnippetId ? 'Atualizar Snippet' : 'Salvar no Cofre' }}
      </button>
    </form>

    <!-- Snippets Grid -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article
        v-for="snippet in store.filteredSnippets"
        :key="snippet.id"
        :data-testid="`snippet-card-${snippet.id}`"
        class="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition"
      >
        <div>
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 font-mono-tech text-[11px] font-bold text-indigo-700">
                {{ snippet.language.toUpperCase() }}
              </span>
              <h4
                :data-testid="`snippet-title-${snippet.id}`"
                class="font-display text-sm font-bold text-slate-900"
              >
                {{ snippet.title }}
              </h4>
            </div>

            <button
              type="button"
              class="text-xs transition"
              :class="snippet.favorite ? 'text-amber-500 font-bold' : 'text-slate-300'"
              @click="store.toggleSnippetFavorite(snippet.id)"
            >
              ★
            </button>
          </div>

          <p class="mt-2 text-xs text-slate-600">{{ snippet.summary }}</p>

          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="tag in snippet.tags"
              :key="tag"
              class="rounded-md bg-slate-100 px-2 py-0.5 font-mono-tech text-[10px] font-medium text-slate-600"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Code Display: Sleek Obsidian Editor against White Card -->
          <pre class="font-mono-tech mt-3.5 max-h-56 overflow-x-auto rounded-xl border border-slate-900 bg-[#0F172A] p-3 text-[11px] text-slate-200"><code>{{ snippet.code }}</code></pre>
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <button
            type="button"
            :data-testid="`copy-snippet-btn-${snippet.id}`"
            class="min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            @click="copyCode(snippet.id, snippet.code)"
          >
            {{ copiedId === snippet.id ? '✓ Copiado!' : 'Copiar Código' }}
          </button>

          <div class="flex gap-2">
            <button
              type="button"
              :data-testid="`edit-snippet-btn-${snippet.id}`"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              @click="openEditSnippet(snippet)"
            >
              Editar
            </button>
            <button
              type="button"
              :data-testid="`delete-snippet-btn-${snippet.id}`"
              class="text-xs font-semibold text-rose-600 hover:text-rose-800"
              @click="store.deleteSnippet(snippet.id)"
            >
              Excluir
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

import type { VaultStateSnapshot } from '@/domain/contracts'

export function createDefaultVaultSnapshot(): VaultStateSnapshot {
  return {
    version: 1,
    exportedAt: '2026-10-27T12:00:00.000Z',
    skills: [
      { id: 'sk-1', name: 'Vue 3', category: 'frontend', proficiency: 5, active: true },
      { id: 'sk-2', name: 'TypeScript', category: 'frontend', proficiency: 4, active: true },
      { id: 'sk-3', name: 'Pinia', category: 'frontend', proficiency: 5, active: true },
      { id: 'sk-4', name: 'Tailwind CSS', category: 'frontend', proficiency: 5, active: true },
      { id: 'sk-5', name: 'PHP 8.3', category: 'backend', proficiency: 4, active: true },
      { id: 'sk-6', name: 'Laravel 12', category: 'backend', proficiency: 4, active: true },
      { id: 'sk-7', name: 'REST API', category: 'backend', proficiency: 5, active: true },
      { id: 'sk-8', name: 'MySQL', category: 'database', proficiency: 4, active: true },
      { id: 'sk-9', name: 'PostgreSQL', category: 'database', proficiency: 4, active: true },
      { id: 'sk-10', name: 'Redis & Queues', category: 'backend', proficiency: 3, active: true },
      { id: 'sk-11', name: 'Vitest', category: 'testing', proficiency: 4, active: true },
      { id: 'sk-12', name: 'Pest', category: 'testing', proficiency: 4, active: true },
      { id: 'sk-13', name: 'Docker', category: 'devops', proficiency: 3, active: false },
      { id: 'sk-14', name: 'Inertia.js', category: 'architecture', proficiency: 3, active: false }
    ],
    jobs: [
      {
        id: 'job-laravel-vue-pleno',
        title: 'Desenvolvedor(a) Fullstack Pleno — Laravel & Vue 3',
        company: 'Empresa Alvo (SaaS B2B)',
        level: 'Pleno',
        workMode: 'remote',
        status: 'technical_test',
        requiredSkills: ['PHP 8.3', 'Laravel 12', 'Vue 3', 'Pinia', 'MySQL', 'REST API'],
        bonusSkills: ['TypeScript', 'Redis & Queues', 'Docker', 'Pest'],
        notes: 'Foco em arquitetura limpa, FormRequests, Jobs assíncronos no Laravel e Composition API tipada no Vue 3.',
        createdAt: '2026-10-27T10:00:00.000Z'
      },
      {
        id: 'job-frontend-specialist',
        title: 'Engenheiro(a) Frontend Vue 3 Pleno',
        company: 'FinTech Studio',
        level: 'Pleno',
        workMode: 'hybrid',
        status: 'interview',
        requiredSkills: ['Vue 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Vitest'],
        bonusSkills: ['Inertia.js', 'Docker'],
        notes: 'Entrevista técnica focada em reatividade fina, performance de listas densas e testes com Vue Test Utils.',
        createdAt: '2026-10-26T15:30:00.000Z'
      },
      {
        id: 'job-backend-laravel',
        title: 'Backend Developer Pleno (Laravel API & Filas)',
        company: 'LogiCloud Brasil',
        level: 'Pleno',
        workMode: 'remote',
        status: 'applied',
        requiredSkills: ['PHP 8.3', 'Laravel 12', 'PostgreSQL', 'Redis & Queues', 'REST API'],
        bonusSkills: ['Docker', 'Pest'],
        notes: 'Forte exigência de idempotência em webhooks, Horizon/Queues e transações de banco.',
        createdAt: '2026-10-25T09:15:00.000Z'
      }
    ],
    snippets: [
      {
        id: 'snip-1',
        title: 'Composable useDebouncedRef com limpeza automática',
        language: 'vue',
        tags: ['reactivity', 'composable', 'performance'],
        summary: 'Evita chamadas excessivas em filtros de busca sincronizados com a URL no Vue 3.',
        favorite: true,
        updatedAt: '2026-10-27T11:00:00.000Z',
        code: `import { customRef } from 'vue'

export function useDebouncedRef<T>(initialValue: T, delayMs = 200) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return customRef<T>((track, trigger) => ({
    get() {
      track()
      return initialValue
    },
    set(newValue: T) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        initialValue = newValue
        trigger()
      }, delayMs)
    }
  }))
}`
      },
      {
        id: 'snip-2',
        title: 'Transação Idempotente + Dispatch de Job Pós-Commit no Laravel 12',
        language: 'laravel',
        tags: ['transactions', 'queues', 'idempotency'],
        summary: 'Garante que o Job na fila só enxergue os registros após o commit efetivo da transação SQL.',
        favorite: true,
        updatedAt: '2026-10-27T11:10:00.000Z',
        code: `use Illuminate\\Support\\Facades\\DB;

DB::transaction(function () use ($dto) {
    $transaction = Transaction::query()->firstOrCreate(
        ['external_hash' => $dto->externalHash],
        $dto->toArray()
    );

    ProcessStatementWebhookJob::dispatch($transaction->id)->afterCommit();
});`
      },
      {
        id: 'snip-3',
        title: 'Pinia Setup Store com Injeção de StoragePort para TDD',
        language: 'ts',
        tags: ['pinia', 'tdd', 'clean-architecture'],
        summary: 'Desacopla o estado reativo do browser storage, permitindo testes determinísticos em < 5ms.',
        favorite: true,
        updatedAt: '2026-10-27T11:20:00.000Z',
        code: `export const useVaultStore = defineStore('vault', () => {
  const items = ref<Item[]>([])
  function hydrate(adapter: StoragePort) {
    items.value = adapter.load() ?? []
  }
  return { items, hydrate }
})`
      },
      {
        id: 'snip-4',
        title: 'Query SQL Agregada por Categoria com Window Function',
        language: 'sql',
        tags: ['sql', 'analytics', 'performance'],
        summary: 'Calcula total gasto por categoria e percentual sobre o orçamento total em uma única passagem.',
        favorite: false,
        updatedAt: '2026-10-27T11:30:00.000Z',
        code: `SELECT
  category,
  SUM(amount_cents) AS total_cents,
  ROUND(100.0 * SUM(amount_cents) / SUM(SUM(amount_cents)) OVER (), 2) AS share_pct
FROM transactions
WHERE type = 'expense'
GROUP BY category
ORDER BY total_cents DESC;`
      }
    ]
  }
}

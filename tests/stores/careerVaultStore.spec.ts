import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import { InMemoryVaultAdapter } from '@/infrastructure/storageAdapter'

describe('useCareerVaultStore (TDD)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hydrates with default seed when storage is empty and computes selected job match (CA-03)', () => {
    const adapter = new InMemoryVaultAdapter()
    const store = useCareerVaultStore()
    store.initialize(adapter)

    expect(store.skills.length).toBeGreaterThan(5)
    expect(store.jobs.length).toBe(3)
    expect(store.selectedJob).not.toBeNull()
    // Initial seed has Docker inactive, so job-laravel-vue-pleno has 100% required (75) + 3/4 bonus (18.75) = 94%
    expect(store.selectedJobAnalysis?.overallScore).toBe(94)
  })

  it('recalculates job match immediately when toggling a candidate skill', () => {
    const adapter = new InMemoryVaultAdapter()
    const store = useCareerVaultStore()
    store.initialize(adapter)

    const dockerSkill = store.skills.find((s) => s.name === 'Docker')
    expect(dockerSkill?.active).toBe(false)

    store.toggleSkill(dockerSkill!.id)
    expect(store.selectedJobAnalysis?.overallScore).toBe(100)
    expect(adapter.load()?.skills.find((s) => s.name === 'Docker')?.active).toBe(true)
  })

  it('adds new job, adds snippet, filters snippets by language and search query', () => {
    const adapter = new InMemoryVaultAdapter()
    const store = useCareerVaultStore()
    store.initialize(adapter)

    const newJob = store.addJob({
      title: 'Arquiteto Vue & Laravel',
      company: 'NovaTech',
      level: 'Pleno',
      workMode: 'remote',
      status: 'saved',
      requiredSkills: ['Vue 3', 'Laravel 12'],
      bonusSkills: ['Docker'],
      notes: 'Vaga internacional'
    })

    expect(store.selectedJobId).toBe(newJob.id)
    expect(store.jobs[0].title).toBe('Arquiteto Vue & Laravel')

    store.addSnippet({
      title: 'Middleware de Rate Limit no Laravel',
      language: 'laravel',
      tags: ['security', 'api'],
      summary: 'Configuração de RateLimiter::for em AppServiceProvider',
      code: 'RateLimiter::for("api", fn (Request $r) => Limit::perMinute(60));'
    })

    store.snippetLanguageFilter = 'laravel'
    store.snippetSearchQuery = 'Rate Limit'
    expect(store.filteredSnippets).toHaveLength(1)
    expect(store.filteredSnippets[0].title).toContain('Rate Limit')
  })

  it('exports and imports valid JSON backup and rejects corrupted payload without losing state (CA-04)', () => {
    const adapter = new InMemoryVaultAdapter()
    const store = useCareerVaultStore()
    store.initialize(adapter)

    const exported = store.exportBackupJson()
    expect(exported).toContain('"version": 1')

    expect(() => store.importBackupJson('{bad json')).toThrow(/JSON inválido/i)
    expect(store.jobs.length).toBe(3)
  })

  it('updates job status, deletes job, toggles snippet favorite and deletes snippet', () => {
    const adapter = new InMemoryVaultAdapter()
    const store = useCareerVaultStore()
    store.initialize(adapter)

    const targetJobId = store.jobs[0].id
    store.updateJobStatus(targetJobId, 'offer')
    expect(store.jobs[0].status).toBe('offer')

    store.deleteJob(targetJobId)
    expect(store.jobs.find((j) => j.id === targetJobId)).toBeUndefined()

    const targetSnippetId = store.snippets[0].id
    const initialFav = store.snippets[0].favorite
    store.toggleSnippetFavorite(targetSnippetId)
    expect(store.snippets[0].favorite).toBe(!initialFav)

    store.deleteSnippet(targetSnippetId)
    expect(store.snippets.find((s) => s.id === targetSnippetId)).toBeUndefined()
  })
})

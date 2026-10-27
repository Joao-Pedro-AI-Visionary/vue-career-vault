import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ApplicationStatus,
  CandidateSkill,
  CodeSnippet,
  JobOpportunity,
  MatchAnalysisResult,
  SkillCategory,
  SnippetLanguage,
  VaultStateSnapshot,
  VaultStoragePort
} from '@/domain/contracts'
import { analyzeJobMatch, normalizeSkillName } from '@/domain/jobMatchEngine'
import { parseVaultBackup } from '@/domain/vaultValidator'
import { createDefaultVaultSnapshot } from '@/infrastructure/defaultSeed'
import { LocalStorageVaultAdapter } from '@/infrastructure/storageAdapter'

export const useCareerVaultStore = defineStore('careerVault', () => {
  const skills = ref<CandidateSkill[]>([])
  const jobs = ref<JobOpportunity[]>([])
  const snippets = ref<CodeSnippet[]>([])
  const selectedJobId = ref<string>('')
  const snippetSearchQuery = ref<string>('')
  const snippetLanguageFilter = ref<SnippetLanguage | 'all'>('all')
  const showOnlyFavorites = ref<boolean>(false)

  let activeAdapter: VaultStoragePort = new LocalStorageVaultAdapter()

  function persist() {
    const snapshot: VaultStateSnapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      skills: skills.value,
      jobs: jobs.value,
      snippets: snippets.value
    }
    activeAdapter.save(snapshot)
  }

  function applySnapshot(snapshot: VaultStateSnapshot) {
    skills.value = snapshot.skills
    jobs.value = snapshot.jobs
    snippets.value = snapshot.snippets
    selectedJobId.value = snapshot.jobs[0]?.id ?? ''
  }

  function initialize(customAdapter?: VaultStoragePort) {
    if (customAdapter) {
      activeAdapter = customAdapter
    }
    const existing = activeAdapter.load()
    if (existing) {
      applySnapshot(existing)
    } else {
      const seed = createDefaultVaultSnapshot()
      applySnapshot(seed)
      persist()
    }
  }

  function resetToDefaultSeed() {
    const seed = createDefaultVaultSnapshot()
    applySnapshot(seed)
    persist()
  }

  const selectedJob = computed<JobOpportunity | null>(() => {
    return jobs.value.find((j) => j.id === selectedJobId.value) ?? jobs.value[0] ?? null
  })

  const selectedJobAnalysis = computed<MatchAnalysisResult | null>(() => {
    if (!selectedJob.value) {
      return null
    }
    return analyzeJobMatch(selectedJob.value, skills.value)
  })

  const jobsWithScores = computed(() => {
    return jobs.value.map((job) => ({
      job,
      analysis: analyzeJobMatch(job, skills.value)
    }))
  })

  const averageMatchScore = computed<number>(() => {
    if (jobsWithScores.value.length === 0) return 0
    const sum = jobsWithScores.value.reduce((acc, item) => acc + item.analysis.overallScore, 0)
    return Math.round(sum / jobsWithScores.value.length)
  })

  const filteredSnippets = computed<CodeSnippet[]>(() => {
    const query = snippetSearchQuery.value.trim().toLowerCase()
    return snippets.value.filter((snippet) => {
      if (snippetLanguageFilter.value !== 'all' && snippet.language !== snippetLanguageFilter.value) {
        return false
      }
      if (showOnlyFavorites.value && !snippet.favorite) {
        return false
      }
      if (!query) {
        return true
      }
      const inTitle = snippet.title.toLowerCase().includes(query)
      const inSummary = snippet.summary.toLowerCase().includes(query)
      const inTags = snippet.tags.some((t) => t.toLowerCase().includes(query))
      const inCode = snippet.code.toLowerCase().includes(query)
      return inTitle || inSummary || inTags || inCode
    })
  })

  function toggleSkill(skillId: string) {
    const target = skills.value.find((s) => s.id === skillId)
    if (target) {
      target.active = !target.active
      persist()
    }
  }

  function addSkill(name: string, category: SkillCategory = 'backend'): CandidateSkill {
    const trimmed = name.trim()
    if (!trimmed) {
      throw new Error('O nome da skill é obrigatório.')
    }
    const normalizedNew = normalizeSkillName(trimmed)
    const exists = skills.value.some((s) => normalizeSkillName(s.name) === normalizedNew)
    if (exists) {
      throw new Error(`Constraint violada: a skill "${trimmed}" já existe no perfil.`)
    }
    const created: CandidateSkill = {
      id: `sk-${Date.now()}`,
      name: trimmed,
      category,
      proficiency: 4,
      active: true
    }
    skills.value.push(created)
    persist()
    return created
  }

  function updateSkill(skillId: string, patch: Partial<Pick<CandidateSkill, 'name' | 'category' | 'proficiency' | 'active'>>) {
    const target = skills.value.find((s) => s.id === skillId)
    if (!target) return
    if (patch.name !== undefined) {
      const trimmed = patch.name.trim()
      if (!trimmed) throw new Error('O nome da skill não pode ser vazio.')
      const duplicate = skills.value.some(
        (s) => s.id !== skillId && normalizeSkillName(s.name) === normalizeSkillName(trimmed)
      )
      if (duplicate) throw new Error(`Constraint violada: a skill "${trimmed}" já existe.`)
      target.name = trimmed
    }
    if (patch.category !== undefined) target.category = patch.category
    if (patch.proficiency !== undefined) target.proficiency = patch.proficiency
    if (patch.active !== undefined) target.active = patch.active
    persist()
  }

  function deleteSkill(skillId: string) {
    skills.value = skills.value.filter((s) => s.id !== skillId)
    persist()
  }

  function addJob(input: Omit<JobOpportunity, 'id' | 'createdAt'>): JobOpportunity {
    const title = input.title.trim()
    const company = input.company.trim()
    if (!title || !company) {
      throw new Error('Constraint violada: título da vaga e empresa são obrigatórios.')
    }
    if (input.requiredSkills.length === 0) {
      throw new Error('Constraint violada: informe ao menos 1 skill obrigatória para a vaga.')
    }
    const created: JobOpportunity = {
      ...input,
      title,
      company,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    jobs.value.unshift(created)
    selectedJobId.value = created.id
    persist()
    return created
  }

  function updateJob(
    jobId: string,
    patch: Partial<Omit<JobOpportunity, 'id' | 'createdAt'>>
  ): JobOpportunity {
    const job = jobs.value.find((j) => j.id === jobId)
    if (!job) {
      throw new Error('Vaga não encontrada.')
    }
    if (patch.title !== undefined) {
      if (!patch.title.trim()) throw new Error('Constraint violada: título não pode ser vazio.')
      job.title = patch.title.trim()
    }
    if (patch.company !== undefined) {
      if (!patch.company.trim()) throw new Error('Constraint violada: empresa não pode ser vazia.')
      job.company = patch.company.trim()
    }
    if (patch.level !== undefined) job.level = patch.level
    if (patch.workMode !== undefined) job.workMode = patch.workMode
    if (patch.status !== undefined) job.status = patch.status
    if (patch.requiredSkills !== undefined) {
      if (patch.requiredSkills.length === 0) {
        throw new Error('Constraint violada: a vaga deve ter ao menos 1 skill obrigatória.')
      }
      job.requiredSkills = patch.requiredSkills
    }
    if (patch.bonusSkills !== undefined) job.bonusSkills = patch.bonusSkills
    if (patch.notes !== undefined) job.notes = patch.notes
    persist()
    return job
  }

  function updateJobStatus(jobId: string, status: ApplicationStatus) {
    updateJob(jobId, { status })
  }

  function deleteJob(jobId: string) {
    jobs.value = jobs.value.filter((j) => j.id !== jobId)
    if (selectedJobId.value === jobId) {
      selectedJobId.value = jobs.value[0]?.id ?? ''
    }
    persist()
  }

  function addSnippet(
    input: Omit<CodeSnippet, 'id' | 'updatedAt' | 'favorite'> & { favorite?: boolean }
  ): CodeSnippet {
    const title = input.title.trim()
    const code = input.code.trim()
    if (!title || !code) {
      throw new Error('Constraint violada: título e código do snippet são obrigatórios.')
    }
    const created: CodeSnippet = {
      id: `snip-${Date.now()}`,
      title,
      language: input.language,
      tags: input.tags,
      summary: input.summary.trim(),
      code,
      favorite: input.favorite ?? false,
      updatedAt: new Date().toISOString()
    }
    snippets.value.unshift(created)
    persist()
    return created
  }

  function updateSnippet(
    snippetId: string,
    patch: Partial<Omit<CodeSnippet, 'id' | 'updatedAt'>>
  ): CodeSnippet {
    const item = snippets.value.find((s) => s.id === snippetId)
    if (!item) {
      throw new Error('Snippet não encontrado.')
    }
    if (patch.title !== undefined) {
      if (!patch.title.trim()) throw new Error('Constraint violada: título do snippet é obrigatório.')
      item.title = patch.title.trim()
    }
    if (patch.code !== undefined) {
      if (!patch.code.trim()) throw new Error('Constraint violada: código do snippet é obrigatório.')
      item.code = patch.code
    }
    if (patch.language !== undefined) item.language = patch.language
    if (patch.tags !== undefined) item.tags = patch.tags
    if (patch.summary !== undefined) item.summary = patch.summary.trim()
    if (patch.favorite !== undefined) item.favorite = patch.favorite
    item.updatedAt = new Date().toISOString()
    persist()
    return item
  }

  function toggleSnippetFavorite(snippetId: string) {
    const item = snippets.value.find((s) => s.id === snippetId)
    if (item) {
      item.favorite = !item.favorite
      persist()
    }
  }

  function deleteSnippet(snippetId: string) {
    snippets.value = snippets.value.filter((s) => s.id !== snippetId)
    persist()
  }

  function exportBackupJson(): string {
    const snapshot: VaultStateSnapshot = {
      version: 1,
      exportedAt: new Date().toISOString(),
      skills: skills.value,
      jobs: jobs.value,
      snippets: snippets.value
    }
    return JSON.stringify(snapshot, null, 2)
  }

  function importBackupJson(rawJson: string) {
    const validated = parseVaultBackup(rawJson)
    applySnapshot(validated)
    persist()
  }

  return {
    skills,
    jobs,
    snippets,
    selectedJobId,
    snippetSearchQuery,
    snippetLanguageFilter,
    showOnlyFavorites,
    selectedJob,
    selectedJobAnalysis,
    jobsWithScores,
    averageMatchScore,
    filteredSnippets,
    initialize,
    resetToDefaultSeed,
    toggleSkill,
    addSkill,
    updateSkill,
    deleteSkill,
    addJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    addSnippet,
    updateSnippet,
    toggleSnippetFavorite,
    deleteSnippet,
    exportBackupJson,
    importBackupJson
  }
})

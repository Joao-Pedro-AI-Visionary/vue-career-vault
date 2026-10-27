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
import { analyzeJobMatch } from '@/domain/jobMatchEngine'
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

  function addSkill(name: string, category: SkillCategory = 'backend') {
    const trimmed = name.trim()
    if (!trimmed) return
    const exists = skills.value.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) return
    skills.value.push({
      id: `sk-${Date.now()}`,
      name: trimmed,
      category,
      proficiency: 4,
      active: true
    })
    persist()
  }

  function addJob(input: Omit<JobOpportunity, 'id' | 'createdAt'>): JobOpportunity {
    const created: JobOpportunity = {
      ...input,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    jobs.value.unshift(created)
    selectedJobId.value = created.id
    persist()
    return created
  }

  function updateJobStatus(jobId: string, status: ApplicationStatus) {
    const job = jobs.value.find((j) => j.id === jobId)
    if (job) {
      job.status = status
      persist()
    }
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
    const created: CodeSnippet = {
      id: `snip-${Date.now()}`,
      title: input.title.trim(),
      language: input.language,
      tags: input.tags,
      summary: input.summary.trim(),
      code: input.code,
      favorite: input.favorite ?? false,
      updatedAt: new Date().toISOString()
    }
    snippets.value.unshift(created)
    persist()
    return created
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
    addJob,
    updateJobStatus,
    deleteJob,
    addSnippet,
    toggleSnippetFavorite,
    deleteSnippet,
    exportBackupJson,
    importBackupJson
  }
})

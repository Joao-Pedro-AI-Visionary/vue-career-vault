export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'architecture'

export interface CandidateSkill {
  id: string
  name: string
  category: SkillCategory
  proficiency: 1 | 2 | 3 | 4 | 5
  active: boolean
}

export type JobRoleLevel = 'Jr' | 'Pleno' | 'Sr'
export type WorkMode = 'remote' | 'hybrid' | 'onsite'
export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'technical_test' | 'offer'

export interface JobOpportunity {
  id: string
  title: string
  company: string
  level: JobRoleLevel
  workMode: WorkMode
  status: ApplicationStatus
  requiredSkills: string[]
  bonusSkills: string[]
  notes: string
  createdAt: string
}

export interface StudyGapItem {
  skill: string
  priority: 'high' | 'medium'
  reason: string
}

export interface MatchAnalysisResult {
  overallScore: number
  requiredScore: number
  bonusScore: number
  matchedRequired: string[]
  missingRequired: string[]
  matchedBonus: string[]
  missingBonus: string[]
  readinessLabel: 'Ready to Apply' | 'Strong Contender' | 'Targeted Upskill Needed'
  studyPlan: StudyGapItem[]
}

export type SnippetLanguage = 'vue' | 'php' | 'laravel' | 'sql' | 'ts' | 'bash'

export interface CodeSnippet {
  id: string
  title: string
  language: SnippetLanguage
  tags: string[]
  code: string
  summary: string
  favorite: boolean
  updatedAt: string
}

export interface VaultStateSnapshot {
  version: 1
  exportedAt: string
  skills: CandidateSkill[]
  jobs: JobOpportunity[]
  snippets: CodeSnippet[]
}

export interface VaultStoragePort {
  load(): VaultStateSnapshot | null
  save(snapshot: VaultStateSnapshot): void
  clear(): void
}

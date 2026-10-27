import type {
  CandidateSkill,
  JobOpportunity,
  MatchAnalysisResult,
  StudyGapItem
} from './contracts'

const SKILL_ALIASES: Record<string, string> = {
  'vue 3': 'vue',
  'vue.js': 'vue',
  'vue.js 3': 'vue',
  vuejs: 'vue',
  'laravel 10': 'laravel',
  'laravel 11': 'laravel',
  'laravel 12': 'laravel',
  'php 8': 'php',
  'php 8.2': 'php',
  'php 8.3': 'php',
  'php 8.4': 'php',
  'restful api': 'rest api',
  'api rest': 'rest api',
  rest: 'rest api',
  postgres: 'postgresql',
  'tailwind css': 'tailwind',
  tailwindcss: 'tailwind',
  'pest php': 'pest',
  phpunit: 'pest/phpunit',
  vitest: 'vitest'
}

export function normalizeSkillName(raw: string): string {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  return SKILL_ALIASES[cleaned] ?? cleaned
}

export function analyzeJobMatch(
  job: JobOpportunity,
  candidateSkills: CandidateSkill[]
): MatchAnalysisResult {
  const activeNormalizedSet = new Set(
    candidateSkills.filter((s) => s.active).map((s) => normalizeSkillName(s.name))
  )

  const matchedRequired: string[] = []
  const missingRequired: string[] = []

  for (const reqSkill of job.requiredSkills) {
    if (activeNormalizedSet.has(normalizeSkillName(reqSkill))) {
      matchedRequired.push(reqSkill)
    } else {
      missingRequired.push(reqSkill)
    }
  }

  const matchedBonus: string[] = []
  const missingBonus: string[] = []

  for (const bonusSkill of job.bonusSkills) {
    if (activeNormalizedSet.has(normalizeSkillName(bonusSkill))) {
      matchedBonus.push(bonusSkill)
    } else {
      missingBonus.push(bonusSkill)
    }
  }

  const reqRatio =
    job.requiredSkills.length > 0 ? matchedRequired.length / job.requiredSkills.length : 1
  const bonusRatio =
    job.bonusSkills.length > 0 ? matchedBonus.length / job.bonusSkills.length : 1

  const hasBonus = job.bonusSkills.length > 0
  const requiredWeight = hasBonus ? 75 : 100
  const bonusWeight = hasBonus ? 25 : 0

  const requiredScore = Math.round(reqRatio * 100)
  const bonusScore = hasBonus ? Math.round(bonusRatio * 100) : 100
  const overallScore = Math.round(reqRatio * requiredWeight + bonusRatio * bonusWeight)

  const studyPlan: StudyGapItem[] = [
    ...missingRequired.map((skill) => ({
      skill,
      priority: 'high' as const,
      reason: 'Requisito obrigatório da vaga ainda não marcado como ativo no seu perfil.'
    })),
    ...missingBonus.map((skill) => ({
      skill,
      priority: 'medium' as const,
      reason: 'Diferencial competitivo da vaga que eleva a pontuação técnica.'
    }))
  ]

  let readinessLabel: MatchAnalysisResult['readinessLabel'] = 'Targeted Upskill Needed'
  if (overallScore >= 80 && missingRequired.length === 0) {
    readinessLabel = 'Ready to Apply'
  } else if (overallScore >= 60) {
    readinessLabel = 'Strong Contender'
  }

  return {
    overallScore,
    requiredScore,
    bonusScore,
    matchedRequired,
    missingRequired,
    matchedBonus,
    missingBonus,
    readinessLabel,
    studyPlan
  }
}

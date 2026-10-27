import { describe, expect, it } from 'vitest'
import { analyzeJobMatch, normalizeSkillName } from '@/domain/jobMatchEngine'
import { parseVaultBackup } from '@/domain/vaultValidator'
import type { CandidateSkill, JobOpportunity } from '@/domain/contracts'

describe('jobMatchEngine (TDD)', () => {
  const candidateSkills: CandidateSkill[] = [
    { id: '1', name: 'Vue 3', category: 'frontend', proficiency: 5, active: true },
    { id: '2', name: 'TypeScript', category: 'frontend', proficiency: 4, active: true },
    { id: '3', name: 'Laravel 11', category: 'backend', proficiency: 4, active: true },
    { id: '4', name: 'PHP 8.3', category: 'backend', proficiency: 4, active: true },
    { id: '5', name: 'Docker', category: 'devops', proficiency: 3, active: false } // inactive skill should not count
  ]

  it('normalizes common framework aliases and casing consistently', () => {
    expect(normalizeSkillName('  Vue.js 3  ')).toBe('vue')
    expect(normalizeSkillName('Laravel 12')).toBe('laravel')
    expect(normalizeSkillName('PHP 8.3')).toBe('php')
    expect(normalizeSkillName('RESTful API')).toBe('rest api')
  })

  it('calculates 75/25 weighted score when job has both required and bonus skills (CA-01)', () => {
    const job: JobOpportunity = {
      id: 'job-1',
      title: 'Desenvolvedor Fullstack Pleno (PHP/Vue)',
      company: 'TechCorp',
      level: 'Pleno',
      workMode: 'remote',
      status: 'technical_test',
      requiredSkills: ['Vue.js', 'Laravel', 'PHP', 'MySQL'],
      bonusSkills: ['TypeScript', 'Docker'],
      notes: 'Foco em testes automatizados',
      createdAt: '2026-10-27T10:00:00.000Z'
    }

    const result = analyzeJobMatch(job, candidateSkills)

    // 3/4 required = 75% * 0.75 = 56.25
    // 1/2 bonus (Docker is inactive) = 50% * 0.25 = 12.5
    // Total = round(68.75) = 69
    expect(result.overallScore).toBe(69)
    expect(result.matchedRequired).toEqual(['Vue.js', 'Laravel', 'PHP'])
    expect(result.missingRequired).toEqual(['MySQL'])
    expect(result.matchedBonus).toEqual(['TypeScript'])
    expect(result.missingBonus).toEqual(['Docker'])
    expect(result.studyPlan[0]).toEqual({
      skill: 'MySQL',
      priority: 'high',
      reason: 'Requisito obrigatório da vaga ainda não marcado como ativo no seu perfil.'
    })
  })

  it('allocates 100% weight to required skills when bonusSkills is empty (CA-02)', () => {
    const job: JobOpportunity = {
      id: 'job-2',
      title: 'Frontend Vue Pleno',
      company: 'StudioWeb',
      level: 'Pleno',
      workMode: 'hybrid',
      status: 'saved',
      requiredSkills: ['Vue 3', 'TypeScript'],
      bonusSkills: [],
      notes: '',
      createdAt: '2026-10-27T10:00:00.000Z'
    }

    const result = analyzeJobMatch(job, candidateSkills)
    expect(result.overallScore).toBe(100)
    expect(result.readinessLabel).toBe('Ready to Apply')
    expect(result.studyPlan).toHaveLength(0)
  })

  it('validates and rejects malformed JSON backups safely (CA-04)', () => {
    expect(() => parseVaultBackup('not-json')).toThrow(/JSON inválido/i)
    expect(() => parseVaultBackup(JSON.stringify({ version: 2 }))).toThrow(/Versão de backup incompatível/i)
  })
})

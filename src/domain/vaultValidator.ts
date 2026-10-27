import type { VaultStateSnapshot } from './contracts'

function isValidItemObject(item: unknown, requiredKeys: string[]): boolean {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return requiredKeys.every((key) => key in obj)
}

export function parseVaultBackup(rawJson: string): VaultStateSnapshot {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    throw new Error('JSON inválido: verifique a formatação do arquivo de backup.')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Estrutura de backup inválida.')
  }

  const record = parsed as Record<string, unknown>
  if (record.version !== 1) {
    throw new Error('Versão de backup incompatível: esperado version = 1.')
  }

  if (
    !Array.isArray(record.skills) ||
    !Array.isArray(record.jobs) ||
    !Array.isArray(record.snippets)
  ) {
    throw new Error('Campos obrigatórios ausentes no backup (skills, jobs, snippets).')
  }

  const validSkills = record.skills.every((s) =>
    isValidItemObject(s, ['id', 'name', 'category', 'active'])
  )
  const validJobs = record.jobs.every((j) =>
    isValidItemObject(j, ['id', 'title', 'company', 'requiredSkills', 'bonusSkills'])
  )
  const validSnippets = record.snippets.every((sn) =>
    isValidItemObject(sn, ['id', 'title', 'language', 'code'])
  )

  if (!validSkills || !validJobs || !validSnippets) {
    throw new Error('Itens internos do backup estão incompletos ou corrompidos.')
  }

  return {
    version: 1,
    exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : new Date().toISOString(),
    skills: record.skills as VaultStateSnapshot['skills'],
    jobs: record.jobs as VaultStateSnapshot['jobs'],
    snippets: record.snippets as VaultStateSnapshot['snippets']
  }
}

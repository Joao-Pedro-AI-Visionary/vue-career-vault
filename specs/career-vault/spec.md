# Spec — Career Vault & Job Skill Matcher

## Contratos de Domínio

### Entrada
- `CandidateSkill`: `{ id: string; name: string; category: 'frontend' | 'backend' | 'database' | 'devops' | 'testing'; proficiency: 1 | 2 | 3 | 4 | 5 }`
- `JobOpportunity`: `{ id: string; title: string; company: string; level: 'Jr' | 'Pleno' | 'Sr'; workMode: 'remote' | 'hybrid' | 'onsite'; status: 'saved' | 'applied' | 'interview' | 'technical_test' | 'offer'; requiredSkills: string[]; bonusSkills: string[]; notes: string; createdAt: string }`
- `CodeSnippet`: `{ id: string; title: string; language: 'vue' | 'php' | 'laravel' | 'sql' | 'ts' | 'bash'; tags: string[]; code: string; summary: string; favorite: boolean; updatedAt: string }`

### Regras de Negócio
1. **Normalização de Skill (`normalizeSkillName`):**
   - Remove espaços extras, converte para lowercase e mapeia aliases conhecidos (`vue 3`, `vuejs`, `vue.js` -> `vue`; `laravel 11`, `laravel 12` -> `laravel`; `php 8`, `php 8.3` -> `php`; `rest`, `api rest`, `restful` -> `rest api`; `postgres` -> `postgresql`).
2. **Cálculo de Match (`analyzeJobMatch`):**
   - Se a vaga possui `requiredSkills` e `bonusSkills`, o peso é `75%` para `requiredSkills` e `25%` para `bonusSkills`.
   - Se a vaga não possui `bonusSkills` (lista vazia), `requiredSkills` vale `100%`.
   - Cada skill faltante gera um item em `studyPlan` com prioridade `'high'` (se obrigatória) ou `'medium'` (se diferencial).
3. **Validação de Backup (`parseVaultBackup`):**
   - Verifica versão do schema (`version: 1`), presença de arrays válidos `skills`, `jobs` e `snippets`, lançando erro descritivo em caso de JSON inválido ou campos ausentes.

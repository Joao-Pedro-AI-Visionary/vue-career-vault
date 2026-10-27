# Project Brief — Vue Career & Snippet Vault

## 1. Problema e Objetivo
Desenvolvedores que participam de processos seletivos técnicos (como vagas Pleno em PHP/Laravel e Vue.js) precisam avaliar rapidamente a aderência de seu perfil aos requisitos de cada vaga, mapear lacunas de estudo prioritárias e manter um cofre pesquisável de snippets e padrões arquiteturais para consulta rápida.

## 2. Classificação e Dial
- **Classificação:** MVP de portfólio técnico com utilidade real no dia a dia.
- **Classe do Dial:** `frontend` — Nível 2 (Contrato + TDD + `test-gate` + `pr-review`).

## 3. Funcionalidades Indispensáveis (Escopo Atual)
1. **Motor de Match de Vagas (`JobMatchEngine`):**
   - Compara skills obrigatórias (`requiredSkills` — peso 75%) e diferenciais (`bonusSkills` — peso 25%) com o perfil técnico do candidato (`CandidateSkill[]`).
   - Normaliza sinônimos e capitalização (ex.: `vue.js`/`vue 3`/`vue` -> `vue`).
   - Gera score de 0 a 100, lista requisitos atendidos, requisitos faltantes e trilha priorizada de estudo.
2. **Gestão de Candidaturas e Pipeline:**
   - Cadastro, atualização de status (`saved`, `applied`, `interview`, `technical_test`, `offer`), notas técnicas e remoção de vagas.
3. **Cofre de Snippets Técnicos (`SnippetVault`):**
   - CRUD de snippets de código (`vue`, `php`, `laravel`, `sql`, `ts`, `bash`), marcação de favoritos, filtro por linguagem, tags e busca textual.
4. **Persistência Local-First Desacoplada (`StorageAdapter`):**
   - Persistência com adapter configurável (`LocalStorageVaultAdapter` / `InMemoryVaultAdapter`), seed inicial automático com vagas e snippets reais de Laravel + Vue 3 e exportação/importação de backup JSON validado.

## 4. Critérios de Aceitação Verificáveis
- **CA-01:** Dada uma vaga com 4 skills obrigatórias (3 atendidas) e 2 diferenciais (1 atendida), o motor calcula `round((3/4)*75 + (1/2)*25) = 69%` e retorna a skill obrigatória faltante como prioridade alta.
- **CA-02:** Quando uma vaga sem skills diferenciais tem 100% das obrigatórias atendidas, o score total é `100%`.
- **CA-03:** A store Pinia inicializa com dados de seed caso o cofre esteja vazio e persiste alterações automaticamente no `StorageAdapter`.
- **CA-04:** A exportação e importação de JSON rejeita payloads malformados sem corromper o estado existente.
- **CA-05:** `npm run typecheck`, `npm test` e `npm run build` executam com código de saída `0`.

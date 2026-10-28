# CareerVault — Precision Job Skill Matcher & Technical Snippet Ledger (Vue 3.5 + TypeScript)

> 🚀 **Deploy em Produção (Vercel):** [https://vue-career-vault.vercel.app](https://vue-career-vault.vercel.app)
> 🎨 **Design System:** Inspirado em referências do Dribbble (SaaS Minimalista / Linear & Vercel Style) + 19 Leis de UX aplicadas e alvos de toque $\ge 48\text{px}$.

Aplicação web **Local-First** construída em **Vue 3 (`<script setup>`, Composition API)**, **TypeScript**, **Pinia** e **Tailwind CSS v4** para engenheiros de software avaliarem aderência técnica a vagas (ex.: Fullstack PHP/Laravel + Vue.js), identificarem lacunas de estudo priorizadas e organizarem um cofre pesquisável de snippets de código.

---

## Destaques Arquiteturais (Foco Nível Pleno)

- **Separação Estrita de Camadas (Clean Frontend Architecture):**
  - `src/domain/`: Contratos TypeScript puros (`contracts.ts`), motor determinístico de cálculo ponderado (`jobMatchEngine.ts` — 75% requisitos obrigatórios / 25% diferenciais, normalização de sinônimos) e validação defensiva de backups (`vaultValidator.ts`).
  - `src/infrastructure/`: Porta `VaultStoragePort` com adaptadores desacoplados (`LocalStorageVaultAdapter` para browser e `InMemoryVaultAdapter` para testes rápidos sem acoplamento ao DOM).
  - `src/stores/`: Pinia Setup Store (`useCareerVaultStore.ts`) com `computed` memoizados e persistência automática.
  - `src/components/`: Componentes Vue 3 reativos com estética *Precision Engineering Ledger*, alvos de toque acessíveis (`>= 44px`), alto contraste e suporte a `prefers-reduced-motion`.
- **TDD & Qualidade Automatizada:**
  - Suíte de testes com **Vitest** + **Vue Test Utils** cobrindo regras de domínio, adaptadores de persistência, reatividade da store Pinia e interações de componentes.

---

## Stack & Versões Pinadas

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | Vue 3 (Composition API) | `3.5.44` |
| Gerenciamento de Estado | Pinia | `4.1.0` |
| Bundler / Dev Server | Vite | `8.3.5` |
| Estilização | Tailwind CSS | `4.3.3` |
| Tipagem Estática | TypeScript + `vue-tsc` | `5.8.3` / `3.3.13` |
| Testes Automatizados | Vitest + `@vue/test-utils` | `5.0.5` / `2.5.1` |

---

## Como Executar Localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Rodar suíte de testes (Vitest)
pnpm test

# 3. Validar tipagem estática (vue-tsc)
pnpm typecheck

# 4. Iniciar servidor de desenvolvimento
pnpm dev

# 5. Gerar build de produção
pnpm build
```

---

## Estrutura de Diretórios

```text
src/
├── components/
│   ├── JobMatcherWorkspace.vue     # Pipeline de vagas + telemetria 75/25 + plano de estudo
│   ├── SkillMatrixBar.vue          # Calibrador interativo de skills do candidato
│   └── SnippetVaultWorkspace.vue   # Cofre de snippets com filtro por linguagem e busca
├── domain/
│   ├── contracts.ts                # Interfaces e tipos de domínio
│   ├── jobMatchEngine.ts           # Cálculo de match e normalização de aliases
│   └── vaultValidator.ts           # Validação de schema de backup JSON
├── infrastructure/
│   ├── defaultSeed.ts              # Dados iniciais de demonstração (Laravel + Vue 3)
│   └── storageAdapter.ts           # Implementações LocalStorage e InMemory
├── stores/
│   └── useCareerVaultStore.ts      # Pinia Setup Store
├── App.vue
└── main.ts
tests/
├── components/CareerVaultApp.spec.ts
├── domain/jobMatchEngine.spec.ts
├── infrastructure/storageAdapter.spec.ts
└── stores/careerVaultStore.spec.ts
```

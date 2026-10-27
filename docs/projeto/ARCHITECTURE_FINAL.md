# Arquitetura Final & Decisões Tecnológicas — Vue Career Vault

## 1. Visão Arquitetural
Arquitetura limpa no frontend dividida em 4 camadas estritas:
- `src/domain/`: Contratos TypeScript puros (`contracts.ts`), motor determinístico de cálculo de aderência (`jobMatchEngine.ts`) e validação de backup (`vaultValidator.ts`). Zero dependência de Vue ou DOM.
- `src/infrastructure/`: Implementações de `VaultStoragePort` (`LocalStorageVaultAdapter`, `InMemoryVaultAdapter`) e dados iniciais de demonstração (`defaultSeed.ts`).
- `src/stores/`: Estado reativo centralizado via Pinia Setup Store (`useCareerVaultStore.ts`), expondo `computed` memoizados e actions testáveis com injeção de adapter.
- `src/components/` & `src/views/`: Interface Vue 3 (`<script setup lang="ts">`) seguindo a direção estética *Precision Engineering Ledger*.

## 2. Stack Pinada (R6)
- `vue`: `3.5.44`
- `pinia`: `4.1.0`
- `vue-router`: `5.4.0`
- `vite`: `8.3.5`
- `@vitejs/plugin-vue`: `6.0.10`
- `tailwindcss`: `4.3.3` + `@tailwindcss/vite`: `4.3.3`
- `lucide-vue-next`: `1.0.0`
- `vitest`: `5.0.5` + `@vue/test-utils`: `2.5.1` + `happy-dom`: `21.0.4`
- `typescript`: `5.8.3` + `vue-tsc`: `3.3.13`

## 3. Direção de Design (`frontend-design`)
- **Conceito:** *Precision Engineering Ledger* — painel de telemetria de carreira inspirado em instrumentos de bancada técnica.
- **Paleta de Tokens:**
  - `--bg-canvas`: `#0B0F17` (Grafite profundo)
  - `--bg-surface`: `#111827` (Painel técnico)
  - `--bg-elevated`: `#1E293B` (Card interativo / input)
  - `--text-primary`: `#F8FAFC` (Marfim de alto contraste > 14:1)
  - `--text-muted`: `#94A3B8` (Cinza ardósia com contraste > 4.6:1)
  - `--accent-amber`: `#F59E0B` (Indicador de calibração / match parcial)
  - `--accent-emerald`: `#10B981` (Match alto >= 75% / requisito validado)
  - `--accent-rose`: `#F43F5E` (Lacuna obrigatória / alerta)
- **Elemento de Assinatura:** Medidor radial/barra segmentada de *Skill Coverage Matrix* que decompõe o score em tempo real entre requisitos obrigatórios (75%) e diferenciais (25%) conforme o candidato ativa/desativa skills no próprio perfil.

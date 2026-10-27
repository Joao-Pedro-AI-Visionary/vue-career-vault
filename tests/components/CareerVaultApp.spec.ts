import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from '@/App.vue'
import { useCareerVaultStore } from '@/stores/useCareerVaultStore'
import { InMemoryVaultAdapter } from '@/infrastructure/storageAdapter'

describe('CareerVault UI Components (TDD)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const store = useCareerVaultStore()
    store.initialize(new InMemoryVaultAdapter())
  })

  it('renders Precision Engineering Ledger header, candidate skill toggles, and updates match score when Docker skill is clicked', async () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('CAREER_VAULT')
    expect(wrapper.find('[data-testid="overall-match-score"]').text()).toBe('94%')

    const dockerToggle = wrapper.find('[data-testid="skill-toggle-Docker"]')
    expect(dockerToggle.exists()).toBe(true)

    await dockerToggle.trigger('click')
    expect(wrapper.find('[data-testid="overall-match-score"]').text()).toBe('100%')
  })

  it('switches to Snippet Vault tab, filters by language, and allows adding a new job opportunity', async () => {
    const wrapper = mount(App)

    // Switch to Snippets tab
    const snippetsTab = wrapper.find('[data-testid="nav-tab-snippets"]')
    await snippetsTab.trigger('click')
    expect(wrapper.text()).toContain('Transação Idempotente + Dispatch de Job Pós-Commit no Laravel 12')

    // Filter by SQL
    const sqlFilterBtn = wrapper.find('[data-testid="lang-filter-sql"]')
    await sqlFilterBtn.trigger('click')
    expect(wrapper.text()).toContain('Query SQL Agregada por Categoria com Window Function')
    expect(wrapper.text()).not.toContain('Composable useDebouncedRef')

    // Switch back to Jobs tab and add a new job
    await wrapper.find('[data-testid="nav-tab-jobs"]').trigger('click')
    await wrapper.find('[data-testid="open-new-job-form"]').trigger('click')

    await wrapper.find('[data-testid="input-job-title"]').setValue('Engenheiro Fullstack Laravel + Vue')
    await wrapper.find('[data-testid="input-job-company"]').setValue('Acme SaaS')
    await wrapper.find('[data-testid="input-job-required"]').setValue('Vue 3, Laravel 12, PHP 8.3')
    await wrapper.find('[data-testid="input-job-bonus"]').setValue('Vitest')
    await wrapper.find('[data-testid="submit-new-job"]').trigger('submit')

    expect(wrapper.text()).toContain('Engenheiro Fullstack Laravel + Vue')
    expect(wrapper.text()).toContain('Acme SaaS')
  })
})

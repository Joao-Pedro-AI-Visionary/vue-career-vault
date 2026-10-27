import { test, expect } from '@playwright/test'

test.describe('Project 1: CareerVault Full CRUD, Constraints & Visual E2E (Chrome + CDP)', () => {
  test('validates Skills CRUD, Jobs CRUD, Snippets CRUD, Constraints, Storage Persistence, and Responsive Views', async ({
    page
  }) => {
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => {
      pageErrors.push(err.message)
    })

    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Precision Job Skill Matcher')

    // Establish active Chrome DevTools Protocol (CDP) session and collect metrics
    const cdpSession = await page.context().newCDPSession(page)
    await cdpSession.send('Performance.enable')
    await cdpSession.send('Network.enable')
    const perfMetrics = await cdpSession.send('Performance.getMetrics')
    expect(perfMetrics.metrics.length).toBeGreaterThan(0)

    // 1. SKILLS CRUD & CONSTRAINTS
    await page.getByTestId('open-add-skill-btn').click()
    await page.getByTestId('input-skill-name').fill('GraphQL')
    await page.getByTestId('submit-skill-btn').click()
    await expect(page.getByTestId('skill-toggle-GraphQL')).toBeVisible()

    // Constraint check: duplicate skill name rejected with friendly error
    await page.getByTestId('open-add-skill-btn').click()
    await page.getByTestId('input-skill-name').fill('GraphQL')
    await page.getByTestId('submit-skill-btn').click()
    await expect(page.getByTestId('skill-error-alert')).toContainText('Constraint violada')
    await page.getByTestId('open-add-skill-btn').click() // close form

    // Update skill toggle (Docker OFF -> ON jumps score from 94% to 100%)
    await expect(page.getByTestId('overall-match-score')).toHaveText('94%')
    await page.getByTestId('skill-toggle-Docker').click()
    await expect(page.getByTestId('overall-match-score')).toHaveText('100%')

    // Delete skill via Manage Skills
    await page.getByTestId('toggle-skill-manage').click()
    await page.getByTestId('delete-skill-GraphQL').click()
    await expect(page.getByTestId('skill-toggle-GraphQL')).toHaveCount(0)
    await page.getByTestId('toggle-skill-manage').click()

    // 2. JOBS CRUD & CONSTRAINTS
    await page.getByTestId('open-new-job-form').click()
    // Submit empty job form -> constraint violation alert
    await page.getByTestId('save-job-btn').click()
    await expect(page.getByTestId('job-error-alert')).toContainText('Constraint violada')

    // Create valid job
    await page.getByTestId('input-job-title').fill('Arquiteto Fullstack Laravel & Vue')
    await page.getByTestId('input-job-company').fill('Acme Cloud')
    await page.getByTestId('input-job-required').fill('Vue 3; Laravel 12; PHP 8.3')
    await page.getByTestId('input-job-bonus').fill('Docker, Vitest')
    await page.getByTestId('input-job-notes').fill('Vaga remota internacional')
    await page.getByTestId('save-job-btn').click()

    await expect(page.getByTestId('selected-job-title')).toHaveText('Arquiteto Fullstack Laravel & Vue')
    await expect(page.getByTestId('overall-match-score')).toHaveText('100%')

    // Update job (Edit title + change status to offer)
    await page.getByTestId('edit-selected-job-btn').click()
    await page.getByTestId('input-job-title').fill('Tech Lead Fullstack Laravel & Vue 3')
    await page.getByTestId('save-job-btn').click()
    await expect(page.getByTestId('selected-job-title')).toHaveText('Tech Lead Fullstack Laravel & Vue 3')
    await page.getByTestId('select-job-status').selectOption('offer')

    // Verify persistence in localStorage
    const storedRaw = await page.evaluate(() => window.localStorage.getItem('career_vault_state'))
    expect(storedRaw).toContain('Tech Lead Fullstack Laravel & Vue 3')
    expect(storedRaw).toContain('"status":"offer"')

    // Delete job
    await page.getByTestId('delete-selected-job-btn').click()
    await expect(page.getByTestId('selected-job-title')).not.toHaveText('Tech Lead Fullstack Laravel & Vue 3')

    // 3. SNIPPETS CRUD & CONSTRAINTS
    await page.getByTestId('nav-tab-snippets').click()
    await page.getByTestId('open-new-snippet-btn').click()

    // Constraint check: empty snippet rejected
    await page.getByTestId('save-snippet-btn').click()
    await expect(page.getByTestId('snippet-error-alert')).toContainText('Constraint violada')

    // Create snippet
    await page.getByTestId('input-snippet-title').fill('Deploy Zero Downtime Laravel')
    await page.getByTestId('select-snippet-language').selectOption('bash')
    await page.getByTestId('input-snippet-summary').fill('Script de deploy atômico com migrate --force')
    await page.getByTestId('input-snippet-tags').fill('deploy, laravel, ci')
    await page.getByTestId('input-snippet-code').fill('php artisan migrate --force && php artisan config:cache')
    await page.getByTestId('save-snippet-btn').click()

    await expect(page.locator('body')).toContainText('Deploy Zero Downtime Laravel')

    // Filter by bash language
    await page.getByTestId('lang-filter-bash').click()
    await expect(page.locator('article')).toHaveCount(1)

    // Edit snippet
    await page.locator('[data-testid^="edit-snippet-"]').first().click()
    await page.getByTestId('input-snippet-title').fill('Deploy Atômico Laravel 12 (Atualizado)')
    await page.getByTestId('save-snippet-btn').click()
    await expect(page.locator('body')).toContainText('Deploy Atômico Laravel 12 (Atualizado)')

    // Delete snippet
    await page.locator('[data-testid^="delete-snippet-"]').first().click()
    await expect(page.locator('body')).not.toContainText('Deploy Atômico Laravel 12 (Atualizado)')
    await page.getByTestId('lang-filter-all').click()

    // 4. BACKUP JSON CONSTRAINT VALIDATION
    await page.getByTestId('open-backup-btn').click()
    await page.getByTestId('backup-json-textarea').fill('{invalid_json')
    await page.getByTestId('import-backup-submit').click()
    await expect(page.getByTestId('backup-error-alert')).toContainText('JSON inválido')
    await page.getByTestId('open-backup-btn').click()

    // 5. SCREENSHOTS (Desktop 1440px & Mobile 390px)
    await page.getByTestId('nav-tab-jobs').click()
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.screenshot({
      path: 'test-results/p1-career-vault-desktop.png',
      fullPage: true
    })

    await page.setViewportSize({ width: 390, height: 844 })
    await page.screenshot({
      path: 'test-results/p1-career-vault-mobile.png',
      fullPage: true
    })

    expect(consoleErrors).toEqual([])
    expect(pageErrors).toEqual([])
  })
})

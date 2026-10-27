import { describe, expect, it } from 'vitest'
import { InMemoryVaultAdapter, LocalStorageVaultAdapter } from '@/infrastructure/storageAdapter'
import { createDefaultVaultSnapshot } from '@/infrastructure/defaultSeed'

describe('VaultStorageAdapter (TDD)', () => {
  it('persists and retrieves snapshots via InMemoryVaultAdapter', () => {
    const adapter = new InMemoryVaultAdapter()
    expect(adapter.load()).toBeNull()

    const seed = createDefaultVaultSnapshot()
    adapter.save(seed)

    const loaded = adapter.load()
    expect(loaded).not.toBeNull()
    expect(loaded?.jobs.length).toBeGreaterThanOrEqual(3)
    expect(loaded?.snippets.length).toBeGreaterThanOrEqual(4)
  })

  it('persists and clears snapshots safely in LocalStorageVaultAdapter', () => {
    window.localStorage.clear()
    const adapter = new LocalStorageVaultAdapter('test-career-vault-v1')
    const seed = createDefaultVaultSnapshot()

    adapter.save(seed)
    expect(adapter.load()?.skills.length).toBe(seed.skills.length)

    adapter.clear()
    expect(adapter.load()).toBeNull()
  })
})

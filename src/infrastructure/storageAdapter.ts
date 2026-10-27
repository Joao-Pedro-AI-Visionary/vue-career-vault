import type { VaultStateSnapshot, VaultStoragePort } from '@/domain/contracts'
import { parseVaultBackup } from '@/domain/vaultValidator'

export class InMemoryVaultAdapter implements VaultStoragePort {
  private snapshot: VaultStateSnapshot | null = null

  load(): VaultStateSnapshot | null {
    return this.snapshot ? (JSON.parse(JSON.stringify(this.snapshot)) as VaultStateSnapshot) : null
  }

  save(snapshot: VaultStateSnapshot): void {
    this.snapshot = JSON.parse(JSON.stringify(snapshot)) as VaultStateSnapshot
  }

  clear(): void {
    this.snapshot = null
  }
}

export class LocalStorageVaultAdapter implements VaultStoragePort {
  constructor(private readonly namespace = 'career_vault_state') {}

  load(): VaultStateSnapshot | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }
    const raw = window.localStorage.getItem(this.namespace)
    if (!raw) {
      return null
    }
    try {
      return parseVaultBackup(raw)
    } catch {
      return null
    }
  }

  save(snapshot: VaultStateSnapshot): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.setItem(this.namespace, JSON.stringify(snapshot))
  }

  clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    window.localStorage.removeItem(this.namespace)
  }
}

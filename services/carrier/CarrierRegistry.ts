import type { CarrierAdapter } from './CarrierAdapter.ts';
import type { NormalizedPolicyData, CarrierMetadata } from './types.ts';
import { AcmeMutualAdapter } from './adapters/AcmeMutualAdapter.ts';
import { ApexLifeAdapter } from './adapters/ApexLifeAdapter.ts';

/**
 * Universal Carrier Registry
 * 
 * Manages registered insurance carrier adapters, provides lookup with
 * alias normalization (e.g., 'acme-mutual', 'acme_mutual', 'ACME_MUTUAL'),
 * and dispatches payload normalization to the appropriate adapter.
 */
export class CarrierRegistry {
  private adapters: Map<string, CarrierAdapter> = new Map();
  private aliasMap: Map<string, string> = new Map();

  constructor(autoRegisterDefaults = true) {
    if (autoRegisterDefaults) {
      this.registerDefaults();
    }
  }

  /**
   * Helper to normalize lookup keys (lowercase, stripped of dashes, underscores, spaces)
   */
  private normalizeKey(key: string): string {
    return (key || '').toLowerCase().replace(/[-_\s]/g, '');
  }

  /**
   * Register a new carrier adapter into the registry.
   */
  register(adapter: CarrierAdapter, aliases: string[] = []): void {
    if (!adapter || !adapter.carrierId) {
      throw new Error('[CarrierRegistry] Cannot register adapter without a valid carrierId');
    }

    this.adapters.set(adapter.carrierId, adapter);

    // Register canonical alias
    const canonicalKey = this.normalizeKey(adapter.carrierId);
    this.aliasMap.set(canonicalKey, adapter.carrierId);

    // Register name alias
    if (adapter.carrierName) {
      this.aliasMap.set(this.normalizeKey(adapter.carrierName), adapter.carrierId);
    }

    // Register additional aliases
    for (const alias of aliases) {
      this.aliasMap.set(this.normalizeKey(alias), adapter.carrierId);
    }
  }

  /**
   * Unregister an adapter by carrier ID.
   */
  unregister(carrierId: string): boolean {
    const canonicalId = this.resolveCarrierId(carrierId);
    if (!canonicalId) return false;

    this.adapters.delete(canonicalId);
    // Clean aliases
    for (const [key, targetId] of this.aliasMap.entries()) {
      if (targetId === canonicalId) {
        this.aliasMap.delete(key);
      }
    }
    return true;
  }

  /**
   * Resolve an input string to canonical carrierId.
   */
  resolveCarrierId(input: string): string | undefined {
    if (!input) return undefined;
    if (this.adapters.has(input)) {
      return input;
    }
    const key = this.normalizeKey(input);
    return this.aliasMap.get(key);
  }

  /**
   * Retrieve an adapter by carrier ID or alias.
   */
  get(carrierId: string): CarrierAdapter | undefined {
    const canonicalId = this.resolveCarrierId(carrierId);
    if (!canonicalId) return undefined;
    return this.adapters.get(canonicalId);
  }

  /**
   * Check if a carrier is supported.
   */
  has(carrierId: string): boolean {
    return !!this.get(carrierId);
  }

  /**
   * Execute normalization on a raw payload for a specific carrier.
   */
  normalize(carrierId: string, payload: unknown, options?: { referenceDate?: Date | string }): NormalizedPolicyData {
    const adapter = this.get(carrierId);
    if (!adapter) {
      const supported = this.listSupported().map(c => c.carrierId).join(', ');
      throw new Error(`[CarrierRegistry] Unsupported carrier: '${carrierId}'. Registered carriers: [${supported}]`);
    }

    if (!adapter.validatePayload(payload)) {
      throw new Error(`[CarrierRegistry] Payload failed validation for carrier '${adapter.carrierName}' (${adapter.carrierId})`);
    }

    return adapter.normalize(payload, options);
  }

  /**
   * List all registered carriers.
   */
  listSupported(): CarrierMetadata[] {
    const result: CarrierMetadata[] = [];
    for (const adapter of this.adapters.values()) {
      result.push({
        carrierId: adapter.carrierId,
        carrierName: adapter.carrierName,
        isMock: true
      });
    }
    return result;
  }

  /**
   * Get all registered adapters.
   */
  getAll(): CarrierAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Clear all adapters (useful for test isolation).
   */
  clear(): void {
    this.adapters.clear();
    this.aliasMap.clear();
  }

  /**
   * Register default mock carriers: AcmeMutual and ApexLife.
   */
  registerDefaults(): void {
    const acme = new AcmeMutualAdapter();
    this.register(acme, ['acme_mutual', 'ACME_MUTUAL', 'Acme Mutual', 'acme']);

    const apex = new ApexLifeAdapter();
    this.register(apex, ['apex_life', 'APEX_LIFE', 'ApexLife', 'apex', 'Apex Life InsurTech']);
  }
}

// Global default singleton registry instance
export const carrierRegistry = new CarrierRegistry(true);

export { AcmeMutualAdapter, ApexLifeAdapter };
export default carrierRegistry;

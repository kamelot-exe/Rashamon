/**
 * Generate a unique identifier.
 * Uses crypto.randomUUID when available, falls back to timestamp + random.
 */
export function generateId(): string {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

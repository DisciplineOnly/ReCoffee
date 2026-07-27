/**
 * One-time cleanup of storage keys this app no longer writes.
 *
 * Removing the code that *writes* a key does nothing for the browsers that
 * already have it. `recoffee_last_order` held a full order — customer name,
 * email, phone and street address — and was never cleared, so on any machine
 * where an order was placed before this shipped, that PII is still sitting in
 * localStorage waiting for the next visitor. It has to be actively deleted.
 *
 * Runs at module load, before React mounts, so it applies to every visit
 * regardless of which route the customer lands on.
 */

const RETIRED_KEYS = [
    // Replaced by router state + lookup_order(); see CheckoutSuccess.
    'recoffee_last_order',
];

export function purgeRetiredStorage() {
    // Guard the whole thing: Safari private mode and storage-blocking settings
    // make even reading localStorage throw, and this must never break boot.
    try {
        RETIRED_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
        // Nothing to do — if storage is unavailable there is nothing to purge.
    }
}

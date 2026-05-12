/**
 * Utility to manage localStorage with an expiration date (TTL).
 */

interface StorageItem<T> {
    value: T;
    expiry: number;
}

export const storage = {
    /**
     * Set an item in localStorage with a TTL (Time To Live).
     * @param key Storage key
     * @param value Data to store
     * @param ttlInMs Time to live in milliseconds
     */
    set: <T>(key: string, value: T, ttlInMs: number): void => {
        if (typeof window === 'undefined') return;

        const now = new Date();
        const item: StorageItem<T> = {
            value,
            expiry: now.getTime() + ttlInMs,
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    /**
     * Get an item from localStorage, checking if it hasn't expired.
     * @param key Storage key
     * @returns The value or null if not found/expired
     */
    get: <T>(key: string): T | null => {
        if (typeof window === 'undefined') return null;

        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item: StorageItem<T> = JSON.parse(itemStr);
            const now = new Date();

            if (now.getTime() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return item.value;
        } catch (e) {
            console.error('Error parsing storage item', e);
            localStorage.removeItem(key);
            return null;
        }
    },

    /**
     * Remove an item from localStorage.
     * @param key Storage key
     */
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },

    /**
     * Clear all localStorage.
     */
    clear: (): void => {
        if (typeof window === 'undefined') return;
        localStorage.clear();
    }
};

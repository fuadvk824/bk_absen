import type { Ziggy } from 'ziggy-js';

declare global {
    interface Window {
        Ziggy: typeof Ziggy;
    }
}

export {};

export type * from './auth';
export type * from './navigation';
export type * from './ui';
import type { LucideIcon } from 'lucide-react';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};


export interface NavItem {
    title: string;
    icon?: LucideIcon;
    href?: string;
    children?: NavItem[];
}


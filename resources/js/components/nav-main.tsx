
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { NavItem } from '@/types';
import { useSidebar } from './ui/sidebar';

interface Props {
    items: NavItem[];
}

export function NavMain({ items }: Props) {
    const { url } = usePage();

    const { state, toggleSidebar } = useSidebar();
    const collapsed = state === 'collapsed';

    const [manualOpen, setManualOpen] = useState<string | null>(null);

    const activeParent = items.find((item) =>
        item.children?.some((child) => child.href && url.startsWith(child.href)),
    )?.title;

    return (
        <div className="space-y-1">
            {items.map((item) => {
                const isOpen = manualOpen === item.title || (manualOpen === null && activeParent === item.title);

                if (item.children) {
                    return (
                        <div key={item.title}>
                            <button
                                type="button"

                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted ${
                                    isOpen ? 'bg-muted font-medium' : ''
                                }`}

                                onClick={() => {
                                    if (collapsed) {
                                        toggleSidebar();
                                        return;
                                    }

                                    setManualOpen(isOpen ? null : item.title);
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    {item.icon && <item.icon size={18} />}
                                    {!collapsed && item.title}
                                </span>

                                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isOpen && !collapsed && (
                                <div className="mt-1 ml-6 space-y-1">
                                    {item.children.map((child) => {
                                        const isActive = child.href && url.startsWith(child.href);

                                        return (
                                            <Link
                                                key={child.title}
                                                href={child.href!}
                                                className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${
                                                    isActive ? 'bg-muted font-medium text-primary' : ''
                                                }`}
                                            >
                                                {!collapsed && child.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                }

                const isActive = item.href && url === item.href;

                return (
                    <Link
                        key={item.title}
                        href={item.href!}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted ${
                            isActive ? 'bg-muted font-medium text-primary' : ''
                        }`}
                    >
                        {item.icon && <item.icon size={18} />}
                        {!collapsed && item.title}
                    </Link>
                );
            })}
        </div>
    );
}

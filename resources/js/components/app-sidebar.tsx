import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Contact,
    CalendarArrowUp,
    UserPen,
    Building2,
    ClipboardList,
    ChartBarStacked,
    Landmark,
    Receipt,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Beranda',
        href: '/dashboard',
        icon: LayoutGrid,
    },

    {
        title: 'Kehadiran',
        href: '/attendance',
        icon: UserPen,
    },
    {
        title: 'Pengajuan',
        icon: CalendarArrowUp,
        children: [
            {
                title: 'Pengajuan Lembur',
                href: '/overtime',
            },
            {
                title: 'Pengajuan Cuti',
                href: '/leavesubmit',
            },
        ],
    },
    {
        title: 'Data Karyawan',
        icon: Contact,
        children: [
            {
                title: 'Karyawan',
                href: '/employee',
            },
            {
                title: 'Shift Karyawan',
                href: '/shift',
            },
            {
                title: 'Jadwal Kerja',
                href: '/workschedule',
            },
        ],
    },
    {
        title: 'Payroll',
        href: '/payroll',
        icon: Receipt,
    },
    {
        title: 'Kantor',
        icon: Building2,
        children: [
            {
                title: 'Kantor',
                href: '/office',
            },
            {
                title: 'Departemen',
                href: '/department',
            },
            {
                title: 'Jabatan',
                href: '/position',
            },
        ],
    },
    {
        title: 'Laporan',
        icon: ClipboardList,
        children: [
            {
                title: 'Rekapitulasi Lembur',
                href: '/laporan/overtime-report',
            },
            {
                title: 'Rekapitulasi Absensi',
                href: '/laporan/attendance-report',
                // href: '/rekapitulasi-presensi',
            },
            {
                title: 'Produktifitas Karyawan',
                href: '/produktifitas-karyawan',
            },
            {
                title: 'Rekap Laporan',
                href: '/rekap-laporan',
            },
        ],
    },
    {
        title: 'Kategori',
        icon: ChartBarStacked,
        children: [
            {
                title: 'Kategori Gaji',
                href: '/salary',
            },
            {
                title: 'Kategori Cuti',
                href: '/leave',
            },
            {
                title: 'Kategori Lembur',
                href: '/overtime-rate',
            },
            {
                title: 'Kategori Penilaian',
                href: '/kategori-penilaian',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

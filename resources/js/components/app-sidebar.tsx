import { Link, usePage } from '@inertiajs/react';
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
    Receipt,
    FolderCode,
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
// import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props }: any = usePage();
    const roles: string[] = props.auth?.user?.roles?.map((role: { name: string }) => role.name) ?? [];

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
                {
                    title: 'Pengajuan Libur',
                    href: '/offday',
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
                {
                    title: 'Surat',
                    href: '/letter',
                },
            ],
        },
        {
            title: 'Payroll',
            icon: Receipt,
            children: [
                {
                    title: 'Payroll',
                    href: '/payroll',
                },
                {
                    title: 'BPJS',
                    href: '/assign-bpjs'
                }
            ],
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
        {
            title: 'Developer',
            icon: FolderCode,
            children: [
                {
                    title: 'Easter Egg',
                    href: '/easter-egg-views',
                },
                {
                    title: 'Broadcast Email',
                    href: '/broadcast',
                },
            ],
            roles: ['super-admin'],
        },
    ];

    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.roles) return true;

        return item.roles.some((role) => roles.includes(role));
    });

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

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="scrollbar-none">
                {/* <NavMain items={mainNavItems} /> */}
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
 
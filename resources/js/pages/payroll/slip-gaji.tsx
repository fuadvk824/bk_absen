import { Head } from '@inertiajs/react';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { route } from 'ziggy-js';
import { ArrowLeft, Download } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

interface PayrollItem {
    name: string;
    keterangan?: string;
    amount: number;
}

interface Employee {
    name: string;
    employee_code: string;

    department?: {
        name: string;
    } | null;

    position?: {
        name: string;
    } | null;
}

interface Payroll {
    id: number;
    month: number;
    year: number;

    basic_salary: string;
    total_additions: string;
    total_deductions: string;
    net_salary: string;

    employee?: Employee;
}

interface Props {
    payroll: Payroll;
    employee: Employee;
    additions: PayrollItem[];
    deductions: PayrollItem[];
    periodStart: string;
    periodEnd: string;
    totalWorkDays: number;
}

/*
|--------------------------------------------------------------------------
| PDF STYLES
|--------------------------------------------------------------------------
*/

const styles = StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 40,
        paddingLeft: 45,
        paddingRight: 45,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#000000',
    },

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 8,
    },

    logoContainer: {
        width: 100,
        marginRight: 12,
    },

    logo: {
        width: 95,
        height: 50,
        objectFit: 'contain',
    },

    companySection: {
        flex: 1,
    },

    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    companyAddress: {
        fontSize: 8,
        marginBottom: 2,
    },

    slipSection: {
        width: 145,
        alignItems: 'flex-end',
    },

    slipTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },

    period: {
        fontSize: 8,
        marginBottom: 2,
    },

    /*
    |--------------------------------------------------------------------------
    | EMPLOYEE INFO
    |--------------------------------------------------------------------------
    */

    employeeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 20,
    },

    employeeInfo: {
        flexDirection: 'row',
    },

    employeeLabels: {
        width: 65,
    },

    employeeValues: {
        width: 180,
        marginLeft: 8,
    },

    employeeRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },

    employeeText: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    workDaysBox: {
        width: 105,
        borderWidth: 2,
        borderColor: '#000000',
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
    },

    workDaysTitle: {
        fontSize: 8,
        textDecoration: 'underline',
        marginBottom: 5,
    },

    workDaysNumber: {
        fontSize: 15,
        fontWeight: 'bold',
    },

    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    tableHeader: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderTopColor: '#000000',
        borderBottomColor: '#000000',
        paddingTop: 6,
        paddingBottom: 6,
    },

    tableHeaderColumn: {
        width: '50%',
    },

    tableHeaderColumnRight: {
        width: '50%',
        paddingLeft: 12,
    },

    tableHeaderText: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    columns: {
        flexDirection: 'row',
        columnGap: 10,
        paddingTop: 8,
    },

    column: {
        width: '50%',
    },

    itemRow: {
        flexDirection: 'row',
        marginBottom: 5,
        minHeight: 13,
    },

    itemName: {
        width: 105,
        fontSize: 8,
    },

    itemSeparator: {
        width: 8,
        fontSize: 8,
    },

    itemAmount: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
    },

    emptyItem: {
        fontSize: 8,
    },

    /*
    |--------------------------------------------------------------------------
    | TOTAL
    |--------------------------------------------------------------------------
    */

    totalSection: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderTopColor: '#000000',
        borderBottomColor: '#000000',
        paddingTop: 7,
        paddingBottom: 7,
        marginTop: 7,
    },

    totalColumn: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    totalColumnRight: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 12,
    },

    totalLabel: {
        fontSize: 8,
        fontWeight: 'bold',
    },

    totalAmount: {
        fontSize: 8,
        fontWeight: 'bold',
    },

    /*
    |--------------------------------------------------------------------------
    | TAKE HOME PAY
    |--------------------------------------------------------------------------
    */

    bottomSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 25,
    },

    takeHomePay: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 10,
    },

    takeHomeLabel: {
        fontSize: 9,
    },

    takeHomeItalic: {
        fontSize: 8,
        fontStyle: 'italic',
        marginTop: 2,
    },

    takeHomeAmount: {
        fontSize: 9,
        fontWeight: 'bold',
    },

    /*
    |--------------------------------------------------------------------------
    | SIGNATURE
    |--------------------------------------------------------------------------
    */

    signatureSection: {
        width: 150,
        alignItems: 'center',
        position: 'relative',
        minHeight: 90,
    },

    signatureText: {
        fontSize: 8,
    },

    signatureLogo: {
        width: 75,
        height: 45,
        objectFit: 'contain',
        opacity: 0.9,
        marginTop: 5,
        marginBottom: -2,
    },

    signatureName: {
        fontSize: 8,
        fontWeight: 'bold',
    },
});

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID').format(number);
};

const formatMonthYear = (month: number, year: number) => {
    return new Date(year, month - 1).toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
    });
};

/*
|--------------------------------------------------------------------------
| PAYROLL PDF DOCUMENT
|--------------------------------------------------------------------------
*/

const PayrollDocument = ({
    payroll,
    employee,
    additions,
    deductions,
    periodStart,
    periodEnd,
    totalWorkDays,
}: {
    payroll: Payroll;
    employee: Employee;
    additions: PayrollItem[];
    deductions: PayrollItem[];
    periodStart: string;
    periodEnd: string;
    totalWorkDays: number;
}) => {
    const totalPendapatan = Number(payroll.basic_salary) + Number(payroll.total_additions);
    const totalPotongan = Number(payroll.total_deductions);
    const netSalary = Number(payroll.net_salary);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image src="/logo/logo_gaji.jpg" style={styles.logo} />
                    </View>

                    <View style={styles.companySection}>
                        <Text style={styles.companyName}>BISA KULAK JATIM</Text>

                        <Text style={styles.companyAddress}>Jl. Raya Kepatihan No. 49, Kec. Menganti</Text>

                        <Text style={styles.companyAddress}>Kab. Gresik, Jawa Timur</Text>
                    </View>

                    <View style={styles.slipSection}>
                        <Text style={styles.slipTitle}>SLIP GAJI</Text>

                        <Text style={styles.period}>Periode {formatMonthYear(payroll.month, payroll.year)}</Text>

                        <Text style={styles.period}>
                            {periodStart} - {periodEnd}
                        </Text>
                    </View>
                </View>

                {/* EMPLOYEE INFO */}
                <View style={styles.employeeSection}>
                    <View style={styles.employeeInfo}>
                        <View style={styles.employeeLabels}>
                            <View style={styles.employeeRow}>
                                <Text style={styles.employeeText}>Nama</Text>

                                <Text style={styles.employeeText}>:</Text>
                            </View>

                            <View style={styles.employeeRow}>
                                <Text style={styles.employeeText}>ID</Text>

                                <Text style={styles.employeeText}>:</Text>
                            </View>
                        </View>

                        <View style={styles.employeeValues}>
                            <Text style={styles.employeeText}>{employee.name}</Text>

                            <Text style={[styles.employeeText, { marginTop: 5 }]}>{employee.employee_code}</Text>
                        </View>
                    </View>

                    <View style={styles.workDaysBox}>
                        <Text style={styles.workDaysTitle}>Jumlah Hari Kerja</Text>

                        <Text style={styles.workDaysNumber}>{totalWorkDays}</Text>
                    </View>
                </View>

                {/* TABLE HEADER */}
                <View style={styles.tableHeader}>
                    <View style={styles.tableHeaderColumn}>
                        <Text style={styles.tableHeaderText}>PENDAPATAN</Text>
                    </View>

                    <View style={styles.tableHeaderColumnRight}>
                        <Text style={styles.tableHeaderText}>POTONGAN</Text>
                    </View>
                </View>

                {/* ITEMS */}
                <View style={styles.columns}>
                    {/* ADDITIONS */}
                    <View style={styles.column}>
                        {additions.length > 0 ? (
                            additions.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>

                                    <Text style={styles.itemSeparator}>:</Text>

                                    <View style={styles.itemAmount}>
                                        <Text>Rp</Text>

                                        <Text>{formatRupiah(Number(item.amount))}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyItem}>-</Text>
                        )}
                    </View>

                    {/* DEDUCTIONS */}
                    <View style={styles.column}>
                        {deductions.length > 0 ? (
                            deductions.map((item, index) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.itemName}>{item.name}</Text>

                                    <Text style={styles.itemSeparator}>:</Text>

                                    <View style={styles.itemAmount}>
                                        <Text>Rp</Text>

                                        <Text>{formatRupiah(Number(item.amount))}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyItem}>-</Text>
                        )}
                    </View>
                </View>

                {/* TOTAL */}
                <View style={styles.totalSection}>
                    <View style={styles.totalColumn}>
                        <Text style={styles.totalLabel}>JUMLAH PENDAPATAN</Text>

                        <Text style={styles.totalAmount}>Rp {formatRupiah(totalPendapatan)}</Text>
                    </View>

                    <View style={styles.totalColumnRight}>
                        <Text style={styles.totalLabel}>JUMLAH POTONGAN</Text>

                        <Text style={styles.totalAmount}>Rp {formatRupiah(totalPotongan)}</Text>
                    </View>
                </View>

                {/* TAKE HOME PAY + SIGNATURE */}
                <View style={styles.bottomSection}>
                    <View style={styles.takeHomePay}>
                        <View>
                            <Text style={styles.takeHomeLabel}>GAJI YANG DITERIMA</Text>

                            <Text style={styles.takeHomeItalic}>(Take Home Pay)</Text>
                        </View>

                        <Text style={styles.takeHomeAmount}>Rp {formatRupiah(netSalary)}</Text>
                    </View>

                    <View style={styles.signatureSection}>
                        <Text style={styles.signatureText}>Dibuat Oleh :</Text>

                        <Image src="/logo/logo_gaji.jpg" style={styles.signatureLogo} />

                        <Text style={styles.signatureName}>Admin Payroll</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

/*
|--------------------------------------------------------------------------
| SLIP GAJI PAGE
|--------------------------------------------------------------------------
*/

export default function SlipGaji({
    payroll,
    employee,
    additions,
    deductions,
    periodStart,
    periodEnd,
    totalWorkDays,
}: Props) {
    const document = (
        <PayrollDocument
            payroll={payroll}
            employee={employee}
            additions={additions}
            deductions={deductions}
            periodStart={periodStart}
            periodEnd={periodEnd}
            totalWorkDays={totalWorkDays}
        />
    );

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: 'Payroll',
                    href: route('payroll.index'),
                },
                {
                    title: 'Preview Slip Gaji',
                    href: route('payroll.pdf', {
                        payroll: payroll.id,
                    }),
                },
            ]}
        >
            <Head title={`Slip Gaji - ${employee.name}`} />

            <div className="space-y-4 p-5">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Preview Slip Gaji</h1>

                        <p className="text-sm text-muted-foreground">
                            {employee.name} — {employee.employee_code}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* BACK */}
                        <Button variant="outline" onClick={() => window.history.back()} className="cursor-pointer">
                            <ArrowLeft className="mr-2 h-4 w-4" />

                            <span className="hidden sm:inline">Kembali</span>
                        </Button>

                        {/* DOWNLOAD */}
                        <PDFDownloadLink
                            document={document}
                            fileName={`Slip-Gaji-${employee.name}-${payroll.month}-${payroll.year}.pdf`}
                        >
                            {({ loading }) => (
                                <Button disabled={loading} className="cursor-pointer">
                                    <Download className="mr-2 h-4 w-4" />

                                    {loading ? 'Mempersiapkan...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* PDF PREVIEW */}
                <div className="overflow-hidden rounded-xl border bg-muted">
                    <PDFViewer width="100%" height="800" showToolbar={false}>
                        {document}
                    </PDFViewer>
                </div>
            </div>
        </AppLayout>
    );
}

// import React, { useRef } from 'react';
// import { useReactToPrint } from 'react-to-print';

// interface PayrollItem {
//     name: string;
//     keterangan?: string;
//     amount: number;
// }

// interface Employee {
//     name: string;
//     employee_code: string;
//     department?: {
//         name: string;
//     };
//     position?: {
//         name: string;
//     };
// }

// interface Payroll {
//     month: number;
//     year: number;

//     basic_salary: string;
//     total_additions: string;
//     total_deductions: string;
//     net_salary: string;

//     employee: Employee;
// }

// interface Props {
//     payroll: Payroll;
//     employee: Employee;
//     additions: PayrollItem[];
//     deductions: PayrollItem[];
//     periodStart: string;
//     periodEnd: string;
//     totalWorkDays: number;
// }

// export default function SlipGaji({
//     payroll,
//     employee,
//     additions,
//     deductions,
//     periodStart,
//     periodEnd,
//     totalWorkDays,
// }: Props) {
//     const printRef = useRef<HTMLDivElement>(null);

//     const handlePrint = useReactToPrint({
//         contentRef: printRef,
//         documentTitle: `Slip Gaji - ${employee.name}`,

//         fonts: [
//             {
//                 family: 'Roboto Condensed',
//                 source: '/fonts/RobotoCondensed-Regular.ttf',
//             },
//             {
//                 family: 'Roboto Condensed',
//                 source: '/fonts/RobotoCondensed-Bold.ttf',
//                 weight: 'bold',
//             },
//         ],
//     });

//     const formatRupiah = (number: number) => {
//         return new Intl.NumberFormat('id-ID').format(number);
//     };

//     return (
//         <div
//             className="min-h-screen bg-gray-100 p-5"
//             style={{
//                 fontFamily: '"Roboto Condensed", sans-serif',
//             }}
//         >
//             <div className="mb-5 flex justify-end print:hidden">
//                 <button onClick={() => handlePrint()} className="rounded bg-black px-4 py-2 text-white">
//                     Cetak PDF
//                 </button>
//             </div>

//             <div ref={printRef} className="mx-auto w-[210mm] bg-amber-50 p-5 text-black">
//                 <div className="flex items-center gap-3">
//                     <div className="w-44">
//                         <img src="/logo/logo_gaji.jpg" alt="" className="w-full object-contain" />
//                     </div>

//                     <div className="flex flex-1 justify-between border-b-2 border-black pb-2">
//                         <div>
//                             <h1 className="text-3xl font-bold">BISA KULAK JATIM</h1>

//                             <p className="text-xs">Jl. Raya Kepatihan No. 49, Kec. Menganti</p>

//                             <p className="text-xs">Kab. Gresik, Jawa Timur</p>
//                         </div>

//                         <div className="text-right">
//                             <h1 className="text-3xl font-bold">SLIP GAJI</h1>

//                             <p className="text-xs">
//                                 Periode{' '}
//                                 {new Date(payroll.year, payroll.month - 1).toLocaleString('id-ID', {
//                                     month: 'long',
//                                     year: 'numeric',
//                                 })}
//                             </p>

//                             <p className="text-xs italic">
//                                 {periodStart} - {periodEnd}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-6 flex w-full justify-between">
//                     <div className="flex w-1/2 space-y-1 text-xs font-bold">
//                         <div className="flex w-44 flex-col gap-2">
//                             <div className="flex w-full justify-between">
//                                 <span>Nama</span>
//                                 <span>:</span>
//                             </div>
//                             <div className="flex w-full justify-between">
//                                 <span>ID</span>
//                                 <span>:</span>
//                             </div>
//                         </div>

//                         <div className="flex w-44 flex-col gap-2 ps-3">
//                             <span>{employee.name}</span>
//                             <span>{employee.employee_code}</span>
//                         </div>
//                     </div>

//                     <div>
//                         <div className="border-2 border-black px-5 py-2 text-center text-xs">
//                             <div className="underline">Jumlah Hari Kerja</div>

//                             <div className="mt-1 text-lg font-bold">{totalWorkDays}</div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-6 w-full">
//                     <div className="flex border-y-2 border-black py-2 text-xs font-bold">
//                         <div className="w-1/2">PENDAPATAN</div>

//                         <div className="w-1/2 pl-2.5">POTONGAN</div>
//                     </div>

//                     <div className="flex gap-5 pt-3">
//                         <div className="w-1/2">
//                             {additions.length > 0 ? (
//                                 additions.map((item, index) => (
//                                     <div key={index} className="flex text-xs">
//                                         <div className="flex w-44 justify-between">
//                                             <span>{item.name}</span>
//                                             <span>:</span>
//                                         </div>

//                                         <div className="flex flex-1 justify-between ps-3">
//                                             <span>Rp</span>
//                                             <span>{formatRupiah(item.amount)}</span>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="text-xs">-</div>
//                             )}
//                         </div>

//                         <div className="w-1/2">
//                             {deductions.length > 0 ? (
//                                 deductions.map((item, index) => (
//                                     <div key={index} className="mb-1 flex justify-between text-xs">
//                                         <div className="flex w-44 justify-between">
//                                             <span>{item.name}</span>
//                                             <span>:</span>
//                                         </div>

//                                         <div className="flex flex-1 justify-between ps-3">
//                                             <span>Rp</span>
//                                             <span>{formatRupiah(item.amount)}</span>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="text-xs">-</div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="mt-3 flex border-y-2 border-black py-2 text-xs font-bold">
//                         <div className="flex w-1/2 justify-between pr-2.5">
//                             <div className="flex w-44 justify-between">
//                                 <span>JUMLAH PENDAPATAN</span>
//                                 <span>:</span>
//                             </div>

//                             <div className="flex flex-1 justify-between ps-3">
//                                 <span>Rp</span>
//                                 <span>{formatRupiah(Number(payroll.basic_salary) + Number(payroll.total_additions))}</span>
//                             </div>
//                         </div>
//                         <div className="flex w-1/2 justify-between pl-2.5">
//                             <div className="flex w-44 justify-between">
//                                 <span>JUMLAH POTONGAN</span>
//                                 <span>:</span>
//                             </div>

//                             <div className="flex flex-1 justify-between ps-3">
//                                 <span>Rp</span>
//                                 <span>{formatRupiah(Number(payroll.total_deductions))}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-between">
//                     <div className="flex w-1/2 pr-2.5 text-xs">
//                         <div className="flex w-44 flex-col">
//                             <div className="flex justify-between">
//                                 <span>GAJI YANG DITERIMA</span>
//                                 <span>:</span>
//                             </div>
//                             <div className="italic">(Take Home Pay)</div>
//                         </div>
//                         <div className="flex flex-1 justify-between ps-3">
//                             <span>Rp</span>
//                             <span>{formatRupiah(Number(payroll.net_salary))}</span>
//                         </div>
//                     </div>

//                     <div className="relative pr-10 text-xs">
//                         <div className="absolute inset-0 flex flex-col items-center justify-center">
//                             <span>Dibuat Oleh :</span>

//                             <span className="mt-10 font-bold">Admin Payroll</span>
//                         </div>

//                         <img src="/logo/logo_gaji.jpg" alt="" className="w-28 opacity-90" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

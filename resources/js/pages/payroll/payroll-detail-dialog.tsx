import { Payroll } from '@/types/payroll/payrollList';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
    open: boolean;

    onOpenChange: (open: boolean) => void;

    payroll: Payroll | null;
}

export default function PayrollDetailDialog({ open, onOpenChange, payroll }: Props) {
    if (!payroll) return null;
    const months = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const period = months[payroll.month - 1];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader className="gap-0">
                    <DialogTitle className="text-base">Payroll {payroll.employee.name}</DialogTitle>
                    <DialogDescription className="text-xs">
                        Rincian payroll per item periode {period} - {payroll.year}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                    <div className="space-y-1">
                        {payroll.items.length === 0 && (
                            <div className="text-xs text-muted-foreground">Tidak ada payroll item</div>
                        )}

                        {payroll.items.map((item) => (
                            <div key={item.id} className="rounded-md border p-2.5 text-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-semibold">{item.name}</div>
                                            <div
                                                className={`text-xs ${
                                                    item.type === 'addition'
                                                        ? 'font-semibold text-green-600'
                                                        : 'font-semibold text-red-600'
                                                }`}
                                            >
                                                Rp {Number(item.amount).toLocaleString('id-ID')}
                                            </div>
                                        </div>

                                        <div className="mb-2 text-[11px] text-muted-foreground">{item.type}</div>

                                        {item.name === 'Gaji Harian' && (
                                            <div className="w-full rounded-md bg-muted p-2 text-[11px]">
                                                <div>Keterangan: {item.keterangan}</div>
                                            </div>
                                        )}

                                        {item.source_detail?.type === 'attendance' && (
                                            <div className="w-full rounded-md bg-muted p-2 text-[11px]">
                                                <div>{item.source_detail.date}</div>

                                                <div>Keterangan: {item.keterangan}</div>
                                            </div>
                                        )}

                                        {item.source_detail?.type === 'overtime' && (
                                            <div className="w-full rounded-md bg-muted p-2 text-[11px]">
                                                <div>{item.source_detail.date}</div>

                                                <div>Keterangan: {item.keterangan}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="flex justify-between text-xs">
                            <span>Gaji Pokok</span>
                            <span>Rp {Number(payroll.basic_salary).toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span>Total Tambahan</span>
                            <span className="text-green-600">
                                Rp {Number(payroll.total_additions).toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex justify-between text-xs">
                            <span>Total Potongan</span>
                            <span className="text-red-600">
                                Rp {Number(payroll.total_deductions).toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="mt-2 flex justify-between border-t pt-2 font-bold text-xs">
                            <span>Gaji Bersih</span>
                            <span>Rp {Number(payroll.net_salary).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

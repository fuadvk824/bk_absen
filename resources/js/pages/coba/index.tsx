import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';

export default function Index() {
    const list = [
        { value: 1, pendapatan: 'Gaji Pokok', nPlus: '2.860.000' },
        { value: 2, pendapatan: 'Overtime (Lembur)', nPlus: '0' },
        { value: 3, pendapatan: 'Masuk Tgl. Merah', nPlus: '55.000' },
        { value: 4, pendapatan: 'Transportasi Khusus', nPlus: '0' },
    ];
    return (
        <AppLayout breadcrumbs={[{ title: 'Kantor', href: route('office.index') }]}>
            <Head title="Kantor" />

            <div className="p-5">
                <div className="w-full rounded-md border bg-amber-50 p-3 font-roboto-condensed">
                    <div className="flex items-center gap-2">
                        <div className="w-[22.5%]">
                            <img src="logo/logo_gaji.jpg" alt="" />
                        </div>
                        <div className="flex flex-1 justify-between border-b-2 border-black pb-1">
                            <div>
                                <h1 className=" text-2xl font-semibold">BISA KULAK JATIM</h1>
                                <p className="text-xs">Jl. Raya Kepatihan No. 49, Kec. Menganti</p>
                                <p className="text-xs">Kab. Gresik, Jawa Timur</p>
                            </div>
                            <div className='text-end'>
                                <h1 className=" text-2xl">SLIP GAJI</h1>
                                <p className="text-xs">Periode April</p>
                                <p className="text-xs italic">27 Maret - 25 April 2026</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex w-full gap-5 items-center justify-between">
                        <div className="flex w-1/2 flex-col">
                            <div className="flex w-full">
                                <div className="w-1/2 pe-2 text-xs font-bold">
                                    <div className="flex justify-between">
                                        <div>Nama</div>
                                        <div>:</div>
                                    </div>
                                </div>
                                <div className="w-1/2 pe-1 text-xs font-bold">Shofiyul Fuad</div>
                            </div>
                            <div className="flex w-full">
                                <div className="w-1/2 pe-2 text-xs font-bold">
                                    <div className="flex justify-between">
                                        <div>ID</div>
                                        <div>:</div>
                                    </div>
                                </div>
                                <div className="w-1/2 pe-1 text-xs font-bold">97</div>
                            </div>
                        </div>
                        <div className="flex w-1/2 justify-end text-xs">
                            <div className="flex flex-col items-center rounded-sm border-2 border-black p-2">
                                <span className="underline">Jumlah Hari kerja :</span>
                                <span className="font-bold">26</span>
                            </div>
                        </div>
                    </div>
                    <div className="my-5 w-full">
                        <div className=" flex gap-5 border-y-2 border-black text-xs font-semibold">
                            <div className="w-1/2 py-1">
                                <h1>PENDAPATAN</h1>
                            </div>

                            <div className="w-1/2 py-1">
                                <h1>POTONGAN</h1>
                            </div>
                        </div>
                        <div className="flex justify-between gap-5">
                            <table className="w-1/2">
                                <tbody className=" text-xs">
                                    {list.map((d) => (
                                        <tr key={d.value}>
                                            <td className="w-1/2 pe-2">
                                                <div className="flex justify-between">
                                                    <div>{d.pendapatan}</div>
                                                    <div>:</div>
                                                </div>
                                            </td>
                                            <td className="pe-2">
                                                <div className="flex justify-between">
                                                    <div>Rp</div>
                                                    <div>{d.nPlus}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <table className="w-1/2">
                                <tbody className=" text-xs">
                                    {list.map((d) => (
                                        <tr key={d.value}>
                                            <td className="w-1/2 pe-2">
                                                <div className="flex justify-between">
                                                    <div>{d.pendapatan}</div>
                                                    <div>:</div>
                                                </div>
                                            </td>
                                            <td className=" pe-2">
                                                <div className="flex justify-between">
                                                    <div>Rp</div>
                                                    <div>{d.nPlus}</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className=" flex gap-5 border-y-2 border-black text-xs font-semibold">
                            <div className="flex w-1/2 py-1">
                                <div className='w-1/2'>JUMLAH PENDAPATAN</div>

                                <div className="flex flex-1 justify-between pe-2">
                                    <div>Rp</div>
                                    <div>2.915.000</div>
                                </div>
                            </div>

                            <div className="flex w-1/2 justify-between py-1">
                                <div className='w-1/2'>JUMLAH POTONGAN</div>

                                <div className="flex flex-1 justify-between pe-2">
                                    <div>Rp</div>
                                    <div>-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="my-5 flex w-full items-center justify-between gap-5 ">
                        <div className="flex w-1/2 flex-col">
                            <div className="flex w-full">
                                <div className="w-1/2 pe-2 text-xs font-bold">
                                    <div className="flex justify-between">
                                        <div>GAJI YANG DITERIMA</div>
                                        <div>:</div>
                                    </div>
                                </div>
                                <div className="w-1/2 pe-2 text-xs font-bold">
                                    <div className="flex justify-between">
                                        <div>Rp</div>
                                        <div>2.915.000</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full text-xs italic">(Take Home Pay)</div>
                        </div>
                        <div className="relative flex w-1/2 justify-end pe-10 text-xs">
                            <div className="group flex">
                                <div className="absolute flex translate-x-6 -translate-y-2 flex-col items-center justify-center gap-10 object-contain">
                                    <span className="z-10">Dibuat oleh :</span>

                                    <span className="z-10 font-bold">Admin payroll</span>
                                </div>

                                <img src="logo/logo_gaji.jpg" alt="" className="h-auto w-30" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
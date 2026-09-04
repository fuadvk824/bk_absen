//  Schema::create('letters', function (Blueprint $table) {
//             $table->id();

//             $table->foreignId('employee_id')
//                 ->nullable()
//                 ->constrained()
//                 ->nullOnDelete();
//             $table->string('name')->index();
//             $table->string('name_office')->index();

//             $table->string('nomor_surat')->unique();
//             $table->enum('jenis_surat', [
//                 'SP1',
//                 'SP2',
//                 'SP3',
//                 'probation',
//                 'paklaring',
//             ]);

//             $table->date('tanggal_surat');
//             $table->text('alasan_surat');

//             $table->timestamps();

//             $table->index('employee_id');
//             $table->index('jenis_surat');
//             $table->index('tanggal_surat');
//         });//
//         <?php

// namespace App\Http\Resources\Web;

// use Illuminate\Http\Request;
// use Illuminate\Http\Resources\Json\JsonResource;

// class LetterResource extends JsonResource
// {
//     /**
//      * Transform the resource into an array.
//      *
//      * @return array<string, mixed>
//      */
//     public function toArray(Request $request): array
//     {
//         return [
//             'id' => $this->id,
//             'employee_id' => $this->employee_id,
//             'name' => $this->name,
//             'name_office' => $this->name_office,
//             'nomor_surat' => $this->nomor_surat,
//             'jenis_surat' => $this->jenis_surat,
//             'tanggal_surat' => $this->tanggal_surat?->format('Y-m-d'),
//             'alasan_surat' => $this->alasan_surat,
//         ];
//     }
// }//
// <?php

// namespace App\Http\Controllers\Web;

// use App\Http\Controllers\Controller;
// use App\Http\Resources\Web\LetterResource;
// use App\Models\Employee;
// use App\Models\Letter;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
// use Inertia\Inertia;

// class LetterController extends Controller
// {
//     public function index(Request $request)
//     {
//         $perPage = $request->get('perPage', 10);

//         $letters = Letter::query()
//             ->when($request->search, function ($q) use ($request) {
//                 $search = $request->search;

//                 $q->where(function ($query) use ($search) {
//                     $query->where('name', 'like', '%' . $search . '%')
//                         ->orWhere('nomor_surat', 'like', '%' . $search . '%');
//                 });
//             })
//             ->when($request->jenis_surat, function ($q) use ($request) {
//                 $q->where('jenis_surat', $request->jenis_surat);
//             })
//             ->latest('tanggal_surat')
//             ->paginate($perPage)
//             ->withQueryString();

//         $employees = Employee::query()
//             ->where('status', '!=', 'inactive')
//             ->orderBy('name', 'asc')
//             ->get([
//                 'id',
//                 'employee_code',
//                 'name',
//             ]);

//         return Inertia::render('data-karyawan/letter/index', [
//             'letters' => LetterResource::collection($letters)
//                 ->response()
//                 ->getData(true),

//             'employees' => $employees,

//             'filters' => [
//                 'search' => $request->search,
//                 'jenis_surat' => $request->jenis_surat,
//                 'perPage' => $perPage,
//             ],
//         ]);
//     }

//     public function store(Request $request)
//     {
//         $validated = $request->validate([
//             'employee_id' => ['required', 'exists:employees,id'],
//             'nomor_surat' => ['required', 'string', 'max:255', 'unique:letters,nomor_surat'],
//             'jenis_surat' => [
//                 'required',
//                 'in:SP1,SP2,SP3,probation,paklaring',
//             ],
//             'tanggal_surat' => ['required', 'date'],
//             'alasan_surat' => ['required', 'string'],
//         ]);

//         DB::transaction(function () use ($validated) {
//             $employee = Employee::with('office')->findOrFail($validated['employee_id']);

//             Letter::create([
//                 'employee_id' => $employee->id,
//                 'name' => $employee->name,
//                 'name_office' => $employee->office?->name ?? '-',
//                 'nomor_surat' => $validated['nomor_surat'],
//                 'jenis_surat' => $validated['jenis_surat'],
//                 'tanggal_surat' => $validated['tanggal_surat'],
//                 'alasan_surat' => $validated['alasan_surat'],
//             ]);
//         });

//         return redirect()
//             ->route('letter.index')
//             ->with('success', 'Data surat berhasil ditambahkan.');
//     }

//     public function update(Request $request, Letter $letter)
//     {
//         $validated = $request->validate([
//             'employee_id' => ['required', 'exists:employees,id'],
//             'nomor_surat' => [
//                 'required',
//                 'string',
//                 'max:255',
//                 'unique:letters,nomor_surat,' . $letter->id,
//             ],
//             'jenis_surat' => [
//                 'required',
//                 'in:SP1,SP2,SP3,probation,paklaring',
//             ],
//             'tanggal_surat' => ['required', 'date'],
//             'alasan_surat' => ['required', 'string'],
//         ]);

//         DB::transaction(function () use ($validated, $letter) {
//             $employee = Employee::with('office')->findOrFail($validated['employee_id']);

//             $letter->update([
//                 'employee_id' => $employee->id,
//                 'name' => $employee->name,
//                 'name_office' => $employee->office?->name ?? '-',
//                 'nomor_surat' => $validated['nomor_surat'],
//                 'jenis_surat' => $validated['jenis_surat'],
//                 'tanggal_surat' => $validated['tanggal_surat'],
//                 'alasan_surat' => $validated['alasan_surat'],
//             ]);
//         });

//         return redirect()
//             ->route('letter.index')
//             ->with('success', 'Data surat berhasil diperbarui.');
//     }

//     public function destroy(Letter $letter)
//     {
//         $letter->delete();

//         return redirect()
//             ->route('letter.index')
//             ->with('success', 'Data surat berhasil dihapus.');
//     }

//     public function pdf(Letter $letter)
//     {
//         return inertia('data-karyawan/letter/pdf', [
//             'letter' => [
//                 'id' => $letter->id,
//                 'employee_id' => $letter->employee_id,
//                 'name' => $letter->name,
//                 'jabatan' => $letter->employee?->position->name,
//                 'nomor_surat' => $letter->nomor_surat,
//                 'jenis_surat' => $letter->jenis_surat,
//                 'tanggal_surat' => $letter->tanggal_surat?->locale('id')->translatedFormat('d F Y'),
//                 'alasan_surat' => $letter->alasan_surat,
//                 'name_office' => $letter->employee?->office->name,
//             ],
//         ]);
//     }
   
// }
// //import { Head, router } from '@inertiajs/react';
// import { route } from 'ziggy-js';
// import type { VisibilityState } from '@tanstack/react-table';
// import { useState } from 'react';

// import { DataTable } from '@/components/table/datatable';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import AppLayout from '@/layouts/app-layout';

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// import type { PaginationMeta } from '@/types/pagination';
// import type { Letter, LetterEmployee, LetterType } from '@/types/type-table/letter';

// import { useTableActions } from '@/lib/useTableAction';
// import { Mail, RefreshCw } from 'lucide-react';

// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { columnLetters } from './column-letter';
// import Form from './form';

// interface Props {
//     letters: {
//         data: Letter[];
//         meta: PaginationMeta;
//     };

//     employees: LetterEmployee[];

//     filters: {
//         search?: string;
//         jenis_surat?: LetterType;
//         perPage?: number;
//     };
// }

// export default function Index({ letters, employees, filters }: Props) {
//     const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const allColumns = ['name', 'name_office', 'nomor_surat', 'jenis_surat', 'tanggal_surat', 'alasan_surat'];

//     const [localFilters, setLocalFilters] = useState({
//         search: filters.search ?? '',
//         jenis_surat: filters.jenis_surat ?? '',
//         perPage: filters.perPage ?? 10,
//     });

//     const { handleFilterChange } = useTableActions({
//         filters: localFilters,
//         indexRoute: 'letter.index',
//         exportRoute: 'letter.export',
//         allColumns,
//     });

//     const handleResetFilters = () => {
//         setIsRefreshing(true);

//         const defaultFilters = {
//             search: '',
//             jenis_surat: '',
//             perPage: 10,
//         };

//         setLocalFilters(defaultFilters);

//         router.get(
//             route('letter.index'),
//             {},
//             {
//                 replace: true,
//                 onFinish: () => setIsRefreshing(false),
//             },
//         );
//     };

//     const [open, setOpen] = useState(false);
//     const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

//     const openCreate = () => {
//         setSelectedLetter(null);
//         setOpen(true);
//     };

//     const openEdit = (letter: Letter) => {
//         setSelectedLetter(letter);
//         setOpen(true);
//     };

//     return (
//         <AppLayout
//             breadcrumbs={[
//                 {
//                     title: 'Surat',
//                     href: route('letter.index'),
//                 },
//             ]}
//         >
//             <Head title="Surat" />

//             <div className="space-y-4 p-5">
//                 <div className="flex items-center justify-between">
//                     <h1 className="text-xl font-semibold">
//                         <span className="hidden sm:inline">Data</span> Surat
//                     </h1>

//                     <div className="flex gap-2">
//                         <Button variant="outline" onClick={handleResetFilters} className="cursor-pointer">
//                             <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />

//                             <span className="hidden sm:block">Refresh</span>
//                         </Button>

//                         <Button className="cursor-pointer text-xs" onClick={openCreate}>
//                             <Mail className="h-4 w-4" />

//                             <span className="hidden sm:block">Tambah</span>
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                     <div className="space-y-1">
//                         <Label className="text-[11px]">Cari Surat</Label>

//                         <Input
//                             placeholder="Nama, nomor surat..."
//                             value={localFilters.search}
//                             onChange={(e) => handleFilterChange(localFilters, setLocalFilters, 'search', e.target.value)}
//                             className="h-7 p-4 placeholder:text-xs"
//                         />
//                     </div>

//                     <div className="space-y-1">
//                         <Label>Jenis Surat</Label>

//                         <Select
//                             value={localFilters.jenis_surat}
//                             onValueChange={(value) =>
//                                 handleFilterChange(
//                                     localFilters,
//                                     setLocalFilters,
//                                     'jenis_surat',
//                                     value === 'all' ? '' : value,
//                                 )
//                             }
//                         >
//                             <SelectTrigger className="h-7 p-4">
//                                 <SelectValue placeholder="Semua jenis surat" />
//                             </SelectTrigger>

//                             <SelectContent>
//                                 <SelectItem value="all">Semua</SelectItem>
//                                 <SelectItem value="SP1">SP1</SelectItem>
//                                 <SelectItem value="SP2">SP2</SelectItem>
//                                 <SelectItem value="SP3">SP3</SelectItem>
//                                 <SelectItem value="probation">Probation</SelectItem>
//                                 <SelectItem value="paklaring">Paklaring</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 </div>

//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogContent className="sm:max-w-2xl">
//                         <DialogHeader>
//                             <DialogTitle>{selectedLetter ? 'Edit Surat' : 'Tambah Surat'}</DialogTitle>

//                             <DialogDescription>
//                                 {selectedLetter
//                                     ? 'Perbarui data surat yang dipilih dan simpan perubahan.'
//                                     : 'Tambahkan surat baru ke dalam sistem.'}
//                             </DialogDescription>
//                         </DialogHeader>

//                         <Form
//                             close={() => setOpen(false)}
//                             employees={employees}
//                             initialData={
//                                 selectedLetter
//                                     ? {
//                                           id: selectedLetter.id,
//                                           employee_id: selectedLetter.employee_id,
//                                           name: selectedLetter.name,
//                                           nomor_surat: selectedLetter.nomor_surat,
//                                           jenis_surat: selectedLetter.jenis_surat,
//                                           tanggal_surat: selectedLetter.tanggal_surat,
//                                           alasan_surat: selectedLetter.alasan_surat,
//                                       }
//                                     : undefined
//                             }
//                         />
//                     </DialogContent>
//                 </Dialog>

//                 <DataTable<Letter>
//                     columns={columnLetters(openEdit)}
//                     data={letters.data}
//                     meta={letters.meta}
//                     columnVisibility={columnVisibility}
//                     onColumnVisibilityChange={setColumnVisibility}
//                     perPage={localFilters.perPage}
//                     onPerPageChange={(value) => handleFilterChange(localFilters, setLocalFilters, 'perPage', value)}
//                 />
//             </div>
//         </AppLayout>
//     );
// }
// //
// import { router } from '@inertiajs/react';
// import type { ColumnDef } from '@tanstack/react-table';
// import { FileText, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';
// import { route } from 'ziggy-js';
// import { useState } from 'react';
// import { toast } from 'sonner';

// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';

// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogMedia,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from '@/components/ui/alert-dialog';

// import type { Letter, LetterType } from '@/types/type-table/letter';

// const handleToast = (page: any) => {
//     const flash = page.props.flash as {
//         success?: string;
//         error?: string;
//     };

//     if (flash?.success) {
//         toast.success(flash.success);
//     }

//     if (flash?.error) {
//         toast.error(flash.error);
//     }
// };

// const deleteLetter = (id: number) => {
//     router.delete(
//         route('letter.destroy', {
//             letter: id,
//         }),
//         {
//             preserveScroll: true,
//             onSuccess: handleToast,
//         },
//     );
// };

// export const columnLetters = (onEdit: (letter: Letter) => void): ColumnDef<Letter>[] => [
//     {
//         id: 'select',

//         header: ({ table }) => (
//             <Checkbox
//                 checked={table.getIsAllPageRowsSelected()}
//                 onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//             />
//         ),

//         cell: ({ row }) => (
//             <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
//         ),

//         enableSorting: false,
//         enableHiding: false,
//     },

//     {
//         accessorKey: 'name',
//         header: 'Karyawan',
//         cell: ({ row }) => row.getValue('name') ?? '-',
//     },

//     {
//         accessorKey: 'name_office',
//         header: 'Kantor',
//         cell: ({ row }) => row.getValue('name_office') ?? '-',
//     },

//     {
//         accessorKey: 'nomor_surat',
//         header: 'Nomor Surat',
//         cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue('nomor_surat')}</span>,
//     },

//     {
//         accessorKey: 'jenis_surat',
//         header: 'Jenis Surat',
//         cell: ({ row }) => {
//             const value = row.getValue('jenis_surat') as LetterType;

//             const labels: Record<LetterType, string> = {
//                 SP1: 'SP1',
//                 SP2: 'SP2',
//                 SP3: 'SP3',
//                 probation: 'Probation',
//                 paklaring: 'Paklaring',
//             };

//             return <span className="font-medium">{labels[value]}</span>;
//         },
//     },

//     {
//         accessorKey: 'tanggal_surat',
//         header: 'Tanggal Surat',
//         cell: ({ row }) => {
//             const value = row.getValue('tanggal_surat') as string;

//             if (!value) return '-';

//             const [year, month, day] = value.split('-');

//             return `${day}-${month}-${year}`;
//         },
//     },

//     {
//         id: 'actions',
//         header: 'Action',
//         enableHiding: false,

//         cell: ({ row }) => {
//             const letter = row.original;

//             const [open, setOpen] = useState(false);

//             const handleDelete = () => {
//                 deleteLetter(letter.id);
//                 setOpen(false);
//             };

//             return (
//                 <DropdownMenu open={open} onOpenChange={setOpen}>
//                     <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon">
//                             <MoreHorizontal />
//                         </Button>
//                     </DropdownMenuTrigger>

//                     <DropdownMenuContent align="end">
//                         <DropdownMenuItem
//                             onClick={() =>
//                                 (window.location.href = route('letter.pdf', {
//                                     letter: letter.id,
//                                 }))
//                             }
//                             className="cursor-pointer"
//                         >
//                             <FileText />
//                             Lihat Surat
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => onEdit(letter)} className="cursor-pointer text-gray-500">
//                             <SquarePen className="text-gray-500" />
//                             Edit
//                         </DropdownMenuItem>

//                         <AlertDialog>
//                             <AlertDialogTrigger asChild>
//                                 <DropdownMenuItem
//                                     className="cursor-pointer text-red-600"
//                                     onSelect={(e) => e.preventDefault()}
//                                 >
//                                     <Trash2 className="text-red-600" />
//                                     Delete
//                                 </DropdownMenuItem>
//                             </AlertDialogTrigger>

//                             <AlertDialogContent size="sm">
//                                 <AlertDialogHeader>
//                                     <AlertDialogMedia>
//                                         <Trash2 className="text-red-600" />
//                                     </AlertDialogMedia>

//                                     <AlertDialogTitle>Delete Surat</AlertDialogTitle>

//                                     <AlertDialogDescription>
//                                         Apakah kamu yakin ingin menghapus surat milik{' '}
//                                         <span className="text-red-600 underline">{letter.name}</span>?
//                                     </AlertDialogDescription>
//                                 </AlertDialogHeader>

//                                 <AlertDialogFooter>
//                                     <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>

//                                     <AlertDialogAction className="cursor-pointer bg-red-600" onClick={handleDelete}>
//                                         Delete
//                                     </AlertDialogAction>
//                                 </AlertDialogFooter>
//                             </AlertDialogContent>
//                         </AlertDialog>
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//             );
//         },
//     },
// ];
// //
// import { Head, router } from '@inertiajs/react';
// import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
// import { route } from 'ziggy-js';

// import { ArrowLeft, Download } from 'lucide-react';

// import AppLayout from '@/layouts/app-layout';
// import { Button } from '@/components/ui/button';

// type LetterType = 'SP1' | 'SP2' | 'SP3' | 'probation' | 'paklaring';

// interface Letter {
//     id: number;
//     employee_id: number;
//     name: string;
//     jabatan: string;
//     nomor_surat: string;
//     jenis_surat: LetterType;
//     tanggal_surat: string;
//     alasan_surat: string;
//     name_office?: string;
// }

// interface Props {
//     letter: Letter;
// }

// const styles = StyleSheet.create({
//     page: {
//         paddingTop: 42,
//         paddingBottom: 45,
//         paddingLeft: 55,
//         paddingRight: 55,

//         fontFamily: 'Times-Roman',
//         fontSize: 11,
//         color: '#111111',

//         borderWidth: 1,
//         borderColor: '#c9a227',
//     },

//     // KOP SURAT____________________________________________________________

//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingBottom: 5,
//         borderBottomWidth: 1.5,
//         borderBottomColor: '#111111',
//     },

//     logoContainer: {
//         width: 135,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginRight: 15,
//     },

//     logo: {
//         width: 130,
//         height: 80,
//         objectFit: 'contain',
//     },

//     companyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//     },

//     companyName: {
//         fontFamily: 'Times-Bold',
//         fontSize: 17,
//         marginBottom: 4,
//     },

//     companyAddress: {
//         fontSize: 10,
//         lineHeight: 1.3,
//     },

//     companyContact: {
//         fontSize: 10,
//         marginTop: 2,
//     },

//     // JUDUL_______________________________________________________________

//     titleContainer: {
//         alignItems: 'center',
//         marginTop: 18,
//         marginBottom: 18,
//     },

//     title: {
//         fontFamily: 'Times-Bold',
//         fontSize: 12,
//         textDecoration: 'underline',
//         marginBottom: 4,
//     },

//     // TANGGAL_____________________________________________________________

//     beetwen: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },

//     dateContainer: {
//         alignItems: 'flex-end',
//         marginBottom: 2,
//     },

//     date: {
//         fontSize: 11,
//     },

//     // INFORMASI SURAT_____________________________________________________

//     letterInfo: {
//         width: '50%',
//         marginTop: 2,
//         marginBottom: 20,
//     },

//     infoRow: {
//         flexDirection: 'row',
//         marginBottom: 3,
//     },

//     infoLabel: {
//         width: 55,
//     },

//     infoSeparator: {
//         width: 12,
//     },

//     infoValue: {
//         flex: 1,
//     },

//     // PENERIMA___________________________________________________________

//     recipient: {
//         marginBottom: 20,
//     },

//     recipientLine: {
//         marginBottom: 2,
//     },

//     // ISI SURAT__________________________________________________________

//     paragraph: {
//         fontSize: 11,
//         lineHeight: 1.35,
//         textAlign: 'justify',
//         marginBottom: 13,
//     },

//     bold: {
//         fontFamily: 'Times-Bold',
//     },

//     // PENUTUP____________________________________________________________

//     closing: {
//         fontSize: 11,
//         lineHeight: 1.35,
//         marginTop: 2,
//         textAlign: 'justify',
//     },

//     // TANDA TANGAN_______________________________________________________

//     signatureSection: {
//         marginTop: 35,
//     },

//     signatureRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },

//     signatureColumn: {
//         width: '42%',
//         alignItems: 'center',
//     },

//     signatureColumnCenter: {
//         width: '42%',
//         alignItems: 'center',
//         marginTop: 25,
//         marginLeft: '29%',
//     },

//     signatureLabel: {
//         fontSize: 11,
//         marginBottom: 25,
//     },

//     signaturePosition: {
//         fontSize: 11,
//         textDecoration: 'underline',
//     },

//     signatureName: {
//         fontSize: 11,
//         textDecoration: 'underline',
//     },

//     // AREA TTD__________________________________________________________

//     signatureSpace: {
//         height: 25,
//     },
// });

// const letterTypeLabels: Record<LetterType, string> = {
//     SP1: 'SURAT PERINGATAN PERTAMA (SP 1)',
//     SP2: 'SURAT PERINGATAN KEDUA (SP 2)',
//     SP3: 'SURAT PERINGATAN KETIGA (SP 3)',
//     probation: 'SURAT PROBATION',
//     paklaring: 'SURAT PAKLARING',
// };

// const formatDate = (date: string) => {
//     return date || '-';
// };

// const getWarningNumber = (type: LetterType) => {
//     switch (type) {
//         case 'SP1':
//             return 'Pertama (SP 1)';
//         case 'SP2':
//             return 'Kedua (SP 2)';
//         case 'SP3':
//             return 'Ketiga (SP 3)';
//         default:
//             return '';
//     }
// };

// const getNoteSP = (type: LetterType) => {
//     switch (type) {
//         case 'SP1':
//             return 'Kedua (SP 2)';
//         case 'SP2':
//             return 'Ketiga (SP 3)';
//         default:
//             return '';
//     }
// };

// const capitalize = (text?: string | null) => {
//     if (!text) return 'Bisa Kulak';

//     return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
// };

// const LetterDocument = ({ letter }: { letter: Letter }) => {
//     const isWarning = letter.jenis_surat === 'SP1' || letter.jenis_surat === 'SP2';
//     const isPhk = letter.jenis_surat === 'SP3';

//     const renderWarning = () => (
//         <>
//             <Text style={styles.paragraph}>
//                 Berdasarkan hasil evaluasi yang telah dilakukan, kami menemukan bahwa Saudara{' '}
//                 <Text style={styles.bold}>{letter.alasan_surat}</Text>
//                 {'. '}
//                 Sehingga hal tersebut berdampak pada kelancaran operasional Perusahaan.
//             </Text>

//             <Text style={styles.paragraph}>
//                 Sehubungan dengan hal tersebut, kami memberikan{' '}
//                 <Text style={styles.bold}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text> kepada{' '}
//                 <Text style={styles.bold}>Sdr. {letter.name || '-'}</Text> sebagai bentuk pembinaan agar Saudara dapat
//                 bekerja dengan lebih baik dan dapat bekerjasama dengan tim dalam menjalankan tugas sesuai ketentuan dan
//                 standar kerja yang berlaku di Perusahaan.
//             </Text>

//             <Text style={styles.paragraph}>
//                 <Text style={styles.bold}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text> ini sebagai
//                 pembinaan dan peringatan untuk tidak mengulangi perbuatan serupa di masa mendatang. Apabila kejadian ini
//                 terulang kembali, maka perusahaan berhak memberikan{' '}
//                 <Text style={styles.bold}>Surat Peringatan {getNoteSP(letter.jenis_surat)} </Text>
//                 hingga pemutusan hubungan kerja (PHK) sesuai ketentuan yang berlaku.
//             </Text>

//             <Text style={styles.closing}>Demikian surat ini dibuat agar di laksanakan dan dipatuhi oleh Saudara.</Text>
//         </>
//     );

//     const renderPhk = () => (
//         <>
//             <Text style={styles.paragraph}>
//                 Sehubungan dengan hasil evaluasi kinerja dan kedisiplinan kerja Saudara, serta mengacu pada{' '}
//                 <Text style={styles.bold}>Surat Peringatan Kedua (SP 2)</Text> yang telah diberikan sebelumnya, dengan ini
//                 perusahaan menyampaikan <Text style={styles.bold}>Surat Peringatan Ketiga (SP 3)</Text> atas pelanggaran yang
//                 kembali Saudara lakukan. Adapun pelanggaran tersebut antara lain:
//             </Text>

//             <Text style={styles.paragraph}>{letter.alasan_surat}</Text>

//             <Text style={styles.paragraph}>
//                 Melalui Surat Peringatan Ketiga ini, perusahaan memberikan{' '}
//                 <Text style={styles.bold}>peringatan terakhir</Text> kepada Saudara. Apabila di kemudian hari Saudara kembali
//                 melakukan pelanggaran serupa atau pelanggaran lainnya, maka perusahaan akan mengambil tindakan tegas sesuai
//                 dengan ketentuan yang berlaku.
//             </Text>

//             <Text style={styles.closing}>
//                 Demikian surat peringatan ini disampaikan untuk menjadi perhatian dan perbaikan Saudara ke depannya. Atas
//                 perhatian Saudara, kami ucapkan terima kasih
//             </Text>
//         </>
//     );

//     const renderOther = () => (
//         <>
//             <Text style={styles.paragraph}>
//                 Dengan ini perusahaan memberikan <Text style={styles.bold}>{letterTypeLabels[letter.jenis_surat]}</Text>{' '}
//                 kepada karyawan tersebut di atas sehubungan dengan alasan sebagai berikut:
//             </Text>

//             <Text style={styles.paragraph}>
//                 <Text style={styles.bold}>Alasan:</Text> {letter.alasan_surat || '-'}
//             </Text>

//             <Text style={styles.closing}>Demikian surat ini dibuat agar di laksanakan dan dipatuhi oleh Saudara.</Text>
//         </>
//     );

//     const renderLetterContent = () => {
//         if (isWarning) {
//             return renderWarning();
//         }

//         if (isPhk) {
//             return renderPhk();
//         }

//         return renderOther();
//     };

//     return (
//         <Document>
//             <Page size="A4" style={styles.page}>
//                 {/* ======================================================
//                     KOP SURAT
//                 ====================================================== */}

//                 <View style={styles.header}>
//                     <View style={styles.logoContainer}>
//                         <Image src="/logo/logo_gaji.jpg" style={styles.logo} />
//                     </View>

//                     <View style={styles.companyContainer}>
//                         <Text style={styles.companyName}>BISA KULAK DEPT. STORE</Text>

//                         <Text style={styles.companyAddress}>Jalan Kepatihan Industri No.49, Guntung, Kepatihan,</Text>

//                         <Text style={styles.companyAddress}>Kec. Menganti, Kabupaten Gresik, Jawa Timur</Text>

//                         <Text style={styles.companyContact}>Telp 0851 7337 2019 Kode Pos 61174</Text>
//                     </View>
//                 </View>

//                 {/* ======================================================
//                     JUDUL
//                 ====================================================== */}

//                 <View style={styles.titleContainer}>
//                     <Text style={styles.title}>SURAT PERINGATAN</Text>
//                 </View>

//                 {/* ======================================================
//                     INFORMASI SURAT & TANGGAL
//                 ====================================================== */}
//                 <View style={styles.beetwen}>
//                     <View style={styles.letterInfo}>
//                         <View style={styles.infoRow}>
//                             <Text style={styles.infoLabel}>Nomor</Text>
//                             <Text style={styles.infoSeparator}>:</Text>
//                             <Text style={styles.infoValue}>{letter.nomor_surat || '-'}</Text>
//                         </View>

//                         <View style={styles.infoRow}>
//                             <Text style={styles.infoLabel}>Hal</Text>
//                             <Text style={styles.infoSeparator}>:</Text>
//                             <Text style={styles.infoValue}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text>
//                         </View>

//                         <View style={styles.infoRow}>
//                             <Text style={styles.infoLabel}>Lampiran</Text>
//                             <Text style={styles.infoSeparator}>:</Text>
//                             <Text style={styles.infoValue}>-</Text>
//                         </View>
//                     </View>

//                     <View style={styles.dateContainer}>
//                         <Text style={styles.date}>Gresik, {formatDate(letter.tanggal_surat)}</Text>
//                     </View>
//                 </View>

//                 {/* ======================================================
//                     PENERIMA
//                 ====================================================== */}

//                 <View style={styles.recipient}>
//                     <Text style={styles.recipientLine}>Yth. Sdr/i. {letter.name || '-'}</Text>

//                     <Text style={styles.recipientLine}>
//                         {letter.jabatan} {capitalize(letter.name_office)}
//                     </Text>

//                     <Text style={styles.recipientLine}>Di tempat</Text>
//                 </View>

//                 {/* ======================================================
//                     ISI SURAT SP
//                 ====================================================== */}

//                 {renderLetterContent()}

//                 {/* ======================================================
//                     TANDA TANGAN
//                 ====================================================== */}

//                 <View style={styles.signatureSection}>
//                     <View style={styles.signatureRow}>
//                         {/* KIRI */}
//                         <View style={styles.signatureColumn}>
//                             <Text style={styles.signatureLabel}>Hormat saya,</Text>

//                             <View style={styles.signatureSpace} />

//                             <Text style={styles.signaturePosition}>Bisa Kulak Pusat</Text>
//                         </View>

//                         {/* KANAN */}
//                         <View style={styles.signatureColumn}>
//                             <Text style={styles.signatureLabel}>Mengetahui,</Text>

//                             <View style={styles.signatureSpace} />

//                             <Text style={styles.signatureName}>Bagus I Made Saputra</Text>
//                         </View>
//                     </View>

//                     {/* TENGAH BAWAH */}
//                     <View style={styles.signatureColumnCenter}>
//                         <Text style={styles.signatureLabel}>Menyetujui,</Text>

//                         <View style={styles.signatureSpace} />

//                         <Text style={styles.signatureName}>{letter.name || '-'}</Text>
//                     </View>
//                 </View>
//             </Page>
//         </Document>
//     );
// };

// export default function LetterPdf({ letter }: Props) {
//     return (
//         <AppLayout
//             breadcrumbs={[
//                 {
//                     title: 'Surat',
//                     href: route('letter.index'),
//                 },
//                 {
//                     title: 'Preview Surat',
//                     href: route('letter.pdf', {
//                         letter: letter.id,
//                     }),
//                 },
//             ]}
//         >
//             <Head title={`Surat ${letter.nomor_surat}`} />

//             <div className="space-y-4 p-5">
//                 {/* HEADER HALAMAN */}
//                 <div className="flex items-center justify-between gap-3">
//                     <div>
//                         <h1 className="text-xl font-semibold">Preview Surat</h1>

//                         <p className="text-sm text-muted-foreground">{letter.nomor_surat}</p>
//                     </div>

//                     <div className="flex gap-2">
//                         <Button
//                             variant="outline"
//                             onClick={() => router.get(route('letter.index'))}
//                             className="cursor-pointer"
//                         >
//                             <ArrowLeft className="mr-2 h-4 w-4" />

//                             <span className="hidden sm:inline">Kembali</span>
//                         </Button>

//                         <PDFDownloadLink
//                             document={<LetterDocument letter={letter} />}
//                             fileName={`Surat-${letter.nomor_surat}.pdf`}
//                         >
//                             {({ loading }) => (
//                                 <Button className="cursor-pointer" disabled={loading}>
//                                     <Download className="mr-2 h-4 w-4" />

//                                     {loading ? 'Menyiapkan PDF...' : 'Download PDF'}
//                                 </Button>
//                             )}
//                         </PDFDownloadLink>
//                     </div>
//                 </div>

//                 {/* PDF PREVIEW */}
//                 <div className="overflow-hidden rounded-xl border bg-muted">
//                     <PDFViewer width="100%" height="800" showToolbar={false}>
//                         <LetterDocument letter={letter} />
//                     </PDFViewer>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
// //
//   Schema::create('employees', function (Blueprint $table) {
//             $table->id();
//             $table->string('employee_code')->unique();
//             $table->string('name')->index();

//             $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();

//             $table->foreignId('office_id')->nullable()->constrained()->nullOnDelete();

//             $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();

//             $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();

//             $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();

//             $table->date('tanggal_awal_kerja')->nullable();
//             $table->date('kontrak_mulai_tanggal')->nullable();
//             $table->date('kontrak_selesai_tanggal')->nullable();

//             $table->enum('status', ['new', 'magang', 'kontrak', 'inactive'])->default('new');

//             $table->timestamps();

//             $table->index(['office_id', 'status']);
//             $table->index('department_id');
//             $table->index('position_id');

//             $table->index('shift_id');
//             $table->index('user_id');
//         });


// //ini kan masih pakai route/web karena ditampilkan di web aja, nah sayya inigni  nanti di beri 1 kolom yg ada tomobl nya "kirim" didimana kalau diklik akan mengirim pdf ini ke apk mobile karyawan yg bersangkutan
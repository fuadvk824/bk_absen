<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\LeaveSubmitResource;
use App\Models\Leave;
use App\Models\LeaveBalance;
use App\Models\LeaveCategory;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class LeaveSubmitController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $leaves = Leave::filter($request)->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('pengajuan/cuti/index', [
            'leaves' => LeaveSubmitResource::collection($leaves)->response()->getData(true),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'office_id' => $request->office_id,
                'leave_category_id' => $request->leave_category_id,
                'perPage' => $perPage,
            ],

            'offices' => Office::select('id', 'name')->get(),
            'leaveCategories' => LeaveCategory::select('id', 'leave_name')->get(),
        ]);
    }

    public function showFile(Leave $leavesubmit)
    {
        abort_if(
            !$leavesubmit->file,
            404,
            'File pengajuan cuti tidak ditemukan.'
        );

        // Mendukung URL lengkap yang saat ini tersimpan di database.
        $path = parse_url($leavesubmit->file, PHP_URL_PATH);

        $prefix = '/storage/';

        abort_unless(
            $path && str_starts_with($path, $prefix),
            404,
            'Path file tidak valid.'
        );

        $relativePath = substr($path, strlen($prefix));

        abort_unless(
            Storage::disk('public')->exists($relativePath),
            404,
            'File tidak ditemukan di penyimpanan.'
        );

        return Inertia::render('pengajuan/cuti/file', [
            'leave' => [
                'id' => $leavesubmit->id,
                'employee_name' => $leavesubmit->employee?->name,
                'file_url' => asset('storage/' . $relativePath),
                'file_name' => basename($relativePath),
            ],
        ]);
    }

    public function updateStatus(Request $request, Leave $leavesubmit)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        DB::transaction(function () use ($request, $leavesubmit) {
            $oldStatus = $leavesubmit->status;
            $newStatus = $request->status;

            if ($oldStatus === $newStatus) {
                return;
            }

            $balance = LeaveBalance::where([
                'employee_id' => $leavesubmit->employee_id,
                'leave_category_id' => $leavesubmit->leave_categories_id,
                'year' => now()->year,
            ])->first();

            if (!$balance) {
                throw new \Exception('Leave balance tidak ditemukan');
            }

            if ($newStatus === 'approved') {
                if ($leavesubmit->total_days > $balance->remaining_days) {
                    throw new \Exception('Sisa cuti tidak mencukupi');
                }

                $balance->used_days += $leavesubmit->total_days;
                $balance->remaining_days -= $leavesubmit->total_days;
            }

            if ($oldStatus === 'approved' && $newStatus === 'rejected') {
                $balance->used_days -= $leavesubmit->total_days;
                $balance->remaining_days += $leavesubmit->total_days;
            }

            $balance->save();

            $leavesubmit->update([
                'status' => $newStatus,
            ]);
        });

        return back()->with(
            'success',
            "Status pengajuan cuti berhasil di {$request->status}"
        );
    }
}

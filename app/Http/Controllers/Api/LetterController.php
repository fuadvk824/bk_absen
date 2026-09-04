<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\LetterResource;
use App\Models\Employee;
use App\Models\Letter;
use Illuminate\Http\Request;

class LetterController extends Controller
{
    public function myletters(Request $request)
    {
        $user = $request->user();

        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->first();

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found',
            ], 404);
        }

        $letters = Letter::query()
            ->with('employee:id,employee_code')
            ->where('employee_id', $employee->id)
            ->whereNotNull('sent_at')
            ->orderBy('tanggal_surat', 'desc')
            ->get();

        return LetterResource::collection($letters)
            ->additional([
                'success' => true,
                'message' => 'Data surat berhasil diambil',
            ]);
    }

    public function markAsRead(Request $request, Letter $letter)
    {
        $user = $request->user();

        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->first();

        if (! $employee) {
            return response()->json([
                'success' => false,
                'message' => 'Employee not found',
            ], 404);
        }

        if ($letter->employee_id !== $employee->id) {
            return response()->json([
                'success' => false,
                'message' => 'Surat tidak ditemukan',
            ], 404);
        }

        if (is_null($letter->read_at)) {
            $letter->update([
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil ditandai sudah dibaca',
        ]);
    }
}

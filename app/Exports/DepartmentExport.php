<?php

namespace App\Exports;

use App\Http\Resources\Web\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentExport implements BaseExport
{
    protected string $title = 'LAPORAN DATA DEPARTMENT';

    protected array $availableColumns = [
        'department_code' => 'Kode Department',
        'name' => 'Nama Department',
    ];

    protected function query(Request $request)
    {
        return Department::filter($request)->get();
    }

    protected function resource($model)
    {
        return new DepartmentResource($model);
    }
}

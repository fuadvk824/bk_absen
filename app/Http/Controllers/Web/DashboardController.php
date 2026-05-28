<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\DashboardRequest;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(DashboardRequest $request)
    {
        return Inertia::render('Dashboard', [
            'user' => $request->user(),
            'stats' => [
                'totalUsers' => 120,
                'totalOrders' => 56,
            ],
        ]);
    }
}

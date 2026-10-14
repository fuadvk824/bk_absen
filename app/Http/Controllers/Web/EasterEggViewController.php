<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\Web\EasterEggViewResource;
use App\Models\EasterEggView;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EasterEggViewController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->input('search');

        $views = EasterEggView::query()
            ->with('user:id,name')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->whereHas('user', function ($user) use ($search) {
                        $user->where('name', 'like', '%' . $search . '%');
                    })
                        ->orWhere('app_version', 'like', '%' . $search . '%')
                        ->orWhere('platform', 'like', '%' . $search . '%');
                });
            })
            ->latest('viewed_at')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('developer/easter-egg-view/index', [
            'views' => EasterEggViewResource::collection($views)
                ->response()
                ->getData(true),

            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }
}

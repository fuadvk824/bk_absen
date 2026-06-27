<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PasswordController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = $request->user();

        $user->update([
            'password' => bcrypt($request->password),
            'must_change_password' => false,
        ]);

        return redirect()->route('dashboard');
    }
}

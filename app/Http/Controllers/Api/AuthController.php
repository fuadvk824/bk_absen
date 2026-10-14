<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EasterEggView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(
                [
                    'message' => 'Email atau password salah',
                ],
                401,
            );
        }

        $user = Auth::user();
        $token = $user->createToken('mobile_app')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }

    public function viewed(Request $request)
    {
        $user = $request->user();

        EasterEggView::firstOrCreate(
            [
                'user_id' => $user->id,
                'app_version' => $request->app_version,
            ],
            [
                'viewed_at' => now(),
                'platform' => $request->platform,
            ]
        );

        return response()->json([
            'success' => true,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->where('name', 'like', 'mobile_%')->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->password);
        $user->key_status = 'old';

        $user->save();

        return response()->json([
            'message' => 'Password berhasil diupdate',
        ]);
    }
}

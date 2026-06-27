<?php

namespace Database\Seeders;

use App\Models\AppVersion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            AppVersion::create([
                'version' => "1.0.0",
                'apk_url' => "https://unincarcerated-darron-matchlessly.ngrok-free.dev/apk/bisa-absen-v1.0.0.apk",
                // 'apk_arm64' => "https://absensi.bisakulak.my.id/apk/app-v1.0.0-arm64-v8a.apk",
                // 'apk_v7a' => "https://absensi.bisakulak.my.id/apk/app-v1.0.0-armeabi-v7a.apk",
                'force_update' => true,
                'message' => 'Versi terbaru tersedia'
            ]);
        });
    }
}
 
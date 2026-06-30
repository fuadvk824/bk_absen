<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


// Setiap menit
Schedule::command('db:backup')->everyMinute();

// // Setiap 2 menit
// Schedule::command('db:backup')->everyTwoMinutes();

// // Setiap 5 menit
// Schedule::command('db:backup')->everyFiveMinutes();

// // Setiap 10 menit
// Schedule::command('db:backup')->everyTenMinutes();

// // Setiap 15 menit
// Schedule::command('db:backup')->everyFifteenMinutes();

// // Setiap 30 menit
// Schedule::command('db:backup')->everyThirtyMinutes();

// // Setiap jam
// Schedule::command('db:backup')->hourly();

// // Setiap hari jam 01:00
Schedule::command('db:backup')->dailyAt('11:45');


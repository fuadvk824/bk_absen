<?php

namespace Database\Seeders;

use App\Models\OffdayRequest;
use App\Models\WorkScheduleDay;
use Illuminate\Database\Seeder;

class OffdayRequestSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'employee_id' => 99,
                'date' => '2026-10-26',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan libur untuk keperluan keluarga.',
            ],
            [
                'employee_id' => 99,
                'date' => '2026-10-28',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan perubahan jadwal libur.',
            ],
            [
                'employee_id' => 100,
                'date' => '2026-10-26',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan libur untuk urusan pribadi.',
            ],
            [
                'employee_id' => 100,
                'date' => '2026-10-29',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan libur tidak dapat disetujui.',
            ],
            [
                'employee_id' => 104,
                'date' => '2026-10-26',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan libur untuk keperluan keluarga.',
            ],
            [
                'employee_id' => 104,
                'date' => '2026-10-30',
                'status_start_date' => 'masuk',
                'status_end_date' => 'libur',
                'status' => 'pending',
                'reason' => 'Pengajuan perubahan jadwal kerja.',
            ],
        ];

        foreach ($data as $item) {
            $scheduleDay = WorkScheduleDay::query()
                ->whereDate('work_date', $item['date'])
                ->whereHas('workSchedule', function ($query) use ($item) {
                    $query->where('employee_id', $item['employee_id']);
                })
                ->first();

            if (! $scheduleDay) {
                $this->command->warn(
                    "Jadwal tidak ditemukan untuk employee_id {$item['employee_id']} pada {$item['date']}."
                );

                continue;
            }

            OffdayRequest::updateOrCreate(
                [
                    'employee_id' => $item['employee_id'],
                    'date' => $item['date'],
                ],
                [
                    'work_schedule_day_id' => $scheduleDay->id,
                    'status_start_date' => $item['status_start_date'],
                    'status_end_date' => $item['status_end_date'],
                    'status' => $item['status'],
                    'reason' => $item['reason'],
                ]
            );
        }
    }
}

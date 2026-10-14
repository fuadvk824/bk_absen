<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offday_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('work_schedule_day_id')
                ->constrained('work_schedule_days')
                ->cascadeOnDelete();

            $table->date('date');

            $table->enum('status_start_date', [
                'masuk',
                'libur',
            ]);

            $table->enum('status_end_date', [
                'masuk',
                'libur',
            ]);

            $table->enum('status', [
                'approved',
                'pending',
                'rejected',
            ])->default('pending');

            $table->text('reason');

            $table->timestamps();

            $table->index(['employee_id', 'date']);
            $table->index(['work_schedule_day_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offday_requests');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('work_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained()->cascadeOnDelete();

            
            $table->date('start_date');
            $table->date('end_date');

            $table->unsignedTinyInteger('total_work_days')->default(0);
            $table->unsignedTinyInteger('total_off_days')->default(0);

            $table->timestamps();

            $table->unique(['employee_id', 'start_date', 'end_date']);
            $table->index(['start_date', 'end_date']);
         
            $table->index('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_schedules');
    }
};

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
        Schema::create('overtimes', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete()
                ->name('overtimes_employee_id_foreign');

            $table
                ->foreignId('overtime_rate_id')
                ->constrained('overtime_rates')
                ->restrictOnDelete()
                ->name('overtimes_overtime_rate_id_foreign');

            $table->date('date')->index();
            $table->time('time_from');
            $table->time('time_to');

            $table->text('reason')->nullable();
  
            $table
                ->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->index();

            $table->boolean('is_paid')->default(false)->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('overtimes');
    }
};


 
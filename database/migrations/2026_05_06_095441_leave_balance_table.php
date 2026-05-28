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
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete()
                ->name('leave_balances_employee_id_foreign');
            $table->foreignId('leave_category_id')->constrained()->cascadeOnDelete();

            $table->integer('total_quota'); 
            $table->integer('used_days')->default(0);
            $table->integer('remaining_days'); 

            $table->year('year'); 

            $table->timestamps();

            $table->unique(['employee_id', 'leave_category_id', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};

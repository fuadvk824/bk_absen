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
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete()
                ->name('payrolls_employee_id_foreign')
                ->index();

            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');

            $table->decimal('basic_salary', 15, 2);

            $table->decimal('total_additions', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);

            $table->enum('is_locked', ['bayar', 'lunas'])->default('bayar');
            $table->timestamps();

            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};

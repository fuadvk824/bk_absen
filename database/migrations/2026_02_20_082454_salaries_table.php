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
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('employee_id')
                ->constrained()
                ->cascadeOnDelete()
                ->index();

            $table->decimal('basic_salary', 15, 2)->nullable();
            $table->decimal('daily_salary', 15, 2)->nullable();

            $table->date('effective_from')->index();
            $table->timestamps();

            $table->unique(['employee_id', 'effective_from']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};

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
        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();

            $table
                ->foreignId('payroll_id')
                ->constrained()
                ->cascadeOnDelete()
                ->name('payroll_items_payrolls_id_foreign')
                ->index();

            // polymorphic
            $table->nullableMorphs('source');
            // source_id + source_type (auto index)

            $table->string('name');
            $table->string('keterangan');
            $table->enum('type', ['addition', 'deduction'])->index();
            $table->decimal('amount', 15, 2);

            $table->timestamps();

            $table->index(['payroll_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_items');
    }
};

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
        Schema::create('work_schedule_days', function (Blueprint $table) {
            $table->id();

            $table->foreignId('work_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();

            $table->date('work_date');
            $table->boolean('is_off')->default(false);
            $table->string('note')->nullable();

            $table->timestamps();

            $table->unique(['work_schedule_id', 'work_date']);
            $table->index('work_date');

            $table->index('work_schedule_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_schedule_days');
    }
};

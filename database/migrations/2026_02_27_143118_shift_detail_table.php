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
        Schema::create('shift_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');

            $table->enum('day_of_week', ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'])->index();

            $table->time('checkin_time')->nullable();
            $table->time('checkout_time')->nullable();

            $table->time('breaktime_start')->nullable();
            $table->time('breaktime_end')->nullable();
            $table->boolean('is_active')->default(false);

            $table->timestamps();

            $table->unique(['shift_id', 'day_of_week']);
        }); 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_details');
    }
};

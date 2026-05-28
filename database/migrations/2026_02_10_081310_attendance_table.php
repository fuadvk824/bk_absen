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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('gambar_checkin')->nullable();
            $table->string('gambar_checkout')->nullable();

            $table->date('tanggal');
            $table->string('name_shift')->index();
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();

            $table->time('checkin_time')->nullable();
            $table->time('checkout_time')->nullable();
            $table->integer('toleransi_late')->default(0);
            $table->integer('late_minutes')->default(0);
            $table->integer('total_waktu')->default(0);
            $table->string('status_checkin')->nullable();
            $table->string('status_checkout')->nullable();

            $table->enum('status', ['ontime', 'late']);
            $table->string('late_reason')->nullable();
            $table->string('late_proof')->nullable();
            $table->string('early_reason')->nullable();
            $table->enum('statusAprv', ['approved', 'rejected', 'pending', 'onTime'])->default('pending');

            $table->decimal('latitude_checkin', 10, 7)->nullable();
            $table->decimal('longitude_checkin', 10, 7)->nullable();
            $table->decimal('distance_checkin', 8, 2)->nullable();

            $table->decimal('latitude_checkout', 10, 7)->nullable();
            $table->decimal('longitude_checkout', 10, 7)->nullable();
            $table->decimal('distance_checkout', 8, 2)->nullable();

            $table->string('device')->nullable();

            $table->timestamps();

            $table->unique(['employee_id', 'tanggal']);
            $table->index(['employee_id', 'tanggal', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};

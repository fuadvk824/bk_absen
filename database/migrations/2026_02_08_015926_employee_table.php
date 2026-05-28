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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_code')->unique();
            $table->string('name')->index();

            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();

            $table->foreignId('office_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('position_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();

            $table->date('tanggal_awal_kerja')->nullable();
            $table->date('kontrak_mulai_tanggal')->nullable();
            $table->date('kontrak_selesai_tanggal')->nullable();

            $table->enum('status', ['new', 'magang', 'kontrak', 'inactive'])->default('new');

            $table->timestamps();

            $table->index(['office_id', 'status']);
            $table->index('department_id');
            $table->index('position_id');

            $table->index('shift_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};

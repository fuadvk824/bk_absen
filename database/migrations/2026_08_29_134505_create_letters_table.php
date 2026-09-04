<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('letters', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('name')->index();
            $table->string('name_office')->index();

            $table->string('nomor_surat')->unique();
            $table->enum('jenis_surat', [
                'SP1',
                'SP2',
                'SP3',
                'probation',
                'paklaring',
            ]);

            $table->date('tanggal_surat');
            $table->text('alasan_surat');

            $table->string('pdf_path')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            $table->index('employee_id');
            $table->index('jenis_surat');
            $table->index('tanggal_surat');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letters');
    }
};

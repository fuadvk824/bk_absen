<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('easter_egg_views', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->timestamp('viewed_at')->useCurrent();

            $table->string('app_version')->nullable();
            $table->string('platform')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'app_version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('easter_egg_views');
    }
};

<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correlativo_resets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('correlativo_id')->constrained('correlativos')->cascadeOnDelete();
            $table->string('tipo', 20);
            $table->integer('ultimo_anterior');
            $table->foreignId('user_id')->constrained('users');
            $table->text('glosa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correlativo_resets');
    }
};

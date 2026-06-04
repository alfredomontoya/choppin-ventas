<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correlativos', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 20)->unique();
            $table->integer('ultimo')->default(0);
            $table->boolean('reiniciar_anual')->default(true);
            $table->integer('year')->nullable();
            $table->timestamp('ultimo_reset_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correlativos');
    }
};

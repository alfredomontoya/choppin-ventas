<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->index('tipo_comprobante');
            $table->index('numero_comprobante');
            $table->index('fecha_emision');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->dropIndex(['tipo_comprobante']);
            $table->dropIndex(['numero_comprobante']);
            $table->dropIndex(['fecha_emision']);
        });
    }
};

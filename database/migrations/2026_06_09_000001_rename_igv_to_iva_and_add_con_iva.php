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
            $table->renameColumn('igv', 'iva');
            $table->boolean('con_iva')->default(true)->after('descuento');
        });

        Schema::table('ordenes_compra', function (Blueprint $table) {
            $table->renameColumn('igv', 'iva');
        });
    }

    public function down(): void
    {
        Schema::table('ventas', function (Blueprint $table) {
            $table->renameColumn('iva', 'igv');
            $table->dropColumn('con_iva');
        });

        Schema::table('ordenes_compra', function (Blueprint $table) {
            $table->renameColumn('iva', 'igv');
        });
    }
};

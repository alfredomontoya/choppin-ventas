<?php

declare(strict_types=1);

use App\Models\Venta;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correlativos', function (Blueprint $table) {
            $table->id();
            $table->string('tipo', 20)->unique();
            $table->integer('ultimo')->default(0);
            $table->timestamps();
        });

        $ultimaBoleta = Venta::where('tipo_comprobante', 'boleta')->withTrashed()->count();
        $ultimaFactura = Venta::where('tipo_comprobante', 'factura')->withTrashed()->count();

        DB::table('correlativos')->insert([
            ['tipo' => 'boleta', 'ultimo' => $ultimaBoleta],
            ['tipo' => 'factura', 'ultimo' => $ultimaFactura],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('correlativos');
    }
};

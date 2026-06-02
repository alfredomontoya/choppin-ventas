<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('correlativos', function (Blueprint $table) {
            $table->boolean('reiniciar_anual')->default(true)->after('ultimo');
            $table->integer('year')->nullable()->after('reiniciar_anual');
            $table->timestamp('ultimo_reset_en')->nullable()->after('year');
        });
    }

    public function down(): void
    {
        Schema::table('correlativos', function (Blueprint $table) {
            $table->dropColumn(['reiniciar_anual', 'year', 'ultimo_reset_en']);
        });
    }
};

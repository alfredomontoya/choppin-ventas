<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CorrelativoResetRequest;
use App\Models\Correlativo;
use App\Models\CorrelativoReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CorrelativoController extends Controller
{
    public function index(): Response
    {
        $correlativos = Correlativo::withCount('resets')->get()->map(function (Correlativo $c) {
            return [
                'id' => $c->id,
                'tipo' => $c->tipo,
                'ultimo' => $c->ultimo,
                'reiniciar_anual' => $c->reiniciar_anual,
                'year' => $c->year,
                'ultimo_reset_en' => $c->ultimo_reset_en?->toISOString(),
                'resets_count' => $c->resets_count,
                'ultimo_reset' => $c->resets()->with('user')->latest()->first() ? [
                    'glosa' => $c->resets()->with('user')->latest()->first()->glosa,
                    'user_name' => $c->resets()->with('user')->latest()->first()->user->name,
                    'created_at' => $c->resets()->with('user')->latest()->first()->created_at->toISOString(),
                ] : null,
            ];
        });

        return inertia('Admin/Correlativos/Index', [
            'correlativos' => $correlativos,
        ]);
    }

    public function update(Request $request, Correlativo $correlativo): RedirectResponse
    {
        $validated = $request->validate([
            'reiniciar_anual' => ['boolean'],
        ]);

        $correlativo->update([
            'reiniciar_anual' => $validated['reiniciar_anual'] ?? false,
        ]);

        $label = $correlativo->tipo === 'boleta' ? 'Boleta' : 'Factura';

        return redirect()->route('admin.correlativos.index')
            ->with('success', "Correlativo de {$label} actualizado.");
    }

    public function reset(CorrelativoResetRequest $request, Correlativo $correlativo): RedirectResponse
    {
        $ultimoAnterior = $correlativo->ultimo;
        $currentYear = (int) now()->year;

        $correlativo->update([
            'ultimo' => 0,
            'year' => $currentYear,
            'ultimo_reset_en' => now(),
        ]);

        $correlativo->resets()->create([
            'tipo' => $correlativo->tipo,
            'ultimo_anterior' => $ultimoAnterior,
            'user_id' => auth()->id(),
            'glosa' => $request->input('glosa'),
        ]);

        $label = $correlativo->tipo === 'boleta' ? 'Boleta' : 'Factura';

        return redirect()->route('admin.correlativos.index')
            ->with('success', "Numeración de {$label} reiniciada correctamente.");
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CorrelativoResetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) auth()->user()?->can('configuracion.ver');
    }

    public function rules(): array
    {
        return [
            'glosa' => ['required', 'string', 'min:10', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'glosa.required' => 'La glosa es obligatoria para reiniciar la numeración.',
            'glosa.min' => 'La glosa debe tener al menos 10 caracteres.',
        ];
    }
}

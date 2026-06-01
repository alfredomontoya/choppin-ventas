<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlmacenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_id' => ['required', 'exists:productos,id'],
            'tipo' => ['required', Rule::in(['ingreso_manual', 'egreso_manual', 'ajuste'])],
            'cantidad' => ['required', 'numeric'],
            'motivo' => ['required', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $tipo = $this->input('tipo');
            $cantidad = (float) $this->input('cantidad', 0);

            if (in_array($tipo, ['ingreso_manual', 'egreso_manual']) && $cantidad <= 0) {
                $validator->errors()->add('cantidad', 'La cantidad debe ser mayor a 0 para ingresos y egresos.');
            }

            if ($tipo === 'ajuste' && $cantidad == 0) {
                $validator->errors()->add('cantidad', 'La cantidad no puede ser 0 en un ajuste.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'producto_id.required' => 'Debe seleccionar un producto.',
            'producto_id.exists' => 'El producto seleccionado no existe.',
            'tipo.required' => 'Debe seleccionar un tipo de movimiento.',
            'tipo.in' => 'El tipo de movimiento no es válido.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.numeric' => 'La cantidad debe ser un número.',
            'motivo.required' => 'El motivo es obligatorio.',
            'motivo.max' => 'El motivo no puede exceder 255 caracteres.',
        ];
    }
}

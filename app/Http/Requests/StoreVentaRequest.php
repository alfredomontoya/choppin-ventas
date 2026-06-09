<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVentaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'],
            'tipo_comprobante' => ['required', Rule::in(['boleta', 'factura'])],
            'tipo_pago' => ['required', Rule::in(['efectivo', 'tarjeta', 'transferencia', 'qr'])],
            'con_iva' => ['nullable', 'boolean'],
            'descuento' => ['nullable', 'numeric', 'min:0'],
            'monto_recibido' => ['nullable', 'numeric', 'min:0'],
            'cambio' => ['nullable', 'numeric', 'min:0'],
            'observaciones' => ['nullable', 'string', 'max:500'],
            'detalles' => ['required', 'array', 'min:1'],
            'detalles.*.producto_id' => ['required', 'integer', 'exists:productos,id'],
            'detalles.*.cantidad' => ['required', 'numeric', 'min:0.01'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('cliente_id') && ($this->input('cliente_id') === '' || $this->input('cliente_id') === '0')) {
            $this->merge(['cliente_id' => null]);
        }
        if ($this->has('monto_recibido') && $this->input('monto_recibido') === '') {
            $this->merge(['monto_recibido' => null]);
        }
        if ($this->has('cambio') && $this->input('cambio') === '') {
            $this->merge(['cambio' => null]);
        }
    }

    public function messages(): array
    {
        return [
            'tipo_comprobante.required' => 'El tipo de comprobante es obligatorio.',
            'tipo_comprobante.in' => 'El tipo de comprobante debe ser boleta o factura.',
            'tipo_pago.required' => 'El tipo de pago es obligatorio.',
            'tipo_pago.in' => 'El tipo de pago debe ser efectivo, tarjeta, transferencia o qr.',
            'detalles.required' => 'Debe agregar al menos un producto.',
            'detalles.min' => 'Debe agregar al menos un producto.',
            'detalles.*.producto_id.required' => 'Debe seleccionar un producto.',
            'detalles.*.producto_id.exists' => 'El producto seleccionado no existe.',
            'detalles.*.cantidad.required' => 'La cantidad es obligatoria.',
            'detalles.*.cantidad.min' => 'La cantidad debe ser mayor a 0.',
        ];
    }
}

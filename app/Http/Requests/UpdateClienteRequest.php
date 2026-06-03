<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClienteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:255'],
            'tipo_documento' => ['required', Rule::in(['ci', 'ce', 'nit'])],
            'numero_documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('clientes', 'numero_documento')->ignore($this->route('cliente')),
            ],
            'telefono' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'tipo_documento.required' => 'El tipo de documento es obligatorio.',
            'tipo_documento.in' => 'El tipo de documento debe ser CI, CE o NIT.',
            'numero_documento.required' => 'El número de documento es obligatorio.',
            'numero_documento.unique' => 'Este número de documento ya está registrado.',
            'email.email' => 'Ingrese un correo electrónico válido.',
        ];
    }
}

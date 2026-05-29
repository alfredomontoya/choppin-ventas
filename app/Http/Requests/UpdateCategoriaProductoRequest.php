<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoriaProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categoria_productos', 'nombre')->ignore($this->route('categoria_producto')),
            ],
            'descripcion' => ['nullable', 'string', 'max:1000'],
        ];

        if ($this->hasFile('imagen')) {
            $rules['imagen'] = ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'dimensions:min_width=64,min_height=64,max_width=2000,max_height=2000'];
        } else {
            $rules['imagen'] = ['nullable', 'string', 'max:500'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.unique' => 'Este nombre de categoría ya está registrado.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPG, PNG o WebP.',
            'imagen.dimensions' => 'La imagen debe medir entre 64×64 y 2000×2000 píxeles.',
            'imagen.uploaded' => 'La imagen falló al subir.',
        ];
    }
}

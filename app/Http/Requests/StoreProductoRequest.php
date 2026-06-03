<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['required', 'exists:categoria_productos,id'],
            'codigo' => ['required', 'string', 'max:50', Rule::unique('productos', 'codigo')],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'stock_actual' => ['required', 'numeric', 'min:0'],
            'stock_minimo' => ['required', 'numeric', 'min:0'],
            'unidad_medida' => ['required', 'string', 'max:50'],
            'margen_utilidad' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'imagenes_nuevas' => ['nullable', 'array', 'max:5'],
            'imagenes_nuevas.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'imagenes_orden' => ['nullable', 'array'],
            'imagenes_orden.*' => ['integer', 'min:0'],
            'precio_compra' => ['required', 'numeric', 'min:0'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'codigo.required' => 'El código es obligatorio.',
            'codigo.unique' => 'Este código ya está registrado.',
            'nombre.required' => 'El nombre es obligatorio.',
            'precio_compra.required' => 'El precio de compra es obligatorio.',
            'precio_compra.numeric' => 'El precio de compra debe ser un número.',
            'precio_compra.min' => 'El precio de compra no puede ser negativo.',
            'precio_venta.required' => 'El precio de venta es obligatorio.',
            'precio_venta.numeric' => 'El precio de venta debe ser un número.',
            'precio_venta.min' => 'El precio de venta no puede ser negativo.',
            'stock_actual.required' => 'El stock actual es obligatorio.',
            'stock_minimo.required' => 'El stock mínimo es obligatorio.',
            'unidad_medida.required' => 'La unidad de medida es obligatoria.',
            'imagenes_nuevas.max' => 'Máximo 5 imágenes por producto.',
            'imagenes_nuevas.*.image' => 'Cada archivo debe ser una imagen.',
            'imagenes_nuevas.*.mimes' => 'Cada imagen debe ser JPG, PNG o WebP.',
            'imagenes_nuevas.*.max' => 'Cada imagen no debe superar los 2 MB.',
        ];
    }
}

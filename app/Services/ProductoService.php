<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PrecioProducto;
use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductoService
{
    private const MAX_BYTES = 512000;
    private const DIRECTORIO = 'productos';

    public function listar(Request $request)
    {
        return Producto::query()
            ->with('categoria')
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): Producto
    {
        return Producto::with(['categoria', 'imagenes', 'precios'])->findOrFail($id);
    }

    public function crear(array $data): Producto
    {
        $imagenesNuevas = $data['imagenes_nuevas'] ?? [];
        $precioCompra = $data['precio_compra'] ?? null;
        $precioVenta = $data['precio_venta'] ?? null;
        unset($data['imagenes_nuevas'], $data['imagenes_eliminar'], $data['imagenes_orden'], $data['precio_compra'], $data['precio_venta']);

        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            $data['imagen'] = $this->comprimirYGuardar($data['imagen']);
        }

        $producto = Producto::create($data);

        $this->guardarImagenesMultiples($producto, $imagenesNuevas);

        if ($precioCompra !== null && $precioVenta !== null) {
            $producto->precios()->create([
                'precio_compra' => (float) $precioCompra,
                'precio_venta' => (float) $precioVenta,
                'fecha_inicio' => now()->format('Y-m-d'),
            ]);
        }

        return $producto;
    }

    public function actualizar(int $id, array $data): Producto
    {
        $producto = $this->obtenerPorId($id);

        $imagenesNuevas = $data['imagenes_nuevas'] ?? [];
        $imagenesEliminar = $data['imagenes_eliminar'] ?? [];
        $imagenesOrden = $data['imagenes_orden'] ?? [];
        $precioCompra = $data['precio_compra'] ?? null;
        $precioVenta = $data['precio_venta'] ?? null;
        unset($data['imagenes_nuevas'], $data['imagenes_eliminar'], $data['imagenes_orden'], $data['precio_compra'], $data['precio_venta']);

        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            if ($producto->imagen && !str_starts_with($producto->imagen, 'http')) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $data['imagen'] = $this->comprimirYGuardar($data['imagen']);
        } elseif (isset($data['imagen']) && $data['imagen'] === '') {
            if ($producto->imagen && !str_starts_with($producto->imagen, 'http')) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $data['imagen'] = null;
        } elseif (isset($data['imagen']) && is_string($data['imagen']) && $data['imagen'] !== '') {
            $data['imagen'] = $this->normalizarRuta($data['imagen']);
        }

        $this->eliminarImagenes($producto, $imagenesEliminar);
        $this->actualizarOrden($producto, $imagenesOrden);
        $this->guardarImagenesMultiples($producto, $imagenesNuevas);

        $producto->update($data);

        if ($precioCompra !== null && $precioVenta !== null) {
            $this->actualizarPrecio($producto, (float) $precioCompra, (float) $precioVenta);
        }

        return $producto->fresh(['imagenes', 'precios']);
    }

    private function actualizarPrecio(Producto $producto, float $precioCompra, float $precioVenta): void
    {
        $vigente = $producto->precios()
            ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', now()->format('Y-m-d')))
            ->latest('fecha_inicio')
            ->first();

        if ($vigente && (float) $vigente->precio_compra === $precioCompra && (float) $vigente->precio_venta === $precioVenta) {
            return;
        }

        if ($vigente) {
            $vigente->update(['fecha_fin' => now()->subDay()->format('Y-m-d')]);
        }

        $producto->precios()->create([
            'precio_compra' => $precioCompra,
            'precio_venta' => $precioVenta,
            'fecha_inicio' => now()->format('Y-m-d'),
        ]);
    }

    public function eliminar(int $id): void
    {
        $producto = $this->obtenerPorId($id);

        if ($producto->imagen && !str_starts_with($producto->imagen, 'http')) {
            Storage::disk('public')->delete($producto->imagen);
        }

        foreach ($producto->imagenes as $img) {
            if (!str_starts_with($img->ruta, 'http')) {
                Storage::disk('public')->delete($img->ruta);
            }
        }

        $producto->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return Producto::query()
            ->with('categoria')
            ->applyFilters($request);
    }

    private function guardarImagenesMultiples(Producto $producto, array $files): void
    {
        $ultimoOrden = ProductoImagen::where('producto_id', $producto->id)->max('orden') ?? 0;

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile) continue;
            $ultimoOrden++;
            $ruta = $this->comprimirYGuardar($file);
            $producto->imagenes()->create([
                'ruta' => $ruta,
                'orden' => $ultimoOrden,
            ]);
        }
    }

    private function eliminarImagenes(Producto $producto, array $ids): void
    {
        foreach ($ids as $id) {
            $img = ProductoImagen::find($id);
            if (!$img || $img->producto_id !== $producto->id) continue;
            if (!str_starts_with($img->ruta, 'http')) {
                Storage::disk('public')->delete($img->ruta);
            }
            $img->delete();
        }
    }

    private function actualizarOrden(Producto $producto, array $orden): void
    {
        foreach ($orden as $pos => $id) {
            ProductoImagen::where('id', $id)->where('producto_id', $producto->id)
                ->update(['orden' => $pos + 1]);
        }
    }

    private function comprimirYGuardar(UploadedFile $file): string
    {
        if ($file->getSize() <= self::MAX_BYTES) {
            return $file->store(self::DIRECTORIO, 'public');
        }

        $mime = $file->getMimeType();
        $gdImage = match ($mime) {
            'image/jpeg' => @imagecreatefromjpeg($file->getRealPath()),
            'image/png' => @imagecreatefrompng($file->getRealPath()),
            'image/webp' => @imagecreatefromwebp($file->getRealPath()),
            default => null,
        };

        if (!$gdImage) {
            return $file->store(self::DIRECTORIO, 'public');
        }

        $extension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => $file->getExtension(),
        };

        $contenido = $this->comprimir($gdImage, $mime, $extension);
        imagedestroy($gdImage);

        $nombre = pathinfo($file->hashName(), PATHINFO_FILENAME) . '.' . $extension;
        $ruta = self::DIRECTORIO . '/' . $nombre;
        Storage::disk('public')->put($ruta, $contenido);

        return $ruta;
    }

    private function comprimir(\GdImage $gdImage, string $mime, string &$extension): string
    {
        $calidad = 85;
        $contenido = $this->codificar($gdImage, $mime, $calidad);
        $tamano = strlen($contenido);

        while ($tamano > self::MAX_BYTES && $calidad > 10) {
            $calidad -= 5;
            $contenido = $this->codificar($gdImage, $mime, $calidad);
            $tamano = strlen($contenido);
        }

        if ($tamano <= self::MAX_BYTES) {
            return $contenido;
        }

        if ($mime === 'image/png') {
            $gdImage = $this->pngToJpeg($gdImage);
            $mime = 'image/jpeg';
            $extension = 'jpg';
            $calidad = 85;
            $contenido = $this->codificar($gdImage, $mime, $calidad);
            $tamano = strlen($contenido);
            while ($tamano > self::MAX_BYTES && $calidad > 10) {
                $calidad -= 5;
                $contenido = $this->codificar($gdImage, $mime, $calidad);
                $tamano = strlen($contenido);
            }
            imagedestroy($gdImage);
        }

        if ($tamano > self::MAX_BYTES) {
            $ancho = imagesx($gdImage);
            $alto = imagesy($gdImage);
            $factor = sqrt(self::MAX_BYTES / $tamano);
            $nuevoAncho = max(64, (int)($ancho * $factor));
            $nuevoAlto = max(64, (int)($alto * $factor));
            $redimensionada = imagescale($gdImage, $nuevoAncho, $nuevoAlto);
            if ($redimensionada) {
                $calidad = 85;
                $contenido = $this->codificar($redimensionada, $mime, $calidad);
                $tamano = strlen($contenido);
                while ($tamano > self::MAX_BYTES && $calidad > 10) {
                    $calidad -= 5;
                    $contenido = $this->codificar($redimensionada, $mime, $calidad);
                    $tamano = strlen($contenido);
                }
                imagedestroy($redimensionada);
            }
        }

        return $contenido;
    }

    private function codificar(\GdImage $gdImage, string $mime, int $quality): string
    {
        ob_start();
        match ($mime) {
            'image/jpeg' => imagejpeg($gdImage, null, $quality),
            'image/png' => imagepng($gdImage, null, 9),
            'image/webp' => imagewebp($gdImage, null, $quality),
        };
        return ob_get_clean();
    }

    private function normalizarRuta(string $ruta): string
    {
        $storageUrl = rtrim(Storage::url(''), '/') . '/';
        if (str_starts_with($ruta, $storageUrl)) {
            return substr($ruta, strlen($storageUrl));
        }
        if (str_starts_with($ruta, '/storage/')) {
            return substr($ruta, strlen('/storage/'));
        }
        return $ruta;
    }

    private function pngToJpeg(\GdImage $gdImage): \GdImage
    {
        $ancho = imagesx($gdImage);
        $alto = imagesy($gdImage);
        $jpeg = imagecreatetruecolor($ancho, $alto);
        $blanco = imagecolorallocate($jpeg, 255, 255, 255);
        imagefill($jpeg, 0, 0, $blanco);
        imagecopy($jpeg, $gdImage, 0, 0, 0, 0, $ancho, $alto);
        return $jpeg;
    }
}

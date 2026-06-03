<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Http\Request;
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
            ->when($request->filled('stock_bajo'), fn ($q) => $q->whereColumn('stock_actual', '<=', 'stock_minimo'))
            ->when($request->filled('con_stock'), fn ($q) => $q->where('stock_actual', '>', 0))
            ->when($request->filled('sin_stock'), fn ($q) => $q->where('stock_actual', '<=', 0))
            ->when($request->filled('stock_desde'), fn ($q) => $q->where('stock_actual', '>=', $request->stock_desde))
            ->when($request->filled('stock_hasta'), fn ($q) => $q->where('stock_actual', '<=', $request->stock_hasta))
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

        $producto = Producto::create($data);

        $nuevosIds = $this->guardarImagenesMultiples($producto, $imagenesNuevas);
        $this->aplicarOrdenCompleto($producto, array_fill(0, count($nuevosIds), 0), $nuevosIds);

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

        $this->eliminarImagenes($producto, $imagenesEliminar);
        $nuevosIds = $this->guardarImagenesMultiples($producto, $imagenesNuevas);
        $this->aplicarOrdenCompleto($producto, $imagenesOrden, $nuevosIds);

        $producto->update($data);

        if ($precioCompra !== null && $precioVenta !== null) {
            $this->actualizarPrecio($producto, (float) $precioCompra, (float) $precioVenta);
        }

        return $producto->fresh(['imagenes', 'precios']);
    }

    private function aplicarOrdenCompleto(Producto $producto, array $orden, array $nuevosIds): void
    {
        $idxNuevo = 0;
        foreach ($orden as $pos => $item) {
            if ($item === 0) {
                $id = $nuevosIds[$idxNuevo] ?? null;
                if ($id) {
                    ProductoImagen::where('id', $id)->update(['orden' => $pos + 1]);
                    $idxNuevo++;
                }
            } else {
                ProductoImagen::where('id', $item)->where('producto_id', $producto->id)
                    ->update(['orden' => $pos + 1]);
            }
        }
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

        foreach ($producto->imagenes as $img) {
            if (! str_starts_with($img->ruta, 'http')) {
                Storage::disk('public')->delete($img->ruta);
            }
        }

        $producto->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return Producto::query()
            ->with('categoria')
            ->applyFilters($request)
            ->when($request->filled('stock_bajo'), fn ($q) => $q->whereColumn('stock_actual', '<=', 'stock_minimo'))
            ->when($request->filled('con_stock'), fn ($q) => $q->where('stock_actual', '>', 0))
            ->when($request->filled('sin_stock'), fn ($q) => $q->where('stock_actual', '<=', 0))
            ->when($request->filled('stock_desde'), fn ($q) => $q->where('stock_actual', '>=', $request->stock_desde))
            ->when($request->filled('stock_hasta'), fn ($q) => $q->where('stock_actual', '<=', $request->stock_hasta));
    }

    private function guardarImagenesMultiples(Producto $producto, array $files): array
    {
        $ids = [];

        foreach ($files as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            $ruta = $this->comprimirYGuardar($file);
            $imagen = $producto->imagenes()->create([
                'ruta' => $ruta,
                'orden' => 0,
            ]);
            $ids[] = $imagen->id;
        }

        return $ids;
    }

    private function eliminarImagenes(Producto $producto, array $ids): void
    {
        foreach ($ids as $id) {
            $img = ProductoImagen::find($id);
            if (! $img || $img->producto_id !== $producto->id) {
                continue;
            }
            if (! str_starts_with($img->ruta, 'http')) {
                Storage::disk('public')->delete($img->ruta);
            }
            $img->delete();
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

        if (! $gdImage) {
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
            $nuevoAncho = max(64, (int) ($ancho * $factor));
            $nuevoAlto = max(64, (int) ($alto * $factor));
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

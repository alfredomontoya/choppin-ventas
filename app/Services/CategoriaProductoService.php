<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CategoriaProducto;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CategoriaProductoService
{
    private const MAX_BYTES = 512000;
    private const DIRECTORIO = 'categorias';

    public function listar(Request $request)
    {
        return CategoriaProducto::query()
            ->applyFilters($request)
            ->applySorting($request)
            ->paginate($request->input('por_pagina', 10))
            ->withQueryString();
    }

    public function obtenerPorId(int $id): CategoriaProducto
    {
        return CategoriaProducto::findOrFail($id);
    }

    public function crear(array $data): CategoriaProducto
    {
        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            $data['imagen'] = $this->comprimirYGuardar($data['imagen']);
        }

        return CategoriaProducto::create($data);
    }

    public function actualizar(int $id, array $data): CategoriaProducto
    {
        $categoria = $this->obtenerPorId($id);

        if (isset($data['imagen']) && $data['imagen'] instanceof UploadedFile) {
            if ($categoria->imagen && !str_starts_with($categoria->imagen, 'http')) {
                Storage::disk('public')->delete($categoria->imagen);
            }
            $data['imagen'] = $this->comprimirYGuardar($data['imagen']);
        } elseif (isset($data['imagen']) && $data['imagen'] === '') {
            if ($categoria->imagen && !str_starts_with($categoria->imagen, 'http')) {
                Storage::disk('public')->delete($categoria->imagen);
            }
            $data['imagen'] = null;
        } elseif (isset($data['imagen']) && is_string($data['imagen']) && $data['imagen'] !== '') {
            $data['imagen'] = $this->normalizarRuta($data['imagen']);
        }

        $categoria->update($data);
        return $categoria;
    }

    public function eliminar(int $id): void
    {
        $categoria = $this->obtenerPorId($id);
        if ($categoria->imagen && !str_starts_with($categoria->imagen, 'http')) {
            Storage::disk('public')->delete($categoria->imagen);
        }
        $categoria->delete();
    }

    public function queryParaExportar(Request $request)
    {
        return CategoriaProducto::query()->applyFilters($request);
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
            $nuevoAncho = max(200, (int) ($ancho * $factor));
            $nuevoAlto = max(200, (int) ($alto * $factor));
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

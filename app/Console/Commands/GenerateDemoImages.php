<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\CategoriaProducto;
use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateDemoImages extends Command
{
    protected $signature = 'images:generate-demo';

    protected $description = 'Genera imágenes placeholder para categorías y productos';

    private const W = 640;

    private const H = 480;

    private const COLORS = [
        'Ropa Hombre' => ['bg' => [41, 128, 185]],
        'Ropa Mujer' => ['bg' => [231, 76, 60]],
        'Accesorios' => ['bg' => [142, 68, 173]],
    ];

    public function handle(): int
    {
        $this->info('Generando imágenes placeholder…');

        Storage::disk('public')->deleteDirectory('categorias');
        Storage::disk('public')->deleteDirectory('productos');

        $this->generarCategorias();
        $this->generarProductos();

        $this->newLine();
        $this->info('Imágenes generadas correctamente.');

        return self::SUCCESS;
    }

    private function generarCategorias(): void
    {
        $categorias = CategoriaProducto::all();
        $this->info("Procesando {$categorias->count()} categorías…");

        foreach ($categorias as $categoria) {
            $this->output->write("  {$categoria->nombre}… ");

            $rgb = self::COLORS[$categoria->nombre]['bg'] ?? [128, 128, 128];
            $contenido = $this->crearImagen($rgb, $categoria->nombre, 'Categoría de ropa');

            $ruta = 'categorias/' . Str::slug($categoria->nombre) . '.jpg';
            Storage::disk('public')->put($ruta, $contenido);
            $categoria->updateQuietly(['imagen' => $ruta]);

            $this->info('✓');
        }
    }

    private function generarProductos(): void
    {
        $productos = Producto::with('categoria')->get();
        $this->info("Procesando {$productos->count()} productos…");

        foreach ($productos as $producto) {
            $this->output->write("  {$producto->nombre}… ");

            $rgb = self::COLORS[$producto->categoria->nombre]['bg'] ?? [128, 128, 128];
            $contenido = $this->crearImagen($rgb, Str::limit($producto->nombre, 22), '');

            $ruta = 'productos/' . Str::slug($producto->nombre . '-' . $producto->id) . '.jpg';
            Storage::disk('public')->put($ruta, $contenido);

            ProductoImagen::create([
                'producto_id' => $producto->id,
                'ruta' => $ruta,
                'orden' => 0,
            ]);

            $this->crearImagenesAdicionales($producto, $rgb);
            $this->info('✓');
        }
    }

    private function crearImagenesAdicionales(Producto $producto, array $rgb): void
    {
        $variants = [
            ['title' => 'Vista frontal', 'offset' => 0],
            ['title' => 'Vista trasera', 'offset' => 30],
        ];

        foreach ($variants as $i => $variant) {
            $variantRgb = [
                min(255, $rgb[0] + $variant['offset']),
                min(255, $rgb[1] + $variant['offset']),
                min(255, $rgb[2] + $variant['offset']),
            ];
            $contenido = $this->crearImagen($variantRgb, Str::limit($producto->nombre, 20), $variant['title']);

            $ruta = 'productos/' . Str::slug($producto->nombre . '-' . $producto->id . '-v' . ($i + 1)) . '.jpg';
            Storage::disk('public')->put($ruta, $contenido);

            ProductoImagen::create([
                'producto_id' => $producto->id,
                'ruta' => $ruta,
                'orden' => $i + 1,
            ]);
        }
    }

    private function crearImagen(array $rgb, string $line1, string $line2): string
    {
        $img = imagecreatetruecolor(self::W, self::H);

        $bg = imagecolorallocate($img, $rgb[0], $rgb[1], $rgb[2]);
        imagefilledrectangle($img, 0, 0, self::W, self::H, $bg);

        $lightRgb = [min(255, $rgb[0] + 40), min(255, $rgb[1] + 40), min(255, $rgb[2] + 40)];
        $card = imagecolorallocate($img, $lightRgb[0], $lightRgb[1], $lightRgb[2]);

        $cardW = 280;
        $cardH = 280;
        $cx = (int) ((self::W - $cardW) / 2);
        $cy = (int) ((self::H - $cardH) / 2 - 20);
        imagefilledroundedrect($img, $cx, $cy, $cx + $cardW, $cy + $cardH, 20, $card);

        $white = imagecolorallocate($img, 255, 255, 255);
        $this->dibujarIconoRopa($img, self::W / 2, $cy + $cardH / 2, $white);

        $font = $this->fuente();
        if ($font) {
            $box = imagettfbbox(26, 0, $font, $line1);
            if ($box) {
                $x = (int) ((self::W - ($box[2] - $box[0])) / 2);
                $y = $cy + $cardH + 50;
                imagettftext($img, 26, 0, $x, $y, $white, $font, $line1);
            }
            if ($line2) {
                $box = imagettfbbox(16, 0, $font, $line2);
                if ($box) {
                    $x = (int) ((self::W - ($box[2] - $box[0])) / 2);
                    $y = $cy + $cardH + 80;
                    imagettftext($img, 16, 0, $x, $y, $white, $font, $line2);
                }
            }
        }

        ob_start();
        imagejpeg($img, null, 85);
        $contenido = ob_get_clean();
        imagedestroy($img);

        return $contenido;
    }

    private function dibujarIconoRopa(\GdImage $img, float $cx, float $cy, int $color): void
    {
        imagesetthickness($img, 4);

        $s = 60;

        $x1 = (int) ($cx - $s * 0.8);
        $x2 = (int) ($cx + $s * 0.8);
        $yTop = (int) ($cy - $s * 1.1);
        $yBot = (int) ($cy + $s * 1.0);

        $neckY = (int) ($yTop + $s * 0.3);
        $shoulderW = (int) ($s * 0.3);

        $lsx = $x1 + $shoulderW;
        $lsx2 = $x1 + $shoulderW + 10;
        $rsx = $x2 - $shoulderW;
        $rsx2 = $x2 - $shoulderW - 10;
        $mshY = (int) ($neckY + $s * 0.5);
        $mshY2 = (int) ($neckY + $s * 0.6);
        $vBottom = (int) ($neckY + $s * 0.3);

        imageline($img, $x1, $neckY, $lsx, $mshY, $color);
        imageline($img, $lsx, $mshY, $lsx, $yBot, $color);
        imageline($img, $x2, $neckY, $rsx, $mshY, $color);
        imageline($img, $rsx, $mshY, $rsx, $yBot, $color);
        imageline($img, $lsx2, $mshY2, $lsx2, $yBot, $color);
        imageline($img, $rsx2, $mshY2, $rsx2, $yBot, $color);
        imageline($img, $x1, $neckY, $x2, $neckY, $color);
        imageline($img, (int) $cx, $neckY - 8, (int) $cx, $vBottom, $color);
        imageline($img, $lsx2, $yBot, $rsx2, $yBot, $color);
    }

    private function fuente(): string
    {
        $candidates = [
            'C:/Windows/Fonts/arial.ttf',
            'C:/Windows/Fonts/arialbd.ttf',
            'C:/Windows/Fonts/calibri.ttf',
            'C:/Windows/Fonts/segoeui.ttf',
            'C:/Windows/Fonts/verdana.ttf',
        ];

        foreach ($candidates as $f) {
            if (file_exists($f)) {
                return $f;
            }
        }

        return '';
    }
}

if (! function_exists('imagefilledroundedrect')) {
    function imagefilledroundedrect(\GdImage $img, int $x1, int $y1, int $x2, int $y2, int $radius, int $color): void
    {
        imagefilledrectangle($img, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
        imagefilledrectangle($img, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
        imagefilledarc($img, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, 180, 270, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, 270, 360, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, 90, 180, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, 0, 90, $color, IMG_ARC_PIE);
    }
}

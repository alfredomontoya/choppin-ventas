<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;

class QRController extends Controller
{
    public function index(): Response
    {
        $qrPath = config('ventas.qr.image_path');
        $qrExists = $qrPath && Storage::disk('public')->exists(str_replace('/storage/', '', $qrPath));

        return inertia('Admin/QR/Index', [
            'qrImage' => $qrExists ? $qrPath : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'qr_image' => ['required', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        $oldPath = config('ventas.qr.image_path');
        if ($oldPath) {
            $oldRelative = str_replace('/storage/', '', $oldPath);
            if (Storage::disk('public')->exists($oldRelative)) {
                Storage::disk('public')->delete($oldRelative);
            }
        }

        $file = $request->file('qr_image');
        $filename = 'qr-cobro.' . $file->getClientOriginalExtension();
        $file->storeAs('qr', $filename, 'public');

        $qrPath = '/storage/qr/' . $filename;

        $this->updateEnv('QR_IMAGE_PATH', $qrPath);
        config(['ventas.qr.image_path' => $qrPath]);

        return redirect()->route('admin.qr.index')
            ->with('success', 'Imagen QR actualizada correctamente.');
    }

    private function updateEnv(string $key, string $value): void
    {
        $envFile = base_path('.env');
        $content = file_get_contents($envFile);
        $pattern = "/^{$key}=.*/m";
        $replacement = "{$key}={$value}";

        if (preg_match($pattern, $content)) {
            $content = preg_replace($pattern, $replacement, $content);
        } else {
            $content .= PHP_EOL . $replacement;
        }

        file_put_contents($envFile, $content);
    }
}

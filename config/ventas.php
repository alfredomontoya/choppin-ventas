<?php

declare(strict_types=1);

return [
    'iva_rate' => env('VENTA_IVA_RATE', 0.13),

    'store' => [
        'name' => env('STORE_NAME', 'Nombre de tu Tienda'),
        'address' => env('STORE_ADDRESS', 'Dirección de la tienda'),
        'phone' => env('STORE_PHONE', '777-123456'),
        'nit' => env('STORE_NIT', '123456789'),
    ],

    'qr' => [
        'image_path' => env('QR_IMAGE_PATH', '/storage/qr/qr-cobro.png'),
    ],
];

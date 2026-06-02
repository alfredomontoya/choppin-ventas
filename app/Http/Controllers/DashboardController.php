<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;

class DashboardController extends Controller
{
    public function __invoke(DashboardService $service)
    {
        return inertia('Dashboard/Index', [
            'resumen' => $service->obtenerResumen(),
        ]);
    }
}

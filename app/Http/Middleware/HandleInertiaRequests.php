<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\Models\Role;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $roles = $request->user()?->roles()->with('permissions')->get();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $roles?->pluck('name') ?? [],
                'roles_data' => $roles?->map(fn (Role $role) => [
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name'),
                ]) ?? [],
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? [],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}

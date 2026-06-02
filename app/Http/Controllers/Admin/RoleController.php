<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        return inertia('Admin/Roles/Index', [
            'roles' => Role::with('permissions')->get()->map(fn ($role) => [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]),
        ]);
    }
}

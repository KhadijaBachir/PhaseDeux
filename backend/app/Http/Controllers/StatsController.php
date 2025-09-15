<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Hotel;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'total_hotels' => Hotel::count(),
            'hotels_with_email' => Hotel::whereNotNull('email')->count(),
            'total_users' => User::count(),
            'user_hotels' => $user ? $user->hotels()->count() : 0,
            // Ajoutez d'autres statistiques au besoin
        ]);
    }
}
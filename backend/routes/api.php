<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Endpoint pour obtenir le cookie CSRF (utile avec Sanctum)
Route::get('/sanctum/csrf-cookie', function() {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes publiques pour les hôtels (pour la consultation)
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);

// Routes protégées (nécessitent le token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Routes d'authentification protégées
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Correction : L'upload de photo de profil se fait via une route dédiée
    Route::post('/user/upload-photo', [AuthController::class, 'uploadPhoto']); 
    
    // Routes des hôtels (création, mise à jour, suppression)
    // C'est ici que tu dois gérer l'upload des photos pour les hôtels
    Route::post('/hotels', [HotelController::class, 'store']);
    Route::post('/hotels/{id}', [HotelController::class, 'update']); // Utilisation de POST pour le PUT (nécessaire pour le formulaire multipart)
    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
    
    // Route pour récupérer les hôtels de l'utilisateur connecté
    Route::get('/user/hotels', [HotelController::class, 'index']);
});
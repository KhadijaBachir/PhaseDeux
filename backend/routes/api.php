<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HotelController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Endpoint pour obtenir le cookie CSRF
Route::get('/sanctum/csrf-cookie', function() {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Routes publiques d'authentification
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes publiques pour les hôtels (consultation)
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/{id}', [HotelController::class, 'show']);

// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/user/upload-photo', [AuthController::class, 'uploadPhoto']);
    
    // Hôtels (CRUD complet)
    Route::post('/hotels', [HotelController::class, 'store']);
    Route::put('/hotels/{id}', [HotelController::class, 'update']); // CORRECTION : Route PUT ajoutée
    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);
    
    // Hôtels de l'utilisateur connecté
    Route::get('/user/hotels', [HotelController::class, 'index']);
});
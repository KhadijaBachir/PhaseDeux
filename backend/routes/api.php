<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/sanctum/csrf-cookie', function() {
    return response()->json(['message' => 'CSRF cookie set']);
});

// Auth API publique
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);          // Récupérer l'utilisateur connecté
    Route::post('/upload-photo', [AuthController::class, 'uploadPhoto']); // Upload photo
});

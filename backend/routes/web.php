<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Nouvelle route pour la réinitialisation de mot de passe qui redirige vers le frontend
Route::get('/reset-password/{token}', function ($token, Request $request) {
    return redirect('http://127.0.0.1:5173/reset-password?token='.$token.'&email='.$request->email);
})->name('password.reset');

Route::get('/', function () {
    return view('welcome');
});
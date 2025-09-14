<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class HotelController extends Controller
{
    // Liste tous les hôtels
    public function index()
    {
        // Le modèle Hotel va automatiquement transformer le chemin de la photo en une URL complète
        return response()->json(Hotel::all(), 200);
    }

    // Crée un nouvel hôtel
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'address' => 'required|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'price' => 'required|numeric',
            'currency' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Gère l'upload de la photo si un fichier est présent
        if ($request->hasFile('photo')) {
            // Store le fichier dans le dossier 'hotels' du disque 'public'
            $path = $request->file('photo')->store('hotels', 'public');
            // On stocke UNIQUEMENT le chemin relatif dans la base de données
            $validated['photo'] = $path;
        } else {
            $validated['photo'] = null;
        }

        $hotel = Hotel::create($validated);

        // La réponse JSON inclura l'URL complète grâce à l'accessor dans le modèle
        return response()->json($hotel, 201);
    }

    // Affiche un hôtel précis
    public function show($id)
    {
        $hotel = Hotel::findOrFail($id);
        return response()->json($hotel, 200);
    }

    // Met à jour un hôtel
    public function update(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'address' => 'sometimes|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'currency' => 'sometimes|string',
            // Le "sometimes" assure que le champ est validé seulement s'il est présent dans la requête
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Gère l'upload d'une nouvelle photo
        if ($request->hasFile('photo')) {
            // Supprime l'ancienne photo si elle existe avant d'en enregistrer une nouvelle
            if ($hotel->photo) {
                Storage::disk('public')->delete($hotel->photo);
            }
            
            $path = $request->file('photo')->store('hotels', 'public');
            $validated['photo'] = $path;
        }

        $hotel->update($validated);
        return response()->json($hotel, 200);
    }

    // Supprime un hôtel
    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);
        
        // Supprime la photo associée avant de supprimer l'hôtel
        if ($hotel->photo) {
            Storage::disk('public')->delete($hotel->photo);
        }
        
        $hotel->delete();
        return response()->json(['message' => 'Hôtel supprimé'], 200);
    }
}
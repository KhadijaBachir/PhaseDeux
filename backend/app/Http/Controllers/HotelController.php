<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class HotelController extends Controller
{
    /**
     * Afficher la liste des hôtels de l'utilisateur connecté.
     */
    public function index(Request $request)
    {
        try {
            $hotels = $request->user()->hotels;

            // Correction : On ajoute l'URL de la photo à chaque objet
            $hotels->map(function ($hotel) {
                // S'il y a une photo, génère l'URL publique. Sinon, reste null.
                $hotel->photo = $hotel->photo ? asset('storage/' . $hotel->photo) : null;
                return $hotel;
            });

            return response()->json($hotels, 200);
        } catch (\Exception $e) {
            \Log::error('Erreur récupération hôtels: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Enregistrer un nouvel hôtel.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string',
                'address' => 'required|string',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
                'price_per_night' => 'required|numeric',
                'currency' => 'required|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Correction : Gère le stockage de la photo
            if ($request->hasFile('photo')) {
                // Stocke le fichier et met à jour le chemin dans le tableau validé
                $validated['photo'] = $request->file('photo')->store('hotels', 'public');
            }

            // Crée l'hôtel en l'associant à l'utilisateur authentifié
            $hotel = $request->user()->hotels()->create($validated);

            // Ajoute l'URL de la photo à la réponse JSON pour l'affichage immédiat sur le frontend
            $hotel->photo = $hotel->photo ? asset('storage/' . $hotel->photo) : null;

            return response()->json($hotel, 201);
        } catch (ValidationException $ve) {
            return response()->json(['errors' => $ve->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur création hôtel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Afficher un hôtel spécifique.
     */
    public function show(Request $request, $id)
    {
        try {
            $hotel = Hotel::findOrFail($id);

            if ($hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Correction : Génère l'URL pour la réponse
            $hotel->photo = $hotel->photo ? asset('storage/' . $hotel->photo) : null;

            return response()->json($hotel, 200);
        } catch (\Exception $e) {
            \Log::error('Erreur affichage hôtel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Mettre à jour un hôtel.
     */
    public function update(Request $request, $id)
    {
        try {
            $hotel = Hotel::findOrFail($id);

            if ($hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Le "sometimes" assure que le champ n'est validé que s'il est présent
            $validated = $request->validate([
                'name' => 'sometimes|string',
                'address' => 'sometimes|string',
                'email' => 'nullable|email',
                'phone' => 'nullable|string',
                'price_per_night' => 'sometimes|numeric',
                'currency' => 'sometimes|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);

            // Gère la mise à jour de la photo
            if ($request->hasFile('photo')) {
                // Supprime l'ancienne photo si elle existe
                if ($hotel->photo) {
                    Storage::disk('public')->delete($hotel->getRawOriginal('photo'));
                }
                $validated['photo'] = $request->file('photo')->store('hotels', 'public');
            }

            $hotel->update($validated);

            // Ajoute l'URL de la photo à la réponse
            $hotel->photo = $hotel->photo ? asset('storage/' . $hotel->photo) : null;

            return response()->json($hotel, 200);
        } catch (ValidationException $ve) {
            return response()->json(['errors' => $ve->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur mise à jour hôtel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Supprimer un hôtel.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $hotel = Hotel::findOrFail($id);

            if ($hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Supprime la photo avant de supprimer l'hôtel
            if ($hotel->photo) {
                Storage::disk('public')->delete($hotel->getRawOriginal('photo'));
            }

            $hotel->delete();

            return response()->json(['message' => 'Hôtel supprimé'], 200);
        } catch (\Exception $e) {
            \Log::error('Erreur suppression hôtel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
}
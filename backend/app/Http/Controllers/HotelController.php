<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class HotelController extends Controller
{
    /**
     * Afficher la liste des hôtels
     */
    public function index(Request $request)
    {
        try {
            // Si l'utilisateur est authentifié, retourner ses hôtels
            if ($request->user()) {
                $hotels = $request->user()->hotels()->with('user')->get();
            } else {
                // Sinon, retourner tous les hôtels (pour consultation publique)
                $hotels = Hotel::with('user')->get();
            }

            return response()->json($hotels, 200);
        } catch (\Exception $e) {
            \Log::error('Erreur récupération hôtels: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Enregistrer un nouvel hôtel
     */
    public function store(Request $request)
    {
        \Log::info('🔍 DÉBUT Création hôtel', ['user_id' => $request->user()->id]);
        
        try {
            \Log::info('📥 Données reçues:', $request->all());

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'address' => 'required|string|max:500',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'price_per_night' => 'required|numeric|min:0|max:999999.99',
                'currency' => 'required|string|in:F XOF,€ EUR,$ USD',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            \Log::info('✅ Données validées:', $validated);

            // Gestion de l'upload de la photo
            if ($request->hasFile('photo')) {
                \Log::info('📸 Fichier photo détecté', [
                    'name' => $request->file('photo')->getClientOriginalName(),
                    'size' => $request->file('photo')->getSize(),
                    'mime' => $request->file('photo')->getMimeType()
                ]);
                
                $validated['photo'] = $request->file('photo')->store('hotels', 'public');
                \Log::info('💾 Photo sauvegardée:', ['path' => $validated['photo']]);
            }

            \Log::info('💾 Création en base de données...');
            $hotel = $request->user()->hotels()->create($validated);
            $hotel->load('user');

            \Log::info('🎉 Hôtel créé avec succès:', [
                'hotel_id' => $hotel->id,
                'name' => $hotel->name,
                'price' => $hotel->price_per_night,
                'currency' => $hotel->currency,
                'photo_path' => $hotel->photo
            ]);

            return response()->json([
                'message' => 'Hôtel créé avec succès',
                'hotel' => $hotel
            ], 201);

        } catch (ValidationException $ve) {
            \Log::error('❌ Erreur validation hôtel:', ['errors' => $ve->errors()]);
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('💥 Erreur création hôtel:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la création de l\'hôtel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un hôtel spécifique
     */
    public function show(Request $request, $id)
    {
        try {
            $hotel = Hotel::with('user')->find($id);

            if (!$hotel) {
                return response()->json(['message' => 'Hôtel non trouvé'], 404);
            }

            // Vérifier que l'utilisateur peut voir cet hôtel
            if ($request->user() && $hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            return response()->json($hotel, 200);

        } catch (\Exception $e) {
            \Log::error('Erreur affichage hôtel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Mettre à jour un hôtel
     */
    public function update(Request $request, $id)
    {
        \Log::info('🔍 DÉBUT Mise à jour hôtel', ['hotel_id' => $id, 'user_id' => $request->user()->id]);
        
        try {
            $hotel = Hotel::find($id);

            if (!$hotel) {
                return response()->json(['message' => 'Hôtel non trouvé'], 404);
            }

            // Vérifier que l'utilisateur peut modifier cet hôtel
            if ($hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            \Log::info('📥 Données reçues pour mise à jour:', $request->all());

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'address' => 'sometimes|required|string|max:500',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'price_per_night' => 'sometimes|required|numeric|min:0|max:999999.99',
                'currency' => 'sometimes|required|string|in:F XOF,€ EUR,$ USD',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);

            \Log::info('✅ Données validées pour mise à jour:', $validated);

            // Gestion de l'upload de la nouvelle photo
            if ($request->hasFile('photo')) {
                \Log::info('📸 Nouvelle photo détectée');
                
                // Supprimer l'ancienne photo si elle existe
                if ($hotel->photo) {
                    $oldPhotoPath = $hotel->getRawPhotoPath();
                    if ($oldPhotoPath && Storage::disk('public')->exists($oldPhotoPath)) {
                        Storage::disk('public')->delete($oldPhotoPath);
                        \Log::info('🗑️ Ancienne photo supprimée:', ['path' => $oldPhotoPath]);
                    }
                }
                $validated['photo'] = $request->file('photo')->store('hotels', 'public');
                \Log::info('💾 Nouvelle photo sauvegardée:', ['path' => $validated['photo']]);
            }

            // Mettre à jour l'hôtel
            $hotel->update($validated);
            
            // CORRECTION FORCÉE : Recharger depuis la base avec une nouvelle requête
            $hotel = Hotel::with('user')->find($id);

            \Log::info('✅ Hôtel mis à jour avec succès:', [
                'hotel_id' => $hotel->id,
                'name' => $hotel->name,
                'address' => $hotel->address,
                'email' => $hotel->email,
                'phone' => $hotel->phone,
                'price_per_night' => $hotel->price_per_night,
                'currency' => $hotel->currency,
                'photo_path' => $hotel->photo,
                'photo_raw' => $hotel->getRawOriginal('photo')
            ]);

            return response()->json([
                'message' => 'Hôtel mis à jour avec succès',
                'hotel' => $hotel
            ], 200);

        } catch (ValidationException $ve) {
            \Log::error('❌ Erreur validation mise à jour hôtel:', ['errors' => $ve->errors()]);
            return response()->json([
                'message' => 'Erreur de validation',
                'errors' => $ve->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('💥 Erreur mise à jour hôtel:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'message' => 'Erreur lors de la mise à jour de l\'hôtel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un hôtel
     */
    public function destroy(Request $request, $id)
    {
        try {
            $hotel = Hotel::find($id);

            if (!$hotel) {
                return response()->json(['message' => 'Hôtel non trouvé'], 404);
            }

            // Vérifier que l'utilisateur peut supprimer cet hôtel
            if ($hotel->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            // Supprimer la photo si elle existe
            if ($hotel->photo) {
                $photoPath = $hotel->getRawPhotoPath();
                if ($photoPath && Storage::disk('public')->exists($photoPath)) {
                    Storage::disk('public')->delete($photoPath);
                    \Log::info('🗑️ Photo supprimée:', ['path' => $photoPath]);
                }
            }

            $hotel->delete();

            \Log::info('✅ Hôtel supprimé avec succès:', ['hotel_id' => $id]);

            return response()->json([
                'message' => 'Hôtel supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Erreur suppression hôtel: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression de l\'hôtel'
            ], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class HotelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return response()->json($request->user()->hotels, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
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

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('hotels', 'public');
            $validated['photo'] = $path;
        } else {
            $validated['photo'] = null;
        }

        $hotel = $request->user()->hotels()->create($validated);

        return response()->json($hotel, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $hotel = Hotel::findOrFail($id);
        return response()->json($hotel, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);

        if ($request->user()->id !== $hotel->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'address' => 'sometimes|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'currency' => 'sometimes|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($hotel->photo) {
                Storage::disk('public')->delete($hotel->getRawOriginal('photo'));
            }
            $path = $request->file('photo')->store('hotels', 'public');
            $validated['photo'] = $path;
        }

        $hotel->update($validated);
        return response()->json($hotel, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);
        
        if ($request->user()->id !== $hotel->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        if ($hotel->photo) {
            Storage::disk('public')->delete($hotel->getRawOriginal('photo'));
        }
        
        $hotel->delete();
        return response()->json(['message' => 'Hôtel supprimé'], 200);
    }
}
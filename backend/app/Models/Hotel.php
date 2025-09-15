<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address', 
        'email',
        'phone',
        'price',
        'currency',
        'photo',
        'user_id' // Bien présent !
    ];

    // Relation avec l'utilisateur - CORRECTION IMPORTANTE
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id'); // Ajouter le nom de la clé étrangère
    }

    /**
     * Accessor pour la photo - AMÉLIORATION
     * Retourne l'URL complète ou null si pas de photo
     */
    public function getPhotoAttribute($value)
    {
        if (!$value) {
            return null;
        }
        
        // Si c'est déjà une URL complète (http://...), la retourner telle quelle
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        
        // Sinon, construire l'URL à partir du chemin de stockage
        return Storage::disk('public')->url($value);
    }

    /**
     * Accessor pour obtenir le chemin brut de la photo (sans URL)
     * Utile pour la suppression des fichiers
     */
    public function getRawPhotoPath()
    {
        return $this->getRawOriginal('photo');
    }
}
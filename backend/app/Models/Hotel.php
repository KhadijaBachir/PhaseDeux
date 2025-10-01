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
        'price_per_night',
        'currency',
        'photo',
        'user_id'
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Accessor pour la photo - Version simplifiée
     * Retourne le chemin relatif, le frontend construira l'URL complète
     */
    public function getPhotoAttribute($value)
    {
        if (!$value) {
            return null;
        }
        
        // Retourner le chemin relatif seulement
        // Le frontend construira l'URL complète
        return $value;
    }

    /**
     * Get the raw photo path (pour la suppression)
     */
    public function getRawPhotoPath()
    {
        return $this->getRawOriginal('photo');
    }

    /**
     * Scope pour les hôtels de l'utilisateur
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Vérifier si l'hôtel appartient à l'utilisateur
     */
    public function belongsToUser($userId)
    {
        return $this->user_id === $userId;
    }
}
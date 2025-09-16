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
        'user_id' // clé étrangère pour l'utilisateur
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Accessor pour la photo
     */
    public function getPhotoAttribute($value)
    {
        if (!$value) return null;
        return filter_var($value, FILTER_VALIDATE_URL) ? $value : Storage::disk('public')->url($value);
    }

    /**
     * Chemin brut de la photo (pour suppression)
     */
    public function getRawPhotoPath()
    {
        return $this->getRawOriginal('photo');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // Ajoutez cette ligne pour utiliser la façade Storage

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
        'photo', // Ce champ contiendra maintenant le chemin relatif
    ];

    /**
     * Crée l'URL complète de la photo lorsque vous y accédez.
     *
     * @return string|null
     */
    public function getPhotoAttribute($value)
    {
        return $value ? Storage::disk('public')->url($value) : null;
    }
}
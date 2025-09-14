<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('name');      // Nom de l'hôtel
            $table->string('address');   // Adresse
            $table->decimal('price', 8, 2); // Prix par nuit
            $table->string('photo')->nullable(); // Chemin de la photo
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('hotels');
    }
};

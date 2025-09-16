<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // lien avec l'utilisateur
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('price_per_night', 8, 2)->nullable();
            $table->string('currency')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();

            // clé étrangère pour relier à l'utilisateur
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade'); // si l'utilisateur est supprimé, supprimer ses hôtels
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};

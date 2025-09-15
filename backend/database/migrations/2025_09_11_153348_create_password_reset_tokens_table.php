<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Ajouter la colonne user_id si elle n'existe pas
        if (!Schema::hasColumn('hotels', 'user_id')) {
            Schema::table('hotels', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            });
        }

        // Assigner un user_id par défaut aux hôtels existants
        $firstUserId = DB::table('users')->value('id');
        if ($firstUserId) {
            DB::table('hotels')->update(['user_id' => $firstUserId]);
        } else {
            // Créer un utilisateur par défaut si aucun n'existe
            $defaultUserId = DB::table('users')->insertGetId([
                'name' => 'Default User',
                'email' => 'default@example.com',
                'password' => bcrypt('password'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('hotels')->update(['user_id' => $defaultUserId]);
        }

        // Rendre la colonne obligatoire et ajouter la contrainte
        Schema::table('hotels', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
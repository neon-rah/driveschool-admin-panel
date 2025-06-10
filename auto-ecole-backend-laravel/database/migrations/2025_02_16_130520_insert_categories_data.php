<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('categories')->insert([
            [
                'name' => 'A',
                'age_minimum' => 18,
                'description' => 'Permis pour les motos de moins de 50 cm³.',
            ],
            [
                'name' => 'A1',
                'age_minimum' => 18,
                'description' => 'Permis pour les motos de 50 à 125 cm³.',
            ],
            [
                'name' => 'A2',
                'age_minimum' => 21,
                'description' => 'Permis pour les motos de plus de 125 cm³.',
            ],
            [
                'name' => 'B',
                'age_minimum' => 18,
                'description' => 'Permis pour les voitures.',
            ],
            [
                'name' => 'C',
                'age_minimum' => 21,
                'description' => 'Permis pour les véhicules lourds.',
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('categories')->whereIn('name', ['A', 'A1', 'A2', 'B', 'C'])->delete();
    }
};

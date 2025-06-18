<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            [
                'name' => 'Permis A1',
                'description' => 'Motocyclettes légères (125 cm³, 11 kW max)',
                'age_minimum' => 16,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis A',
                'description' => 'Toutes motocyclettes sans limitation',
                'age_minimum' => 24,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis A2',
                'description' => 'Moto intermédiaire (puissance limitée)',
                'age_minimum' => 18,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis B',
                'description' => 'Voitures légères (PTAC ≤ 3,5 tonnes)',
                'age_minimum' => 18,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis C',
                'description' => 'Poids lourds (PTAC > 3,5 tonnes)',
                'age_minimum' => 21,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis D',
                'description' => 'Transport en commun (> 8 places)',
                'age_minimum' => 24,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis BE',
                'description' => 'Voiture avec remorque lourde',
                'age_minimum' => 18,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis CE',
                'description' => 'Poids lourd avec remorque',
                'age_minimum' => 21,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis DE',
                'description' => 'Bus avec remorque',
                'age_minimum' => 24,
                'prerequisite_category_id' => null,
            ],
            [
                'name' => 'Permis F (Agricole)',
                'description' => 'Véhicules agricoles (tracteurs)',
                'age_minimum' => 16,
                'prerequisite_category_id' => null,
            ],
        ];

        DB::table('categories')->insert($categories);
    }
}
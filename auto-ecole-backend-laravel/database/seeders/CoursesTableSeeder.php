<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CoursesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $courses = [
            [
                'name' => 'Code de la route',
                'type' => 'common',               
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Conduite en ville',
                'type' => 'common',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Conduite sur autoroute',
                'type' => 'specific',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gestion des ronds-points',
                'type' => 'common',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Conduite de nuit',
                'type' => 'specific',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Conduite sous la pluie',
                'type' => 'specific',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Préparation à l\'examen pratique',
                'type' => 'common',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Perfectionnement moto',
                'type' => 'specific',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Éco-conduite',
                'type' => 'common',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Gestion des situations d\'urgence',
                'type' => 'specific',                
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insérer les données dans la table courses
        DB::table('courses')->insert($courses);
    }
}
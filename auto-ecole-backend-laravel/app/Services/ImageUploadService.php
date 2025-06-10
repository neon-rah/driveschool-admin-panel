<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
class ImageUploadService{

    // Extensions autorisées
    private static array $allowedExtensions = ['jpg', 'png', 'jpeg'];


    // Taille max en Ko (2MB = 2048 Ko)
    private static int $maxFileSize = 2048;

    /**
     * Upload une image et retourne son chemin
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string|null $prefix
     * @return string
     * @throws ValidationException
     */

     // execute the command php artisan storage:link to let laravel manage the storage


    public static function uploadImage(UploadedFile $file, string $folder, ?string $prefix = null): string
    {
        // Valider le fichier avant l'upload
        self::validateFile($file);

        // Générer un nom unique avec un préfixe (ex: student_12345.jpg, radom de 10)
        $filename = ($prefix ? $prefix . '_' : '') . Str::random(10) . '.' . $file->getClientOriginalExtension();

        // Sauvegarder dans storage/app/public/{folder}
        $path = $file->storeAs( $folder, $filename,'public');

        // Retourner le chemin relatif à "storage" (pour servir l'image) accessible via le front par $imageUrl = asset('storage/' . $path);

        return $path;
    }

    /**
     * Supprime une image existante
     *
     * @param string|null $imagePath
     * @return void
     */
    public static function deleteImage(?string $imagePath): void
    {
        if ($imagePath && Storage::disk('public')->exists( $imagePath)) {
            Storage::disk('public')->delete( $imagePath);
        }        
    }

    /**
     * Valide la taille et l'extension du fichier
     *
     * @param UploadedFile $file
     * @throws ValidationException
     */
    private static function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $size = $file->getSize() / 1024; // Convertir en Ko

        if (!in_array($extension, self::$allowedExtensions)) {
            throw ValidationException::withMessages([
                'file' => "Format non autorisé. Extensions valides : " . implode(', ', self::$allowedExtensions),
            ]);
        }

        if ($size > self::$maxFileSize) {
            throw ValidationException::withMessages([
                'file' => "La taille du fichier dépasse la limite autorisée de " . self::$maxFileSize . " Ko.",
            ]);
        }
    }



}
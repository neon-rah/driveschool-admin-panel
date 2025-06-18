<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class FileUploadService
{
    /**
     * Taille maximale autorisée (en octets) = 10 Mo
     */
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo

    /**
     * Extensions autorisées
     */
    private const ALLOWED_MIMES = ['application/pdf'];

    /**
     * Gère l'upload d'un fichier PDF avec validation stricte.
     * 
     * @param UploadedFile $file
     * @param string $directory
     * @return string|null
     * @throws ValidationException
     */
    public static function uploadPdf(UploadedFile $file, string $directory): ?string
    {
        // Vérification de l'extension et du type MIME
        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw ValidationException::withMessages([
                'file' => 'Le fichier doit être un PDF.',
            ]);
        }

        // Vérification de la taille du fichier
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw ValidationException::withMessages([
                'file' => 'Le fichier ne doit pas dépasser 10 Mo.',
            ]);
        }

        // Génère un nom unique pour le fichier
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
// php artisan storage:link a faire
       

        $path = $file->storeAs($directory, $filename, 'public');

        return $path;
    }

    /**
     * Supprime un fichier existant.
     * 
     * @param string|null $filePath
     * @return void
     */
    public static function deleteFile(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}

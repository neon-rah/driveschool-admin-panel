<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // Correction de l'importation (Steve)
use Illuminate\Support\Facades\Hash; // Ajoutez en haut (Steve)

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Authenticatable
{
    use HasFactory, SoftDeletes, HasApiTokens;

    protected $table = 'students';

    protected $fillable = [
        'last_name',
        'first_name',
        'email',
        'phone',
        'cin',
        'birth_date',
        'gender',
        'profile_picture',
        'residence_certificate',
        'password',
        'previous_license',
        'payment_receipt', // Corrigé ici
        'training_id',
        'status'
    ];

    public static function validate(array $data, $isUpdate = false)
    {
        $age = isset($data['birth_date']) ? Carbon::parse($data['birth_date'])->age : null;

        $emailRule = 'nullable|email';
        $cinRule = [
            'nullable',
            'required_if:age,>=18',
        ];

        if ($isUpdate && isset($data['id'])) {
            $emailRule .= '|unique:students,email,' . $data['id'];
            $cinRule[] = 'unique:students,cin,' . $data['id'];
            // Charger l'étudiant existant pour vérifier les images
            $student = self::find($data['id']);
            $imageRules = [
                'profile_picture' => ($student && $student->profile_picture) ? 'sometimes|file|image|mimes:jpeg,png,jpg|max:2048' : 'required|file|image|mimes:jpeg,png,jpg|max:2048',
                'residence_certificate' => ($student && $student->residence_certificate) ? 'sometimes|file|image|mimes:jpeg,png,jpg|max:2048' : 'required|file|image|mimes:jpeg,png,jpg|max:2048',
                'payment_receipt' => ($student && $student->payment_receipt) ? 'sometimes|file|image|mimes:jpeg,png,jpg|max:2048' : 'required|file|image|mimes:jpeg,png,jpg|max:2048',
            ];
        } else {
            $emailRule .= '|unique:students,email';
            $cinRule[] = 'unique:students,cin';
            $imageRules = [
                'profile_picture' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
                'residence_certificate' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
                'payment_receipt' => 'required|file|image|mimes:jpeg,png,jpg|max:2048',
            ];
        }

        $validator = Validator::make($data, array_merge([
            'last_name' => 'required|string|min:2|max:50',
            'first_name' => 'nullable|string|min:2|max:100',
            'email' => $emailRule,
            'phone' => 'nullable|string|size:10',
            'cin' => $cinRule,
            'training_id' => 'nullable|exists:trainings,id',
            'status' => 'nullable|in:pending,validated,rejected',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:1,2',
        ], $imageRules), [
            'last_name.required' => 'Le nom de famille est obligatoire.',
            'last_name.string' => 'Le nom de famille doit être une chaîne de caractères.',
            'last_name.min' => 'Le nom de famille doit comporter au moins 3 caractères.',
            'last_name.max' => 'Le nom de famille ne doit pas dépasser 50 caractères.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.min' => 'Le prénom doit comporter au moins 3 caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser 100 caractères.',
            'email.email' => 'L\'email doit être une adresse valide.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'phone.size' => 'Le numéro de téléphone doit contenir exactement 10 chiffres.',
            'cin.required_if' => 'Le CIN est requis pour les personnes majeures (18 ans ou plus).',
            'cin.unique' => 'Ce CIN est déjà enregistré.',
            'birth_date.date' => 'La date de naissance doit être une date valide.',
            'birth_date.before' => 'La date de naissance doit être avant aujourd\'hui.',
            'gender.in' => 'Le sexe doit être 1 pour homme et 2 pour femme.',
            'profile_picture.required' => 'La photo de profil est obligatoire.',
            'profile_picture.file' => 'La photo de profil doit être un fichier.',
            'profile_picture.image' => 'La photo de profil doit être une image.',
            'profile_picture.mimes' => 'La photo de profil doit être au format JPEG, PNG ou JPG.',
            'profile_picture.max' => 'La photo de profil ne doit pas dépasser 10 Mo.',
            'residence_certificate.required' => 'Le certificat de résidence est obligatoire.',
            'payment_receipt.required' => 'Le reçu de paiement est obligatoire.',
            'status.in' => 'Le statut doit être parmi :pending, :validated ou :rejected.',
        ]);

        return $validator;
    }

    // Relations et mutators
    public function training()
    {
        return $this->belongsTo(Training::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function setPasswordAttribute($value)
    {
        if ($value) { // Vérifie que la valeur n'est pas vide
            $this->attributes['password'] = Hash::make($value);
        }
    }

    public function setPhoneAttribute($value)
    {
        $this->attributes['phone'] = str_replace(' ', '', $value);
    }

     /**
     * Retourne l'identifiant unique de l'utilisateur pour le JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Retourne un tableau de revendications personnalisées pour le JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getProfilePictureUrlAttribute() // Pour récupérer l'URL de l'image de profil (Steve)
    {
        if (!$this->profile_picture) {
            return asset('storage/default-avatar.png');
        }
        
        return asset('storage/'.$this->profile_picture);
    }
}


Je vais vous guider pas à pas pour configurer le backend Laravel 11 de zéro jusqu'à ce qu'il soit pleinement opérationnel pour votre module `Course`, en intégrant tout ce qui est nécessaire (modèles, migrations, contrôleurs, services, routes, etc.). Nous partirons du principe que vous commencez avec une installation fraîche de Laravel 11, et je m'assurerai que tout soit fonctionnel pour interagir avec le frontend Next.js que nous avons déjà configuré.

---

### **Étape 1 : Installation de Laravel 11**

#### **1.1 Prérequis**
- PHP 8.2 ou supérieur
- Composer installé
- MySQL (ou autre base de données supportée)

#### **1.2 Créer un nouveau projet Laravel**
Ouvrez un terminal dans `E:\ETUDE\PROJET\PHP\LARAVEL\AutoEcole\` et exécutez :
```bash
composer create-project laravel/laravel backend-laravel
cd backend-laravel
```

#### **1.3 Configurer la base de données**
Modifiez `.env` dans `backend-laravel` :
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=autoecole_courses
DB_USERNAME=root
DB_PASSWORD=
```
- Créez la base de données `autoecole_courses` dans MySQL si elle n'existe pas :
  ```sql
  CREATE DATABASE autoecole_courses;
  ```

#### **1.4 Vérifier l’installation**
Lancez le serveur :
```bash
php artisan serve
```
Accédez à `http://localhost:8000` dans un navigateur. Vous devriez voir la page de bienvenue de Laravel.

---

### **Étape 2 : Créer le modèle et la migration pour `Course`**

#### **2.1 Générer le modèle avec migration**
```bash
php artisan make:model Course -m
```

#### **2.2 Configurer la migration**
Ouvrez `database/migrations/[timestamp]_create_courses_table.php` et mettez :
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->enum('type', ['common', 'specific'])->default('common');
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
```

#### **2.3 Configurer le modèle `Course`**
Ouvrez `app/Models/Course.php` :
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Validator;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';

    protected $fillable = ['name', 'type', 'file_path'];

    public static $rules = [
        'name' => 'required|string|max:100',
        'type' => 'required|in:common,specific',
        'file' => 'nullable|file|mimes:pdf|max:10240', // Max 10MB, uniquement PDF
    ];

    public static $messages = [
        'name.required' => 'Le nom du cours est requis.',
        'name.string' => 'Le nom doit être une chaîne de caractères.',
        'name.max' => 'Le nom ne doit pas dépasser 100 caractères.',
        'type.required' => 'Le type de cours est requis.',
        'type.in' => 'Le type doit être "common" ou "specific".',
        'file.file' => 'Le fichier doit être un fichier valide.',
        'file.mimes' => 'Le fichier doit être un PDF.',
        'file.max' => 'Le fichier ne doit pas dépasser 10 Mo.',
    ];

    public static function validate($data)
    {
        return Validator::make($data, self::$rules, self::$messages);
    }
};
```

#### **2.4 Exécuter la migration**
```bash
php artisan migrate
```
Vérifiez dans MySQL que la table `courses` est créée avec les colonnes `id`, `name`, `type`, `file_path`, `created_at`, et `updated_at`.

---

### **Étape 3 : Créer le service de gestion des fichiers**

#### **3.1 Générer le service**
Créez `app/Services/FileUploadService.php` :
```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class FileUploadService
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
    private const ALLOWED_MIMES = ['application/pdf'];

    public static function uploadPdf(UploadedFile $file, string $directory): string
    {
        if (!in_array($file->getMimeType(), self::ALLOWED_MIMES)) {
            throw ValidationException::withMessages(['file' => 'Le fichier doit être un PDF.']);
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw ValidationException::withMessages(['file' => 'Le fichier ne doit pas dépasser 10 Mo.']);
        }

        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs($directory, $filename, 'public');

        return $path;
    }

    public static function deleteFile(?string $filePath): void
    {
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }
    }
}
```

#### **3.2 Configurer le stockage**
Modifiez `config/filesystems.php` pour s’assurer que le disque `public` est correctement configuré :
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL') . '/storage',
    'visibility' => 'public',
],
```
Créez le lien symbolique pour rendre les fichiers accessibles publiquement :
```bash
php artisan storage:link
```
Les fichiers seront stockés dans `storage/app/public/courses/` et accessibles via `http://localhost:8000/storage/courses/...`.

---

### **Étape 4 : Créer le contrôleur `CourseController`**

#### **4.1 Générer le contrôleur**
```bash
php artisan make:controller CourseController
```

#### **4.2 Configurer le contrôleur**
Ouvrez `app/Http/Controllers/CourseController.php` :
```php
<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::all();
        return response()->json(['courses' => $courses], 200);
    }

    public function show($id)
    {
        $course = Course::findOrFail($id);
        return response()->json(['course' => $course], 200);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $validator = Course::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($request->hasFile('file')) {
                $data['file_path'] = FileUploadService::uploadPdf($request->file('file'), 'courses');
            }

            $course = Course::create($data);
            return response()->json(['message' => 'Cours créé avec succès.', 'course' => $course], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $data = $request->all();
        $validator = Course::validate($data);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($request->hasFile('file')) {
                FileUploadService::deleteFile($course->file_path);
                $data['file_path'] = FileUploadService::uploadPdf($request->file('file'), 'courses');
            }

            $course->update($data);
            return response()->json(['message' => 'Cours mis à jour avec succès.', 'course' => $course], 200);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        FileUploadService::deleteFile($course->file_path);
        $course->delete();
        return response()->json(['message' => 'Cours supprimé avec succès.'], 200);
    }
}
```

---

### **Étape 5 : Définir les routes API**

#### **5.1 Configurer `routes/api.php`**
Ouvrez `routes/api.php` et ajoutez :
```php
<?php

use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

Route::prefix('courses')->group(function () {
    Route::get('/', [CourseController::class, 'index']);          // GET /api/courses
    Route::get('/{id}', [CourseController::class, 'show']);       // GET /api/courses/{id}
    Route::post('/', [CourseController::class, 'store']);         // POST /api/courses
    Route::post('/{id}', [CourseController::class, 'update'])     // POST /api/courses/{id} (avec _method=PUT)
        ->where('id', '[0-9]+');
    Route::delete('/{id}', [CourseController::class, 'destroy']); // DELETE /api/courses/{id}
});
```

#### **5.2 Vérifier les routes**
```bash
php artisan route:list
```
Vous devriez voir :
```
GET|HEAD  api/courses          App\Http\Controllers\CourseController@index
GET|HEAD  api/courses/{id}     App\Http\Controllers\CourseController@show
POST      api/courses          App\Http\Controllers\CourseController@store
POST      api/courses/{id}     App\Http\Controllers\CourseController@update
DELETE    api/courses/{id}     App\Http\Controllers\CourseController@destroy
```

---

### **Étape 6 : Configurer CORS**

Puisque le frontend Next.js (sur `http://localhost:3000`) appelle le backend Laravel (sur `http://localhost:8000`), configurez CORS.

#### **6.1 Installer le middleware CORS**
Laravel 11 gère CORS nativement. Modifiez `bootstrap/app.php` :
```php
<?php

use Illuminate\Foundation\Application;

return Application::configure(base_path())
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Assurez-vous que ceci est présent
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

#### **6.2 Configurer `config/cors.php`**
Modifiez `config/cors.php` :
```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

---

### **Étape 7 : Tester le backend**

#### **7.1 Lancer le serveur**
```bash
php artisan serve
```

#### **7.2 Tester avec Postman**
- **GET /api/courses**
  - URL : `http://localhost:8000/api/courses`
  - Résultat attendu : `{"courses": []}` (si vide).

- **POST /api/courses**
  - URL : `http://localhost:8000/api/courses`
  - Méthode : POST
  - Headers : `Content-Type: multipart/form-data`
  - Body (form-data) :
    - `name`: "Cours de conduite"
    - `type`: "common"
    - `file`: (fichier PDF, ex. `test.pdf`)
  - Résultat attendu :
    ```json
    {
      "message": "Cours créé avec succès.",
      "course": {
        "id": 1,
        "name": "Cours de conduite",
        "type": "common",
        "file_path": "courses/[timestamp]_uniqid.pdf",
        "created_at": "...",
        "updated_at": "..."
      }
    }
    ```

- **PUT /api/courses/1 (via POST avec _method=PUT)**
  - URL : `http://localhost:8000/api/courses/1`
  - Méthode : POST
  - Headers : `Content-Type: multipart/form-data`
  - Body (form-data) :
    - `_method`: "PUT"
    - `name`: "Cours modifié"
    - `type`: "specific"
    - `file`: (nouveau PDF, optionnel)
  - Résultat attendu : Mise à jour réussie.

- **DELETE /api/courses/1**
  - URL : `http://localhost:8000/api/courses/1`
  - Méthode : DELETE
  - Résultat attendu : `{"message": "Cours supprimé avec succès."}`

---

### **Étape 8 : Intégration avec le frontend**

Votre backend est maintenant prêt ! Il est compatible avec le frontend Next.js configuré précédemment. Voici les points à vérifier :
1. **URL de base dans `src/lib/api/courseApi.ts`** :
   ```tsx
   const api = axios.create({
     baseURL: "http://localhost:8000/api",
     headers: {
       "Content-Type": "multipart/form-data",
     },
   });
   ```
   Assurez-vous que cela correspond au port de `php artisan serve`.

2. **Lien des fichiers PDF** :
   - Les fichiers sont accessibles via `http://localhost:8000/storage/[file_path]`, ce qui est déjà intégré dans le frontend (`<a href={`/storage/${value}`}>`).

---

### **Résultat final**
- **Backend** : Une API RESTful complète pour gérer les cours (`/api/courses`) avec upload de PDF, validation, et suppression de fichiers.
- **Fonctionnalités** :
  - Lister tous les cours (GET).
  - Voir un cours spécifique (GET).
  - Ajouter un cours avec PDF (POST).
  - Modifier un cours avec remplacement optionnel du PDF (PUT via POST).
  - Supprimer un cours et son PDF (DELETE).

---

### **Prochaines étapes**
1. Lancez le backend : `php artisan serve`.
2. Lancez le frontend : `npm run dev` dans le dossier Next.js.
3. Accédez à `http://localhost:3000/courses` et testez toutes les fonctionnalités (ajout, modification, suppression).

Si vous rencontrez une erreur ou avez besoin d’ajustements, partagez-moi les détails, et je vous aiderai à finaliser ! Tout est maintenant configuré de zéro à la fin pour être pleinement fonctionnel.
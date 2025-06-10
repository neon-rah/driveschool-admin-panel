<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary(); // Clé primaire basée sur l’email
            $table->string('token');            // Token de réinitialisation
            $table->timestamp('created_at')->nullable(); // Date de création
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
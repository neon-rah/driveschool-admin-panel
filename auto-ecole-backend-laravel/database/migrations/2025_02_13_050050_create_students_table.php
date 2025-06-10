<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('last_name', 50);
            $table->string('first_name', 100)->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone', 10)->nullable();
            $table->string('cin', 12)->nullable()->unique();
            $table->date('birth_date')->nullable();
            $table->enum('gender', [1, 2])->nullable();
            $table->string('profile_picture');
            $table->string('residence_certificate');
            $table->string('password')->nullable();
            $table->string('previous_license')->nullable();
            $table->string('payment_receipt');
            $table->foreignId('training_id')->nullable()->constrained('trainings')->onDelete('set null');
            $table->enum('status', ['pending', 'validated', 'rejected'])->default('pending');            
            $table->timestamps();
            $table->softDeletes();
        });



    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

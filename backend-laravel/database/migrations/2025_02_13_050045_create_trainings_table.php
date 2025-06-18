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
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100);
            $table->text('description');
            $table->date('start_date');
            $table->unsignedInteger('duration_weeks');
            $table->decimal('price', 10, 2);
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->json('schedule')->nullable();
            $table->date('registration_end_date')->nullable()->after('start_date');
            $table->string('covering',255);
            $table->boolean('is_finished')->default(false);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};

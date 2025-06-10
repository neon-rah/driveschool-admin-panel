<?php

use Illuminate\Support\Facades\Route;

// Routes Web uniquement
Route::get('/', function () {
    return view('welcome');
});
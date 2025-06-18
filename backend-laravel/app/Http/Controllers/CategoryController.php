<?php 

namespace App\Http\Controllers;

use App\Models\Category;

class CategoryController extends Controller
{
public function index()
{
$categories = Category::all(['id', 'name', 'prerequisite_category_id']);
return response()->json($categories, 200);
}
}
<?php

namespace App\Modules\User\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Business\Models\Business;
use App\Modules\Shop\Models\Product;
use App\Modules\User\Models\Favorite;
use App\Modules\Videos\Models\Video;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for the authenticated user
     */
    public function index(Request $request)
    {
        $type = $request->input('type'); // business, video, product

        $query = Favorite::where('user_id', $request->user()->id)
            ->with('favoritable')
            ->orderBy('created_at', 'desc');

        if ($type) {
            $modelMap = [
                'business' => Business::class,
                'video' => Video::class,
                'product' => Product::class,
            ];

            if (isset($modelMap[$type])) {
                $query->where('favoritable_type', $modelMap[$type]);
            }
        }

        $favorites = $query->paginate(20);

        return response()->json($favorites);
    }

    /**
     * Add item to favorites
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:business,video,product',
            'id' => 'required|integer',
        ]);

        $modelMap = [
            'business' => Business::class,
            'video' => Video::class,
            'product' => Product::class,
        ];

        $modelClass = $modelMap[$request->type];

        // Check if item exists
        $item = $modelClass::find($request->id);
        if (! $item) {
            return response()->json([
                'success' => false,
                'message' => ucfirst($request->type).' not found',
            ], 404);
        }

        // Check if already favorited
        $existing = Favorite::where('user_id', $request->user()->id)
            ->where('favoritable_type', $modelClass)
            ->where('favoritable_id', $request->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Item already in favorites',
            ], 400);
        }

        // Create favorite
        $favorite = Favorite::create([
            'user_id' => $request->user()->id,
            'favoritable_type' => $modelClass,
            'favoritable_id' => $request->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Added to favorites',
            'data' => $favorite->load('favoritable'),
        ]);
    }

    /**
     * Remove item from favorites
     */
    public function destroy(Request $request, $id)
    {
        $favorite = Favorite::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $favorite) {
            return response()->json([
                'success' => false,
                'message' => 'Favorite not found',
            ], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Removed from favorites',
        ]);
    }

    /**
     * Check if an item is favorited
     */
    public function check(Request $request, $type, $id)
    {
        $modelMap = [
            'business' => Business::class,
            'video' => Video::class,
            'product' => Product::class,
        ];

        if (! isset($modelMap[$type])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid type',
            ], 400);
        }

        $favorite = Favorite::where('user_id', $request->user()->id)
            ->where('favoritable_type', $modelMap[$type])
            ->where('favoritable_id', $id)
            ->first();

        return response()->json([
            'is_favorited' => $favorite !== null,
            'favorite_id' => $favorite?->id,
        ]);
    }
}

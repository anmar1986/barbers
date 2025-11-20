<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Business\Models\Business;
use App\Modules\Shop\Models\Product;
use App\Modules\Videos\Models\Video;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get users statistics
     */
    public function getUsersStats()
    {
        return response()->json([
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'business' => User::where('user_type', 'business')->count(),
            'normal' => User::where('user_type', 'normal')->count(),
        ]);
    }

    /**
     * Get businesses statistics
     */
    public function getBusinessesStats()
    {
        return response()->json([
            'total' => Business::count(),
            'active' => Business::where('status', 'active')->count(),
            'verified' => Business::where('is_verified', true)->count(),
        ]);
    }

    /**
     * Get videos statistics
     */
    public function getVideosStats()
    {
        return response()->json([
            'total' => Video::count(),
            'published' => Video::where('status', 'published')->count(),
            'total_views' => Video::sum('view_count'),
        ]);
    }

    /**
     * Get products statistics
     */
    public function getProductsStats()
    {
        return response()->json([
            'total' => Product::count(),
            'available' => Product::where('is_available', true)->count(),
            'total_views' => Product::sum('view_count'),
        ]);
    }

    /**
     * Get all users
     */
    public function getUsers(Request $request)
    {
        // Check if user is admin
        if ($request->user()->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        $query = User::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('user_type') && $request->input('user_type') !== 'all') {
            $query->where('user_type', $request->input('user_type'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json($users);
    }

    /**
     * Get all businesses
     */
    public function getBusinesses(Request $request)
    {
        $businesses = Business::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($businesses);
    }

    /**
     * Get all videos
     */
    public function getVideos(Request $request)
    {
        $videos = Video::with('business')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($videos);
    }

    /**
     * Get all products
     */
    public function getProducts(Request $request)
    {
        $products = Product::with(['business', 'category'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($products);
    }

    /**
     * Toggle business status
     */
    public function toggleBusinessStatus(Request $request, $uuid)
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();
        $business->status = $request->input('is_active') ? 'active' : 'inactive';
        $business->save();

        return response()->json([
            'success' => true,
            'message' => 'Business status updated successfully',
        ]);
    }

    /**
     * Toggle business verification
     */
    public function toggleBusinessVerification(Request $request, $uuid)
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();
        $business->is_verified = $request->input('is_verified');
        $business->save();

        return response()->json([
            'success' => true,
            'message' => 'Business verification updated successfully',
        ]);
    }

    /**
     * Delete video
     */
    public function deleteVideo($uuid)
    {
        $video = Video::where('uuid', $uuid)->firstOrFail();
        $video->delete();

        return response()->json([
            'success' => true,
            'message' => 'Video deleted successfully',
        ]);
    }

    /**
     * Delete product
     */
    public function deleteProduct($uuid)
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully',
        ]);
    }
}

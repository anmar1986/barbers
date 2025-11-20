<?php

namespace App\Orchid\Screens;

use App\Modules\Shop\Models\Product;
use Orchid\Screen\Screen;
use Orchid\Screen\TD;
use Orchid\Support\Facades\Layout;

class ProductListScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [
            'products' => Product::with(['business', 'category'])
                ->orderBy('created_at', 'desc')
                ->paginate(20),
        ];
    }

    /**
     * The name of the screen displayed in the header.
     */
    public function name(): ?string
    {
        return 'Products';
    }

    /**
     * Display header description.
     */
    public function description(): ?string
    {
        return 'Manage all products in the shop';
    }

    /**
     * The screen's action buttons.
     *
     * @return \Orchid\Screen\Action[]
     */
    public function commandBar(): iterable
    {
        return [];
    }

    /**
     * The screen's layout elements.
     *
     * @return \Orchid\Screen\Layout[]|string[]
     */
    public function layout(): iterable
    {
        return [
            Layout::table('products', [
                TD::make('id', 'ID')
                    ->sort(),

                TD::make('name', 'Product Name')
                    ->sort()
                    ->render(fn (Product $product) => $product->name),

                TD::make('business', 'Business')
                    ->render(fn (Product $product) => $product->business
                        ? $product->business->business_name
                        : 'N/A'),

                TD::make('category', 'Category')
                    ->render(fn (Product $product) => $product->category
                        ? $product->category->name
                        : 'Uncategorized'),

                TD::make('price', 'Price')
                    ->sort()
                    ->render(fn (Product $product) => '$'.number_format($product->price, 2)),

                TD::make('stock_quantity', 'Stock')
                    ->sort()
                    ->render(fn (Product $product) => $product->track_inventory
                        ? $product->stock_quantity
                        : 'Not tracked'),

                TD::make('is_available', 'Status')
                    ->sort()
                    ->render(fn (Product $product) => $product->is_available
                        ? '<span class="badge bg-success">Available</span>'
                        : '<span class="badge bg-danger">Unavailable</span>'),

                TD::make('view_count', 'Views')
                    ->sort()
                    ->render(fn (Product $product) => number_format($product->view_count)),

                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (Product $product) => $product->created_at->format('Y-m-d')),
            ]),
        ];
    }
}

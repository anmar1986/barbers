<?php

namespace App\Orchid\Screens;

use App\Modules\Business\Models\Business;
use Orchid\Screen\Actions\Link;
use Orchid\Screen\Screen;
use Orchid\Screen\TD;
use Orchid\Support\Facades\Layout;

class BusinessListScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [
            'businesses' => Business::with('user')
                ->orderBy('created_at', 'desc')
                ->paginate(20),
        ];
    }

    /**
     * The name of the screen displayed in the header.
     *
     * @return string|null
     */
    public function name(): ?string
    {
        return 'Businesses';
    }

    /**
     * Display header description.
     */
    public function description(): ?string
    {
        return 'Manage all businesses on the platform';
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
            Layout::table('businesses', [
                TD::make('id', 'ID')
                    ->sort(),

                TD::make('business_name', 'Business Name')
                    ->sort()
                    ->render(fn (Business $business) => $business->business_name),

                TD::make('business_type', 'Type')
                    ->sort()
                    ->render(fn (Business $business) => ucfirst(str_replace('_', ' ', $business->business_type))),

                TD::make('user', 'Owner')
                    ->render(fn (Business $business) => $business->user
                        ? "{$business->user->first_name} {$business->user->last_name}"
                        : 'N/A'),

                TD::make('city', 'Location')
                    ->render(fn (Business $business) => $business->city && $business->state
                        ? "{$business->city}, {$business->state}"
                        : 'N/A'),

                TD::make('is_verified', 'Verified')
                    ->sort()
                    ->render(fn (Business $business) => $business->is_verified
                        ? '<span class="badge bg-success">Verified</span>'
                        : '<span class="badge bg-warning">Not Verified</span>'),

                TD::make('status', 'Status')
                    ->sort()
                    ->render(fn (Business $business) => $business->status === 'active'
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-danger">Inactive</span>'),

                TD::make('average_rating', 'Rating')
                    ->render(fn (Business $business) => $business->average_rating
                        ? round($business->average_rating, 1) . ' ⭐'
                        : 'No ratings'),

                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (Business $business) => $business->created_at->format('Y-m-d')),
            ]),
        ];
    }
}

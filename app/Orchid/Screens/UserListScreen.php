<?php

namespace App\Orchid\Screens;

use App\Models\User;
use Orchid\Screen\Actions\Link;
use Orchid\Screen\Screen;
use Orchid\Screen\TD;
use Orchid\Support\Facades\Layout;

class UserListScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [
            'users' => User::filters()
                ->defaultSort('created_at', 'desc')
                ->paginate(20),
        ];
    }

    /**
     * The name of the screen displayed in the header.
     */
    public function name(): ?string
    {
        return 'Users';
    }

    /**
     * Display header description.
     */
    public function description(): ?string
    {
        return 'Manage all users in the platform';
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
            Layout::table('users', [
                TD::make('id', 'ID')
                    ->sort()
                    ->filter(TD::FILTER_NUMERIC),

                TD::make('first_name', 'First Name')
                    ->sort()
                    ->filter(TD::FILTER_TEXT)
                    ->render(fn (User $user) => $user->first_name),

                TD::make('last_name', 'Last Name')
                    ->sort()
                    ->filter(TD::FILTER_TEXT)
                    ->render(fn (User $user) => $user->last_name),

                TD::make('email', 'Email')
                    ->sort()
                    ->filter(TD::FILTER_TEXT),

                TD::make('user_type', 'Type')
                    ->sort()
                    ->filter(TD::FILTER_SELECT, [
                        'normal' => 'Normal',
                        'business' => 'Business',
                        'admin' => 'Admin',
                    ])
                    ->render(fn (User $user) => ucfirst($user->user_type)),

                TD::make('is_active', 'Status')
                    ->sort()
                    ->render(fn (User $user) => $user->is_active
                        ? '<span class="badge bg-success">Active</span>'
                        : '<span class="badge bg-danger">Inactive</span>'),

                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (User $user) => $user->created_at->format('Y-m-d H:i')),

                TD::make('actions', 'Actions')
                    ->render(fn (User $user) => Link::make('View')
                        ->route('platform.systems.users.edit', $user->id)
                        ->icon('eye')
                    ),
            ]),
        ];
    }
}

<?php

namespace App\Orchid\Screens;

use App\Modules\Videos\Models\Video;
use Orchid\Screen\Screen;
use Orchid\Screen\TD;
use Orchid\Support\Facades\Layout;

class VideoListScreen extends Screen
{
    /**
     * Fetch data to be displayed on the screen.
     *
     * @return array
     */
    public function query(): iterable
    {
        return [
            'videos' => Video::with('business')
                ->orderBy('created_at', 'desc')
                ->paginate(20),
        ];
    }

    /**
     * The name of the screen displayed in the header.
     */
    public function name(): ?string
    {
        return 'Videos';
    }

    /**
     * Display header description.
     */
    public function description(): ?string
    {
        return 'Manage all videos on the platform';
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
            Layout::table('videos', [
                TD::make('id', 'ID')
                    ->sort(),

                TD::make('title', 'Title')
                    ->sort()
                    ->render(fn (Video $video) => $video->title ?: 'Untitled'),

                TD::make('business', 'Business')
                    ->render(fn (Video $video) => $video->business
                        ? $video->business->business_name
                        : 'N/A'),

                TD::make('view_count', 'Views')
                    ->sort()
                    ->render(fn (Video $video) => number_format($video->view_count)),

                TD::make('like_count', 'Likes')
                    ->sort()
                    ->render(fn (Video $video) => number_format($video->like_count)),

                TD::make('comment_count', 'Comments')
                    ->sort()
                    ->render(fn (Video $video) => number_format($video->comment_count)),

                TD::make('status', 'Status')
                    ->sort()
                    ->render(fn (Video $video) => match ($video->status) {
                        'published' => '<span class="badge bg-success">Published</span>',
                        'processing' => '<span class="badge bg-info">Processing</span>',
                        'draft' => '<span class="badge bg-warning">Draft</span>',
                        default => '<span class="badge bg-secondary">'.ucfirst($video->status).'</span>',
                    }),

                TD::make('created_at', 'Created')
                    ->sort()
                    ->render(fn (Video $video) => $video->created_at->format('Y-m-d H:i')),
            ]),
        ];
    }
}

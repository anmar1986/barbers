<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get first video
$video = \App\Modules\Videos\Models\Video::first();

if ($video) {
    echo "Video found:\n";
    echo "ID: {$video->id}\n";
    echo "UUID: {$video->uuid}\n";
    echo "Title: {$video->title}\n";
    echo "Video URL (DB): {$video->video_url}\n";

    // Simulate API response
    $resource = new \App\Modules\Videos\Resources\VideoResource($video);
    $response = $resource->toArray(request());

    echo "\nAPI Response:\n";
    echo "Video URL (API): {$response['video_url']}\n";
    echo "Thumbnail URL (API): {$response['thumbnail_url']}\n";
    echo "\nFull API Response:\n";
    echo json_encode($response, JSON_PRETTY_PRINT);
} else {
    echo "No videos found in database.\n";
    echo "Please create a test video first.\n";
}

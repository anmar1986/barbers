<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Modules\Business\Models\Business;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Track an event
     */
    public function trackEvent(Request $request)
    {
        $request->validate([
            'event_type' => 'required|string',
            'event_category' => 'nullable|string',
            'event_label' => 'nullable|string',
            'event_value' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        $this->analyticsService->trackEvent(
            $request->event_type,
            $request->user()?->id,
            $request->event_category,
            $request->event_label,
            $request->event_value,
            $request->metadata ?? []
        );

        return response()->json(['success' => true]);
    }

    /**
     * Get business analytics
     */
    public function getBusinessAnalytics(Request $request)
    {
        $user = $request->user();

        // Get user's business
        $business = Business::where('user_id', $user->id)->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found',
            ], 404);
        }

        $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $analytics = $this->analyticsService->getBusinessAnalytics(
            $business->id,
            $startDate,
            $endDate
        );

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Get platform analytics (admin only)
     */
    public function getPlatformAnalytics(Request $request)
    {
        // Check if user is admin
        if ($request->user()->user_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $analytics = $this->analyticsService->getPlatformAnalytics($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $analytics,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Get real-time analytics
     */
    public function getRealTimeAnalytics(Request $request)
    {
        $analytics = $this->analyticsService->getRealTimeAnalytics();

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get user behavior analytics
     */
    public function getUserBehavior(Request $request)
    {
        $days = $request->input('days', 30);
        $analytics = $this->analyticsService->getUserBehavior($request->user()->id, $days);

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Export analytics report
     */
    public function exportReport(Request $request)
    {
        $user = $request->user();
        $format = $request->input('format', 'json'); // json, csv, pdf

        if ($user->user_type === 'admin') {
            $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));
            $data = $this->analyticsService->getPlatformAnalytics($startDate, $endDate);
        } else {
            $business = Business::where('user_id', $user->id)->first();
            if (!$business) {
                return response()->json(['success' => false, 'message' => 'Business not found'], 404);
            }

            $startDate = $request->input('start_date', now()->subDays(30)->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));
            $data = $this->analyticsService->getBusinessAnalytics($business->id, $startDate, $endDate);
        }

        if ($format === 'csv') {
            return $this->exportToCsv($data, $startDate, $endDate);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Export data to CSV
     */
    private function exportToCsv($data, $startDate, $endDate)
    {
        $filename = "analytics_report_{$startDate}_to_{$endDate}.csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');

            // Write summary data
            fputcsv($file, ['Analytics Summary']);
            fputcsv($file, ['Metric', 'Value']);

            if (isset($data['summary'])) {
                foreach ($data['summary'] as $key => $value) {
                    fputcsv($file, [$key, $value]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

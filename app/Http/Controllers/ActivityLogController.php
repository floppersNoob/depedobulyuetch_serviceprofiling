<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $activities = ActivityLog::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($activities);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'model_type' => 'required|string',
            'model_id' => 'nullable|integer',
            'description' => 'required|string',
        ]);

        $activity = ActivityLog::create($validated);

        return response()->json($activity, 201);
    }
}

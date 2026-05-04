<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploymentStatus;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class EmploymentStatusController extends Controller
{
    public function index()
    {
        return EmploymentStatus::orderBy('status_name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'status_name' => 'required|string|max:255|unique:employment_status',
        ]);

        $status = EmploymentStatus::create($validated);

        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'EmploymentStatus',
            'model_id' => $status->status_id,
            'description' => "Employment status '{$status->status_name}' was added",
        ]);

        return response()->json($status, 201);
    }

    public function show(string $id)
    {
        return EmploymentStatus::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'status_name' => 'required|string|max:255|unique:employment_status,status_name,' . $id . ',status_id',
        ]);

        $status = EmploymentStatus::findOrFail($id);
        $oldName = $status->status_name;
        $status->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'EmploymentStatus',
            'model_id' => $status->status_id,
            'description' => "Employment status '{$oldName}' was updated to '{$status->status_name}'",
        ]);

        return response()->json($status);
    }

    public function destroy(string $id)
    {
        $status = EmploymentStatus::findOrFail($id);

        // Check if status is in use by service records
        $usageCount = \App\Models\ServiceRecord::where('status_id', $id)->count();
        if ($usageCount > 0) {
            return response()->json([
                'message' => "Cannot delete status '{$status->status_name}' because it is used in {$usageCount} service record(s)."
            ], 422);
        }

        $name = $status->status_name;
        $status->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'EmploymentStatus',
            'model_id' => $status->status_id,
            'description' => "Employment status '{$name}' was deleted",
        ]);

        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Office;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;

class OfficeController extends Controller
{
    public function index()
    {
        // Only return offices that are currently in use (from present service records)
        $usedOfficeIds = ServiceRecord::whereNull('date_to')
            ->distinct()
            ->pluck('office_id')
            ->toArray();

        return Office::whereIn('office_id', $usedOfficeIds)
            ->orderBy('department')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'station_place' => 'nullable|string|max:255',
        ]);

        $office = Office::create($validated);

        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'Office',
            'model_id' => $office->office_id,
            'description' => "Office '{$office->department}' was added",
        ]);

        return response()->json($office, 201);
    }

    public function show(string $id)
    {
        return Office::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'department' => 'required|string|max:255',
            'division' => 'nullable|string|max:255',
            'branch' => 'nullable|string|max:255',
            'station_place' => 'nullable|string|max:255',
        ]);

        $office = Office::findOrFail($id);
        $oldDept = $office->department;
        $office->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'Office',
            'model_id' => $office->office_id,
            'description' => "Office '{$oldDept}' was updated to '{$office->department}'",
        ]);

        return response()->json($office);
    }

    public function destroy(string $id)
    {
        $office = Office::findOrFail($id);

        // Check if office is in use by service records
        $usageCount = ServiceRecord::where('office_id', $id)->count();
        if ($usageCount > 0) {
            return response()->json([
                'message' => "Cannot delete office '{$office->department}' because it is used in {$usageCount} service record(s).",
            ], 422);
        }

        $dept = $office->department;
        $office->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'Office',
            'model_id' => $office->office_id,
            'description' => "Office '{$dept}' was deleted",
        ]);

        return response()->json(null, 204);
    }
}

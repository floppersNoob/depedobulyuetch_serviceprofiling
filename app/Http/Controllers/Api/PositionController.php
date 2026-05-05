<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Position;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index()
    {
        // Only return positions that are currently in use (from present service records)
        $usedPositionIds = ServiceRecord::whereNull('date_to')
            ->distinct()
            ->pluck('position_id')
            ->toArray();

        return Position::whereIn('position_id', $usedPositionIds)
            ->orderBy('position_name')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'position_name' => 'required|string|max:255|unique:positions',
        ]);

        $position = Position::create($validated);

        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'Position',
            'model_id' => $position->position_id,
            'description' => "Position '{$position->position_name}' was added",
        ]);

        return response()->json($position, 201);
    }

    public function show(string $id)
    {
        return Position::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'position_name' => 'required|string|max:255|unique:positions,position_name,'.$id.',position_id',
        ]);

        $position = Position::findOrFail($id);
        $oldName = $position->position_name;
        $position->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'Position',
            'model_id' => $position->position_id,
            'description' => "Position '{$oldName}' was updated to '{$position->position_name}'",
        ]);

        return response()->json($position);
    }

    public function destroy(string $id)
    {
        $position = Position::findOrFail($id);

        // Check if position is in use by service records
        $usageCount = ServiceRecord::where('position_id', $id)->count();
        if ($usageCount > 0) {
            return response()->json([
                'message' => "Cannot delete position '{$position->position_name}' because it is used in {$usageCount} service record(s).",
            ], 422);
        }

        $name = $position->position_name;
        $position->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'Position',
            'model_id' => $position->position_id,
            'description' => "Position '{$name}' was deleted",
        ]);

        return response()->json(null, 204);
    }
}

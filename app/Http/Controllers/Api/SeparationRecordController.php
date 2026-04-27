<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeparationRecord;
use Illuminate\Http\Request;

class SeparationRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = SeparationRecord::with('serviceRecord');
        
        if ($request->has('service_id')) {
            $query->where('service_id', $request->input('service_id'));
        }
        
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id|unique:separation_records',
            'separation_date' => 'required|date',
            'cause' => 'required|string|max:255',
        ]);

        $separation = SeparationRecord::create($validated);
        return response()->json($separation, 201);
    }

    public function show(string $id)
    {
        return SeparationRecord::with('serviceRecord')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id',
            'separation_date' => 'required|date',
            'cause' => 'required|string|max:255',
        ]);

        $separation = SeparationRecord::findOrFail($id);
        $separation->update($validated);
        return response()->json($separation);
    }

    public function destroy(string $id)
    {
        $separation = SeparationRecord::findOrFail($id);
        $separation->delete();
        return response()->json(null, 204);
    }
}

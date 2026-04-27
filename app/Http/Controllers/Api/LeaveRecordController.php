<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRecord;
use Illuminate\Http\Request;

class LeaveRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRecord::with('serviceRecord');
        
        if ($request->has('service_id')) {
            $query->where('service_id', $request->input('service_id'));
        }
        
        return $query->orderBy('date_from', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id',
            'leave_type' => 'required|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $leave = LeaveRecord::create($validated);
        return response()->json($leave, 201);
    }

    public function show(string $id)
    {
        return LeaveRecord::with('serviceRecord')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id',
            'leave_type' => 'nullable|string|max:255',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $leave = LeaveRecord::findOrFail($id);
        $leave->update($validated);
        return response()->json($leave);
    }

    public function destroy(string $id)
    {
        $leave = LeaveRecord::findOrFail($id);
        $leave->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\SeparationRecord;
use App\Models\ServiceRecord;
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

        // Log activity
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'SeparationRecord',
            'model_id' => $separation->separation_id,
            'description' => "Separation record ({$validated['cause']}) added for {$employee->surname}, {$employee->given_name}",
        ]);

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
            'separation_date' => 'nullable|date',
            'cause' => 'nullable|string|max:255',
        ]);

        $separation = SeparationRecord::findOrFail($id);
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        $separation->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'SeparationRecord',
            'model_id' => $separation->separation_id,
            'description' => "Separation record updated for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($separation);
    }

    public function destroy(string $id)
    {
        $separation = SeparationRecord::findOrFail($id);
        $serviceRecord = ServiceRecord::find($separation->service_id);
        $employee = Employee::find($serviceRecord->employee_id);
        $separation->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'SeparationRecord',
            'model_id' => $separation->separation_id,
            'description' => "Separation record deleted for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json(null, 204);
    }
}

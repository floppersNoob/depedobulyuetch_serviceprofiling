<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRecord;
use App\Models\ServiceRecord;
use App\Models\Employee;
use App\Models\ActivityLog;
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

        // Log activity
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'LeaveRecord',
            'model_id' => $leave->leave_id,
            'description' => "Leave record ({$validated['leave_type']}) added for {$employee->surname}, {$employee->given_name}",
        ]);

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
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        $leave->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'LeaveRecord',
            'model_id' => $leave->leave_id,
            'description' => "Leave record updated for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($leave);
    }

    public function destroy(string $id)
    {
        $leave = LeaveRecord::findOrFail($id);
        $serviceRecord = ServiceRecord::find($leave->service_id);
        $employee = Employee::find($serviceRecord->employee_id);
        $leave->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'LeaveRecord',
            'model_id' => $leave->leave_id,
            'description' => "Leave record deleted for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json(null, 204);
    }
}

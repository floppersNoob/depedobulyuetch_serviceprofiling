<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Office;
use App\Models\Position;
use App\Models\Employee;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ServiceRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRecord::with(['employee', 'position', 'employmentStatus', 'office']);

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->input('employee_id'));
        }

        return $query->orderBy('date_from', 'desc')->paginate(20);
    }

    private function getOrCreateOffice($stationPlace, $branch)
    {
        // Find existing office by station_place
        $office = Office::where('station_place', $stationPlace)->first();
        
        if (!$office) {
            // Create new office
            $office = Office::create([
                'department' => $stationPlace,
                'station_place' => $stationPlace,
                'branch' => $branch,
            ]);
        }
        
        return $office->office_id;
    }

    private function getOrCreatePosition($positionName)
    {
        // Find existing position by name
        $position = Position::where('position_name', $positionName)->first();
        
        if (!$position) {
            // Create new position
            $position = Position::create([
                'position_name' => $positionName,
            ]);
        }
        
        return $position->position_id;
    }

    public function store(Request $request)
    {
        // Normalize empty strings to null for date fields
        if ($request->has('date_to') && $request->input('date_to') === '') {
            $request->merge(['date_to' => null]);
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'position_id' => 'required|string|max:255',
            'status_id' => 'required|exists:employment_status,status_id',
            'station_place' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get or create office and position
        $officeId = $this->getOrCreateOffice($validated['station_place'], $validated['branch'] ?? null);
        $positionId = $this->getOrCreatePosition($validated['position_id']);
        
        // Close previous "present" record by setting date_to to one day before new date_from
        $previousRecord = ServiceRecord::where('employee_id', $validated['employee_id'])
            ->whereNull('date_to')
            ->orderBy('date_from', 'desc')
            ->first();
            
        if ($previousRecord) {
            $previousRecord->update([
                'date_to' => date('Y-m-d', strtotime($validated['date_from'] . ' -1 day'))
            ]);
        }
        
        $serviceRecord = ServiceRecord::create([
            'employee_id' => $validated['employee_id'],
            'position_id' => $positionId,
            'status_id' => $validated['status_id'],
            'office_id' => $officeId,
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
        ]);

        // Log activity
        $employee = Employee::find($validated['employee_id']);
        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'ServiceRecord',
            'model_id' => $serviceRecord->service_id,
            'description' => "Service record added for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($serviceRecord->load(['position', 'employmentStatus', 'office']), 201);
    }

    public function show(string $id)
    {
        $serviceRecord = ServiceRecord::with(['employee', 'position', 'employmentStatus', 'office', 'salaryHistories', 'leaveRecords', 'separationRecord'])
            ->findOrFail($id);
        return response()->json($serviceRecord);
    }

    public function update(Request $request, string $id)
    {
        // Normalize empty strings to null for date fields
        if ($request->has('date_to') && $request->input('date_to') === '') {
            $request->merge(['date_to' => null]);
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'position_id' => 'required|string|max:255',
            'status_id' => 'required|exists:employment_status,status_id',
            'station_place' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get or create office and position
        $officeId = $this->getOrCreateOffice($validated['station_place'], $validated['branch'] ?? null);
        $positionId = $this->getOrCreatePosition($validated['position_id']);

        $serviceRecord = ServiceRecord::findOrFail($id);
        $employee = Employee::find($validated['employee_id']);
        $serviceRecord->update([
            'employee_id' => $validated['employee_id'],
            'position_id' => $positionId,
            'status_id' => $validated['status_id'],
            'office_id' => $officeId,
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
        ]);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'ServiceRecord',
            'model_id' => $serviceRecord->service_id,
            'description' => "Service record updated for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($serviceRecord->load(['position', 'employmentStatus', 'office']));
    }

    public function destroy(string $id)
    {
        $serviceRecord = ServiceRecord::findOrFail($id);
        $employee = Employee::find($serviceRecord->employee_id);
        $serviceRecord->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'ServiceRecord',
            'model_id' => $serviceRecord->service_id,
            'description' => "Service record deleted for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json(null, 204);
    }
}

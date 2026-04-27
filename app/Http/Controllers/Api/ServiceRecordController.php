<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRecord;
use App\Models\Office;
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'position_id' => 'required|exists:positions,position_id',
            'status_id' => 'required|exists:employment_status,status_id',
            'station_place' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get or create office
        $officeId = $this->getOrCreateOffice($validated['station_place'], $validated['branch'] ?? null);
        
        $serviceRecord = ServiceRecord::create([
            'employee_id' => $validated['employee_id'],
            'position_id' => $validated['position_id'],
            'status_id' => $validated['status_id'],
            'office_id' => $officeId,
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
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
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,employee_id',
            'position_id' => 'required|exists:positions,position_id',
            'status_id' => 'required|exists:employment_status,status_id',
            'station_place' => 'required|string|max:255',
            'branch' => 'nullable|string|max:255',
            'date_from' => 'required|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        // Get or create office
        $officeId = $this->getOrCreateOffice($validated['station_place'], $validated['branch'] ?? null);

        $serviceRecord = ServiceRecord::findOrFail($id);
        $serviceRecord->update([
            'employee_id' => $validated['employee_id'],
            'position_id' => $validated['position_id'],
            'status_id' => $validated['status_id'],
            'office_id' => $officeId,
            'date_from' => $validated['date_from'],
            'date_to' => $validated['date_to'],
        ]);
        return response()->json($serviceRecord->load(['position', 'employmentStatus', 'office']));
    }

    public function destroy(string $id)
    {
        $serviceRecord = ServiceRecord::findOrFail($id);
        $serviceRecord->delete();
        return response()->json(null, 204);
    }
}

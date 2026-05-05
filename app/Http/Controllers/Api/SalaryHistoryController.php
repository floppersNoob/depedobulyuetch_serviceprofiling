<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use App\Models\SalaryHistory;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;

class SalaryHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = SalaryHistory::with('serviceRecord');

        if ($request->has('service_id')) {
            $query->where('service_id', $request->input('service_id'));
        }

        return $query->orderBy('effective_date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id',
            'amount' => 'required|numeric|min:0',
            'rate_unit' => 'required|string|max:255',
            'effective_date' => 'required|date',
        ]);

        $salary = SalaryHistory::create($validated);

        // Log activity
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'SalaryHistory',
            'model_id' => $salary->salary_id,
            'description' => "Salary history added for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($salary, 201);
    }

    public function show(string $id)
    {
        return SalaryHistory::with('serviceRecord')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:service_records,service_id',
            'amount' => 'required|numeric|min:0',
            'rate_unit' => 'required|string|max:255',
            'effective_date' => 'required|date',
        ]);

        $salary = SalaryHistory::findOrFail($id);
        $serviceRecord = ServiceRecord::find($validated['service_id']);
        $employee = Employee::find($serviceRecord->employee_id);
        $salary->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'SalaryHistory',
            'model_id' => $salary->salary_id,
            'description' => "Salary history updated for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json($salary);
    }

    public function destroy(string $id)
    {
        $salary = SalaryHistory::findOrFail($id);
        $serviceRecord = ServiceRecord::find($salary->service_id);
        $employee = Employee::find($serviceRecord->employee_id);
        $salary->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'SalaryHistory',
            'model_id' => $salary->salary_id,
            'description' => "Salary history deleted for {$employee->surname}, {$employee->given_name}",
        ]);

        return response()->json(null, 204);
    }
}

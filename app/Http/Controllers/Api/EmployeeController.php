<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $searchTerms = explode(' ', trim($search));
            $query->where(function ($q) use ($searchTerms) {
                foreach ($searchTerms as $term) {
                    $q->where(function ($subQ) use ($term) {
                        $subQ->where('surname', 'like', "%{$term}%")
                             ->orWhere('given_name', 'like', "%{$term}%")
                             ->orWhere('middle_name', 'like', "%{$term}%");
                    });
                }
            });
        }

        if ($request->has('designation') && $request->input('designation') !== 'all') {
            $query->whereHas('serviceRecords', function ($q) use ($request) {
                $q->where('position_id', $request->input('designation'));
            });
        }

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->whereHas('serviceRecords', function ($q) use ($request) {
                $q->where('status_id', $request->input('status'));
            });
        }

        if ($request->has('alphabet') && $request->input('alphabet') !== 'all') {
            $alphabet = $request->input('alphabet');
            $query->where('surname', 'like', "{$alphabet}%");
        }

        return $query->with(['serviceRecords' => function($query) {
                $query->whereNull('date_to')->orderBy('date_from', 'desc')->limit(1);
            }, 'serviceRecords.position', 'serviceRecords.employmentStatus', 'serviceRecords.office'])
            ->withCount('serviceRecords')
            ->orderBy('surname')
            ->paginate(20);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'surname' => 'required|string|max:255',
            'given_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d'),
            'birth_place' => 'nullable|string|max:255',
        ], [
            'birth_date.before_or_equal' => 'Employee must be at least 18 years old.',
        ]);

        $employee = Employee::create($validated);

        ActivityLog::create([
            'action' => 'created',
            'model_type' => 'Employee',
            'model_id' => $employee->id,
            'description' => "Employee {$employee->surname}, {$employee->given_name} was added",
        ]);

        return response()->json($employee, 201);
    }

    public function show(string $id)
    {
        $employee = Employee::with(['serviceRecords' => function($query) {
                $query->orderBy('date_from', 'asc');
            }, 'serviceRecords.position', 'serviceRecords.employmentStatus', 'serviceRecords.office', 'serviceRecords.salaryHistories', 'serviceRecords.leaveRecords', 'serviceRecords.separationRecord'])
            ->findOrFail($id);
        return response()->json($employee);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'surname' => 'required|string|max:255',
            'given_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date|before_or_equal:' . now()->subYears(18)->format('Y-m-d'),
            'birth_place' => 'nullable|string|max:255',
        ], [
            'birth_date.before_or_equal' => 'Employee must be at least 18 years old.',
        ]);

        $employee = Employee::findOrFail($id);
        $employee->update($validated);

        ActivityLog::create([
            'action' => 'updated',
            'model_type' => 'Employee',
            'model_id' => $employee->id,
            'description' => "Employee {$employee->surname}, {$employee->given_name} was updated",
        ]);

        return response()->json($employee);
    }

    public function destroy(string $id)
    {
        $employee = Employee::findOrFail($id);
        $employee->delete();

        ActivityLog::create([
            'action' => 'deleted',
            'model_type' => 'Employee',
            'model_id' => $employee->id,
            'description' => "Employee {$employee->surname}, {$employee->given_name} was deleted",
        ]);

        return response()->json(null, 204);
    }
}

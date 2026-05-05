<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class PublicEmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->has('search') && ! empty($request->input('search'))) {
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

        $perPage = min($request->input('per_page', 15), 50);

        return $query->with(['serviceRecords' => function ($query) {
            $query->whereNull('date_to')->orderBy('date_from', 'desc')->limit(1);
        }, 'serviceRecords.position', 'serviceRecords.employmentStatus'])
            ->withCount('serviceRecords')
            ->orderBy('surname')
            ->paginate($perPage)
            ->through(function ($employee) {
                $latestRecord = $employee->serviceRecords->first();

                return [
                    'employee_id' => $employee->employee_id,
                    'surname' => $employee->surname,
                    'given_name' => $employee->given_name,
                    'middle_name' => $employee->middle_name,
                    'birth_date' => $employee->birth_date,
                    'birth_place' => $employee->birth_place,
                    'service_record_count' => $employee->service_records_count,
                    'latest_position' => $latestRecord?->position?->position_name,
                    'latest_status' => $latestRecord?->employmentStatus?->status_name,
                ];
            });
    }

    public function show(string $id)
    {
        $employee = Employee::with(['serviceRecords' => function ($query) {
            $query->orderBy('date_from', 'asc');
        }, 'serviceRecords.position', 'serviceRecords.employmentStatus', 'serviceRecords.office', 'serviceRecords.salaryHistories'])
            ->findOrFail($id);

        return response()->json([
            'employee' => [
                'employee_id' => $employee->employee_id,
                'surname' => $employee->surname,
                'given_name' => $employee->given_name,
                'middle_name' => $employee->middle_name,
                'birth_date' => $employee->birth_date,
                'birth_place' => $employee->birth_place,
            ],
            'service_records' => $employee->serviceRecords->map(function ($record) {
                return [
                    'service_id' => $record->service_id,
                    'date_from' => $record->date_from,
                    'date_to' => $record->date_to,
                    'station_place' => $record->station_place,
                    'branch' => $record->branch,
                    'remarks' => $record->remarks,
                    'position' => $record->position ? [
                        'position_name' => $record->position->position_name,
                    ] : null,
                    'employment_status' => $record->employmentStatus ? [
                        'status_name' => $record->employmentStatus->status_name,
                    ] : null,
                    'office' => $record->office ? [
                        'office_name' => $record->office->office_name,
                    ] : null,
                    'salary_histories' => $record->salaryHistories->map(function ($salary) {
                        return [
                            'amount' => $salary->amount,
                            'rate_unit' => $salary->rate_unit,
                        ];
                    }),
                ];
            }),
        ]);
    }
}

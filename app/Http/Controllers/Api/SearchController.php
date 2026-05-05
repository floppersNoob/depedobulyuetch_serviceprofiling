<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\ServiceRecord;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $searchType = $request->input('search_type');

        return match ($searchType) {
            'employee' => $this->searchByEmployee($request),
            'position' => $this->searchByPosition($request),
            'date_range' => $this->searchByDateRange($request),
            default => response()->json(['error' => 'Invalid search type'], 400),
        };
    }

    private function searchByEmployee(Request $request)
    {
        $name = $request->input('name');

        return Employee::withCount('serviceRecords')
            ->where(function ($q) use ($name) {
                $q->where('surname', 'like', "%{$name}%")
                    ->orWhere('given_name', 'like', "%{$name}%")
                    ->orWhere('middle_name', 'like', "%{$name}%");
            })
            ->orderBy('surname')
            ->paginate(20);
    }

    private function searchByPosition(Request $request)
    {
        $positionId = $request->input('position_id');

        return ServiceRecord::with(['employee', 'position', 'employmentStatus', 'office'])
            ->where('position_id', $positionId)
            ->orderBy('date_from', 'desc')
            ->paginate(20);
    }

    private function searchByDateRange(Request $request)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        return ServiceRecord::with(['employee', 'position', 'employmentStatus', 'office'])
            ->whereBetween('date_from', [$dateFrom, $dateTo])
            ->orWhereBetween('date_to', [$dateFrom, $dateTo])
            ->orderBy('date_from', 'desc')
            ->paginate(20);
    }
}

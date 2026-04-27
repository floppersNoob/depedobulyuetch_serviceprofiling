<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Office;
use App\Models\Position;
use App\Models\ServiceRecord;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $stats = [
            'employees' => Employee::count(),
            'serviceRecords' => ServiceRecord::count(),
            'positions' => Position::count(),
            'offices' => Office::count(),
        ];

        return response()->json($stats);
    }

    public function recentEmployees()
    {
        $employees = Employee::select('employee_id', 'surname', 'given_name', 'created_at')
            ->withCount('serviceRecords')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json($employees);
    }

    public function activities()
    {
        $activities = ActivityLog::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($activities);
    }

    public function statusDistribution()
    {
        $currentYear = date('Y');

        // Get latest service record for each employee with their status
        $statusCounts = \DB::table('service_records as sr')
            ->select('es.status_name', \DB::raw('COUNT(DISTINCT sr.employee_id) as count'))
            ->join('employment_status as es', 'sr.status_id', '=', 'es.status_id')
            ->whereYear('sr.date_from', '<=', $currentYear)
            ->where(function ($query) use ($currentYear) {
                $query->whereNull('sr.date_to')
                      ->orWhereYear('sr.date_to', '>=', $currentYear);
            })
            ->whereIn('sr.service_id', function ($query) {
                $query->select(\DB::raw('MAX(service_id)'))
                    ->from('service_records')
                    ->groupBy('employee_id');
            })
            ->groupBy('es.status_name')
            ->get();

        return response()->json($statusCounts);
    }
}

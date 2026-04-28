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
        // Get current/present service records only (date_to is null) and count by status
        $statusCounts = \DB::table('service_records as sr')
            ->select('es.status_name', \DB::raw('COUNT(DISTINCT sr.employee_id) as count'))
            ->join('employment_status as es', 'sr.status_id', '=', 'es.status_id')
            ->whereNull('sr.date_to')  // Only current/present records
            ->groupBy('es.status_name')
            ->get();

        return response()->json($statusCounts);
    }
}

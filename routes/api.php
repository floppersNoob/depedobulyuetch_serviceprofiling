<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EmploymentStatusController;
use App\Http\Controllers\Api\LeaveRecordController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\PublicEmployeeController;
use App\Http\Controllers\Api\SalaryHistoryController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SeparationRecordController;
use App\Http\Controllers\Api\ServiceRecordController;
use Illuminate\Support\Facades\Route;

// Public API routes (no auth required)
Route::get('/public/employees', [PublicEmployeeController::class, 'index']);
Route::get('/public/employees/{id}', [PublicEmployeeController::class, 'show']);
Route::get('/public/offices', [OfficeController::class, 'index']);
Route::get('/public/positions', [PositionController::class, 'index']);
Route::get('/public/employment-status', [EmploymentStatusController::class, 'index']);

// Protected API routes
Route::apiResource('employees', EmployeeController::class);

Route::apiResource('service-records', ServiceRecordController::class);

Route::apiResource('positions', PositionController::class);

Route::apiResource('offices', OfficeController::class);

Route::apiResource('employment-status', EmploymentStatusController::class);

Route::apiResource('salary-history', SalaryHistoryController::class);

Route::apiResource('leave-records', LeaveRecordController::class);

Route::apiResource('separation-records', SeparationRecordController::class);

Route::get('/search', [SearchController::class, 'index']);

Route::apiResource('activity-logs', ActivityLogController::class)->only(['index', 'store']);

Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/recent-employees', [DashboardController::class, 'recentEmployees']);
Route::get('/dashboard/activities', [DashboardController::class, 'activities']);
Route::get('/dashboard/status-distribution', [DashboardController::class, 'statusDistribution']);

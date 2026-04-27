<?php

use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\ServiceRecordController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\EmploymentStatusController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SalaryHistoryController;
use App\Http\Controllers\Api\LeaveRecordController;
use App\Http\Controllers\Api\SeparationRecordController;
use App\Http\Controllers\ActivityLogController;
use Illuminate\Support\Facades\Route;

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

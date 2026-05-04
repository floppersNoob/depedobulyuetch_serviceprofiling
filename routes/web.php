<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuthController;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');

// Report Routes (keep for PDF/Excel generation)
Route::get('/reports/employees/excel', [ReportController::class, 'employeesExcel'])->name('reports.employees.excel');
Route::get('/reports/service-record/{employee}/pdf', [ReportController::class, 'serviceRecordPdf'])->name('reports.service_record.pdf');
Route::post('/reports/service-record/{employee}/parse', [ReportController::class, 'parseServiceRecordExcel'])->name('reports.service_record.parse');
Route::post('/reports/service-record/{employee}/confirm', [ReportController::class, 'confirmServiceRecordImport'])->name('reports.service_record.confirm');

// Public Landing Page - Employee Directory (no auth required)
Route::get('/public/{any?}', function () {
    return view('public');
})->where('any', '.*');

// React SPA - catch all routes (exclude API, auth, and public routes) - Protected
Route::middleware(['auth'])->group(function () {
    Route::get('/{any?}', function () {
        return view('app');
    })->where('any', '^(?!api|login|logout|public).*$');
});

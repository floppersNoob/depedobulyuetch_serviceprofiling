<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;

// Report Routes (keep for PDF/Excel generation)
Route::get('/reports/employees/excel', [ReportController::class, 'employeesExcel'])->name('reports.employees.excel');
Route::get('/reports/service-record/{employee}/pdf', [ReportController::class, 'serviceRecordPdf'])->name('reports.service_record.pdf');
Route::post('/reports/service-record/{employee}/parse', [ReportController::class, 'parseServiceRecordExcel'])->name('reports.service_record.parse');
Route::post('/reports/service-record/{employee}/confirm', [ReportController::class, 'confirmServiceRecordImport'])->name('reports.service_record.confirm');

// React SPA - catch all routes (exclude API)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');

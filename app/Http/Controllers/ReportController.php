<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\ServiceRecord;
use App\Models\Position;
use App\Models\EmploymentStatus;
use App\Models\Office;
use App\Models\SalaryHistory;
use App\Models\LeaveRecord;
use App\Models\SeparationRecord;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ReportController extends Controller
{
    /**
     * Show service record PDF for an employee
     */
    public function serviceRecordPdf(string $employeeId)
    {
        $employee = Employee::with(['serviceRecords.position', 'serviceRecords.employmentStatus', 'serviceRecords.office', 'serviceRecords.salaryHistories', 'serviceRecords.leaveRecords', 'serviceRecords.separationRecord'])
            ->findOrFail($employeeId);

        $serviceRecords = $employee->serviceRecords()->orderBy('date_from', 'desc')->get();

        // For now, return a view that can be printed to PDF
        return view('reports.service_record', compact('employee', 'serviceRecords'));
    }

    /**
     * Parse Excel file for preview (doesn't save to database)
     */
    public function parseServiceRecordExcel(Request $request, string $employeeId)
    {
        $request->validate([
            'excel_file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        $employee = Employee::findOrFail($employeeId);

        try {
            $file = $request->file('excel_file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();

            $parsedRecords = [];

            // Skip header rows and find the service record table
            $startRow = 1;
            foreach ($worksheet->getRowIterator() as $row) {
                $rowIndex = $row->getRowIndex();

                // Look for the service table header
                if ($rowIndex > 10) {
                    $cellValue = $worksheet->getCell('A' . $rowIndex)->getValue();
                    if (stripos($cellValue, 'FROM') !== false || stripos($cellValue, 'SERVICE') !== false) {
                        $startRow = $rowIndex + 2; // Skip header rows
                        break;
                    }
                }
            }

            // Process service record rows
            foreach ($worksheet->getRowIterator() as $row) {
                $rowIndex = $row->getRowIndex();

                if ($rowIndex < $startRow) continue;

                // Get values from columns A-J
                $dateFrom = $worksheet->getCell('A' . $rowIndex)->getValue();
                $dateTo = $worksheet->getCell('B' . $rowIndex)->getValue();
                $designation = $worksheet->getCell('C' . $rowIndex)->getValue();
                $status = $worksheet->getCell('D' . $rowIndex)->getValue();
                $salary = $worksheet->getCell('E' . $rowIndex)->getValue();
                $station = $worksheet->getCell('F' . $rowIndex)->getValue();
                $branch = $worksheet->getCell('G' . $rowIndex)->getValue();
                $leave = $worksheet->getCell('H' . $rowIndex)->getValue();
                $separationDate = $worksheet->getCell('I' . $rowIndex)->getValue();
                $separationCause = $worksheet->getCell('J' . $rowIndex)->getValue();

                // Skip empty rows or rows with invalid dates (1970-01-01 indicates parsing error)
                if (empty($dateFrom) && empty($designation)) continue;

                // Skip rows with clearly invalid dates
                if (!empty($dateFrom) && (strtoupper($dateFrom) === 'TO DATE' || strtoupper($dateFrom) === 'PRESENT' || $dateFrom === 0)) {
                    continue;
                }

                // Parse date from Excel
                $parsedDateFrom = null;
                if (!empty($dateFrom) && is_numeric($dateFrom)) {
                    $parsedDateFrom = Date::excelToDateTimeObject($dateFrom)->format('Y-m-d');
                    // Skip if date is 1970-01-01 (invalid)
                    if ($parsedDateFrom === '1970-01-01') continue;
                } elseif (!empty($dateFrom)) {
                    $parsedDateFrom = date('Y-m-d', strtotime($dateFrom));
                    // Skip if date is 1970-01-01 (invalid)
                    if ($parsedDateFrom === '1970-01-01') continue;
                }

                // Skip rows without valid date and designation
                if (empty($parsedDateFrom) && empty($designation)) continue;

                $parsedDateTo = null;
                if (!empty($dateTo)) {
                    // Handle "to date" or "present" as null (ongoing service)
                    if (strtoupper(trim($dateTo)) === 'TO DATE' || strtoupper(trim($dateTo)) === 'PRESENT') {
                        $parsedDateTo = null;
                    } elseif (is_numeric($dateTo)) {
                        $parsedDateTo = Date::excelToDateTimeObject($dateTo)->format('Y-m-d');
                        // Skip if date is 1970-01-01 (invalid)
                        if ($parsedDateTo === '1970-01-01') $parsedDateTo = null;
                    } else {
                        $parsedDateTo = date('Y-m-d', strtotime($dateTo));
                        // Skip if date is 1970-01-01 (invalid)
                        if ($parsedDateTo === '1970-01-01') $parsedDateTo = null;
                    }
                }

                // Parse salary
                $salaryValue = 0;
                $rateUnit = 'annually';
                if (!empty($salary)) {
                    if (is_numeric($salary)) {
                        $salaryValue = floatval($salary);
                    } else {
                        $salaryValue = floatval(preg_replace('/[^0-9.]/', '', $salary));
                        if (stripos($salary, '/d') !== false) {
                            $rateUnit = 'daily';
                        } elseif (stripos($salary, '/an') !== false) {
                            $rateUnit = 'annually';
                        }
                    }
                }

                // Parse separation date
                $parsedSeparationDate = null;
                if (!empty($separationDate) && is_numeric($separationDate)) {
                    $parsedSeparationDate = Date::excelToDateTimeObject($separationDate)->format('Y-m-d');
                } elseif (!empty($separationDate)) {
                    $parsedSeparationDate = date('Y-m-d', strtotime($separationDate));
                }

                $parsedRecords[] = [
                    'date_from' => $parsedDateFrom,
                    'date_to' => $parsedDateTo,
                    'designation' => trim($designation),
                    'status' => trim($status),
                    'salary' => $salaryValue > 0 ? $salaryValue : null,
                    'salary_unit' => $salaryValue > 0 ? $rateUnit : null,
                    'station' => trim($station),
                    'branch' => trim($branch) ?: 'Nat\'l',
                    'leave' => trim($leave),
                    'separation_date' => $parsedSeparationDate,
                    'separation_cause' => trim($separationCause),
                ];
            }

            return response()->json([
                'success' => true,
                'records' => $parsedRecords,
                'count' => count($parsedRecords)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to parse Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm and save parsed service records to database
     */
    public function confirmServiceRecordImport(Request $request, string $employeeId)
    {
        $request->validate([
            'records' => 'required|array'
        ]);

        $employee = Employee::findOrFail($employeeId);
        $records = $request->input('records');
        $importedCount = 0;

        try {
            $importedCount = 0;
            $skippedCount = 0;

            // Ensure records is a numerically indexed array
            $records = array_values($records);

            // Check if all leave records are "none"
            $allLeavesAreNone = true;
            $recordsWithLeave = [];
            foreach ($records as $index => $recordData) {
                if (!empty($recordData['designation'])) {
                    $recordsWithLeave[] = [
                        'index' => $index,
                        'leave' => !empty($recordData['leave']) ? trim($recordData['leave']) : null,
                        'date_from' => $recordData['date_from']
                    ];
                    if (!empty($recordData['leave']) && strtolower(trim($recordData['leave'])) !== 'none') {
                        $allLeavesAreNone = false;
                    }
                }
            }

            // Find the latest record (most recent date_from) for leave handling
            $latestRecordIndex = null;
            if ($allLeavesAreNone && !empty($recordsWithLeave)) {
                usort($recordsWithLeave, function($a, $b) {
                    return strtotime($b['date_from'] ?? '1970-01-01') - strtotime($a['date_from'] ?? '1970-01-01');
                });
                $latestRecordIndex = $recordsWithLeave[0]['index'];
            }

            // Start database transaction for atomic import
            \DB::beginTransaction();

            foreach ($records as $index => $recordData) {
                // Skip rows without designation (required field)
                if (empty($recordData['designation'])) {
                    continue;
                }

                // Create or find position
                $position = Position::firstOrCreate(
                    ['position_name' => $recordData['designation']]
                );

                // Check for duplicate service record (same employee, position, and date_from)
                $existingRecord = ServiceRecord::where('employee_id', $employee->employee_id)
                    ->where('position_id', $position->position_id)
                    ->where('date_from', $recordData['date_from'])
                    ->first();

                if ($existingRecord) {
                    $skippedCount++;
                    continue;
                }

                // Create or find employment status
                $employmentStatus = null;
                if (!empty($recordData['status'])) {
                    $statusName = $recordData['status'];
                    $employmentStatus = EmploymentStatus::firstOrCreate(
                        ['status_name' => $statusName],
                        ['status_code' => substr($statusName, 0, 4)]
                    );
                }

                // Create or find office
                $office = null;
                if (!empty($recordData['station']) || !empty($recordData['branch'])) {
                    $office = Office::firstOrCreate(
                        [
                            'department' => $recordData['station'],
                            'branch' => $recordData['branch'] ?: 'Nat\'l'
                        ]
                    );
                }

                // Create service record
                if ($position) {
                    $serviceRecord = ServiceRecord::create([
                        'employee_id' => $employee->employee_id,
                        'position_id' => $position->position_id,
                        'status_id' => $employmentStatus ? $employmentStatus->status_id : null,
                        'office_id' => $office ? $office->office_id : null,
                        'date_from' => $recordData['date_from'],
                        'date_to' => $recordData['date_to'],
                    ]);

                    // Create salary history
                    if (!empty($recordData['salary'])) {
                        SalaryHistory::create([
                            'service_id' => $serviceRecord->service_id,
                            'amount' => $recordData['salary'],
                            'rate_unit' => $recordData['salary_unit'],
                            'effective_date' => $recordData['date_from'] ?? now(),
                        ]);
                    }

                    // Create leave record with special handling
                    $leaveValue = !empty($recordData['leave']) ? trim($recordData['leave']) : null;
                    if (!empty($leaveValue)) {
                        $shouldCreateLeaveRecord = false;
                        $leaveToCreate = $leaveValue;

                        if ($allLeavesAreNone) {
                            // If all leaves are "none", only create for latest record
                            if ($index === $latestRecordIndex) {
                                $shouldCreateLeaveRecord = true;
                                $leaveToCreate = 'none';
                            } else {
                                // For other records, create with empty string
                                $shouldCreateLeaveRecord = true;
                                $leaveToCreate = '';
                            }
                        } else if (strtolower($leaveValue) !== 'none') {
                            // Normal case: create if not "none"
                            $shouldCreateLeaveRecord = true;
                            $leaveToCreate = $leaveValue;
                        }

                        if ($shouldCreateLeaveRecord) {
                            LeaveRecord::create([
                                'service_id' => $serviceRecord->service_id,
                                'leave_type' => $leaveToCreate,
                                'date_from' => $recordData['date_from'] ?? now(),
                            ]);
                        }
                    }

                    // Create separation record - create if there's a date OR if there's text in cause/remarks
                    if (!empty($recordData['separation_date']) || !empty(trim($recordData['separation_cause'] ?? ''))) {
                        SeparationRecord::create([
                            'service_id' => $serviceRecord->service_id,
                            'separation_date' => $recordData['separation_date'] ?? null,
                            'cause' => trim($recordData['separation_cause'] ?? ''),
                        ]);
                    }

                    $importedCount++;
                }
            }

            // Commit transaction if all records imported successfully
            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully imported {$importedCount} service records" . ($skippedCount > 0 ? " (skipped {$skippedCount} duplicates)" : ""),
                'imported_count' => $importedCount,
                'skipped_count' => $skippedCount
            ]);

        } catch (\Exception $e) {
            // Rollback transaction on any error
            \DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to import records: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export employees to Excel
     */
    public function employeesExcel(Request $request)
    {
        $query = Employee::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('surname', 'like', "%{$search}%")
                  ->orWhere('given_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('surname')->get();

        // For now, return CSV download
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="employees.csv"',
        ];

        $callback = function () use ($employees) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Employee ID', 'Surname', 'Given Name', 'Middle Name', 'Birth Date', 'Birth Place']);

            foreach ($employees as $employee) {
                fputcsv($file, [
                    $employee->employee_id,
                    $employee->surname,
                    $employee->given_name,
                    $employee->middle_name,
                    $employee->birth_date,
                    $employee->birth_place,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

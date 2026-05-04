<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Service Record - {{ $employee->surname }}, {{ $employee->given_name }}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 10px;
            line-height: 1.3;
            margin: 0;
            padding: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header-top {
            font-size: 11px;
            margin-bottom: 2px;
        }
        .header-dept {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 3px;
        }
        .header-office {
            font-size: 11px;
            margin-bottom: 2px;
        }
        .header-address {
            font-size: 10px;
            margin-bottom: 10px;
        }
        .title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 15px 0 5px 0;
        }
        .subtitle {
            text-align: center;
            font-size: 10px;
            font-style: italic;
            margin-bottom: 15px;
        }
        
        /* Employee Info Table */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .info-table td, .info-table th {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: middle;
        }
        .info-table .label {
            font-weight: bold;
            text-align: center;
            background: #fff;
            width: 60px;
        }
        .info-table .value {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
        }
        .info-table .sub-label {
            font-size: 9px;
            text-align: center;
            font-style: italic;
        }
        .info-table .note {
            font-size: 9px;
            vertical-align: top;
            text-align: justify;
        }
        
        /* Certification Text */
        .cert-text {
            font-size: 9px;
            text-align: justify;
            margin: 10px 0;
            line-height: 1.4;
        }
        
        /* Main Service Table */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }
        th, td {
            border: 1px solid #000;
            padding: 3px 4px;
            text-align: center;
            vertical-align: middle;
        }
        th {
            font-weight: bold;
            background: #fff;
            font-size: 9px;
        }
        .main-header {
            font-size: 10px;
            font-weight: bold;
        }
        .sub-header {
            font-size: 9px;
        }
        .data-cell {
            font-size: 9px;
        }
        .left-align {
            text-align: left;
        }
        
        /* Footer */
        .footer {
            margin-top: 20px;
            font-size: 9px;
        }
        .footer-text {
            text-align: center;
            font-style: italic;
            margin-bottom: 15px;
        }
        .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #000;
            width: 200px;
            margin: 0 auto;
            padding-top: 3px;
            font-weight: bold;
        }
        .signature-title {
            font-size: 9px;
            margin-top: 2px;
        }
        .date-box {
            text-align: left;
        }
        
        @media print {
            body { padding: 0; margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="no-print" style="text-align: center; margin-bottom: 15px;">
        <button onclick="window.print()" style="padding: 8px 16px; font-size: 12px; cursor: pointer;">
            Print / Save as PDF
        </button>
    </div>

    <!-- Header -->
    <table style="width: 100%; border: none; margin-bottom: 10px;">
        <tr style="border: none;">
            <td style="border: none; width: 80px; vertical-align: top; text-align: center;">
                <img src="{{ asset('assets/images/DPWH_Logo.png') }}" alt="DPWH Logo" style="width: 70px; height: auto;">
            </td>
            <td style="border: none; text-align: center; vertical-align: middle;">
                <div class="header-top">Republic of the Philippines</div>
                <div class="header-dept">DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS</div>
                <div class="header-office">OFFICE OF THE DISTRICT ENGINEER</div>
                <div class="header-address">Cagayan de Oro 1st District Engineering Office</div>
                <div class="header-address">10th Regional Equipment Services Compound</div>
                <div class="header-address">Bulua, Cagayan de Oro City</div>
            </td>
            <td style="border: none; width: 80px;"></td>
        </tr>
    </table>

    <!-- Title -->
    <div class="title">SERVICE RECORD</div>
    <div class="subtitle">(To Be Accomplished By Employer)</div>

    <!-- Employee Info -->
    <table class="info-table">
        <tr>
            <td rowspan="2" class="label">NAME</td>
            <td class="value">{{ $employee->surname }}</td>
            <td class="value">{{ $employee->given_name }}</td>
            <td class="value">{{ $employee->middle_name }}</td>
            <td rowspan="4" class="note" style="width: 25%;">
                (If married woman, give also full maiden name)<br><br>
                (Data herein should be checked from birth certificate or some other reliable documents)
            </td>
        </tr>
        <tr>
            <td class="sub-label">(Surname)</td>
            <td class="sub-label">(Given Name)</td>
            <td class="sub-label">(Middle Name)</td>
        </tr>
        <tr>
            <td rowspan="2" class="label">BIRTH</td>
            <td class="value">{{ $employee->birth_date ? date('F d, Y', strtotime($employee->birth_date)) : '' }}</td>
            <td class="value" colspan="2">{{ $employee->birth_place ?: '' }}</td>
        </tr>
        <tr>
            <td class="sub-label">(Date)</td>
            <td class="sub-label" colspan="2">(Place)</td>
        </tr>
    </table>

    <!-- Certification Text -->
    <div class="cert-text">
        I hereby certify that the above actually rendered services in this Office as shown by the service record and other papers actually issued by this Office and approved by the authorities concerned.
    </div>

    <!-- Main Service Table -->
    <table>
        <thead>
            <tr>
                <th colspan="2" class="main-header">SERVICE<br><span class="sub-header">(Inclusive Dates)</span></th>
                <th colspan="3" class="main-header">RECORD OF APPOINTMENT</th>
                <th colspan="2" class="main-header">OFFICE ENTITY/DIVISION</th>
                <th rowspan="2" class="main-header">Leave<br>w/o Pay</th>
                <th colspan="2" class="main-header">SEPARATION</th>
                <th rowspan="2" class="main-header">Remarks</th>
            </tr>
            <tr>
                <th class="sub-header">FROM</th>
                <th class="sub-header">TO DATE</th>
                <th class="sub-header">Designation</th>
                <th class="sub-header">Status<br>(1)</th>
                <th class="sub-header">Salary<br>(2)</th>
                <th class="sub-header">Station/Place<br>of assignment</th>
                <th class="sub-header">Branch<br>(3)</th>
                <th class="sub-header">Date</th>
                <th class="sub-header">Cause</th>
                <th class="sub-header"></th>
            </tr>
        </thead>
        <tbody>
            @forelse($serviceRecords as $record)
                @php
                    $salary = $record->salaryHistories->first();
                    $salaryDisplay = '-';
                    if ($salary) {
                        if ($salary->rate_unit === 'daily') {
                            $salaryDisplay = number_format($salary->amount, 2) . '/d';
                        } else {
                            $salaryDisplay = number_format($salary->amount, 2) . '/an';
                        }
                    }
                @endphp
                <tr>
                    <td class="data-cell">{{ date('m/d/y', strtotime($record->date_from)) }}</td>
                    <td class="data-cell">{{ $record->date_to ? date('m/d/y', strtotime($record->date_to)) : 'PRESENT' }}</td>
                    <td class="data-cell left-align">{{ $record->position->position_name ?? '-' }}</td>
                    <td class="data-cell">{{ $record->employmentStatus->status_name ? substr($record->employmentStatus->status_name, 0, 4) : '-' }}</td>
                    <td class="data-cell">{{ $salaryDisplay }}</td>
                    <td class="data-cell left-align">{{ $record->office->department ?? ($record->office->station_place ?? '-') }}</td>
                    <td class="data-cell">{{ $record->office->branch ?? 'Nat\'l' }}</td>
                    <td class="data-cell">
                        @if($record->leaveRecords->count() > 0)
                            {{ $record->leaveRecords->first()->leave_type }}
                        @else
                            None
                        @endif
                    </td>
                    @php
                        $isRealSeparation = $record->separationRecord && $record->separationRecord->separation_date;
                    @endphp
                    <td class="data-cell">{{ $isRealSeparation ? date('m/d/y', strtotime($record->separationRecord->separation_date)) : '' }}</td>
                    <td class="data-cell">{{ $isRealSeparation ? $record->separationRecord->cause : '' }}</td>
                    <td class="data-cell left-align">{{ $record->remarks ?? '' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" style="height: 30px;"></td>
                </tr>
            @endforelse
            <!-- Empty row for additional entry -->
            <tr>
                <td colspan="11" style="height: 20px;"></td>
            </tr>
        </tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
        <div class="footer-text">
            Issued in compliance with Executive Order No. 54 dated August 10, 1954 and in accordance with Circular No. 58 dated<br>
            August 10, 1954 of the system.
        </div>
        
        <table style="border: none; width: 100%;">
            <tr style="border: none;">
                <td style="border: none; width: 50%; text-align: left; vertical-align: bottom;">
                    <div style="margin-top: 20px;">{{ date('F d, Y') }}</div>
                    <div style="font-size: 9px;">Date</div>
                </td>
                <td style="border: none; width: 50%; text-align: center;">
                    <div style="margin-top: 20px;">CERTIFIED CORRECT:</div>
                    <div style="border-top: 1px solid #000; margin-top: 30px; padding-top: 3px; font-weight: bold;">
                        LEAH E. NALIPONGUIT
                    </div>
                    <div style="font-size: 9px;">Administrative Officer V</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>

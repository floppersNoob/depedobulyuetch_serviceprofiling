<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRecord extends Model
{
    protected $primaryKey = 'service_id';

    protected $fillable = ['employee_id', 'position_id', 'status_id', 'office_id', 'date_from', 'date_to', 'station_place', 'branch'];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function employmentStatus()
    {
        return $this->belongsTo(EmploymentStatus::class, 'status_id');
    }

    public function office()
    {
        return $this->belongsTo(Office::class, 'office_id');
    }

    public function salaryHistories()
    {
        return $this->hasMany(SalaryHistory::class, 'service_id');
    }

    public function leaveRecords()
    {
        return $this->hasMany(LeaveRecord::class, 'service_id');
    }

    public function separationRecord()
    {
        return $this->hasOne(SeparationRecord::class, 'service_id');
    }
}

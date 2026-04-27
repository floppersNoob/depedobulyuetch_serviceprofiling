<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $primaryKey = 'employee_id';

    protected $fillable = ['surname', 'given_name', 'middle_name', 'birth_date', 'birth_place'];

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class, 'employee_id')->orderBy('date_from', 'desc');
    }
}

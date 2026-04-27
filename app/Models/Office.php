<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Office extends Model
{
    protected $primaryKey = 'office_id';

    protected $fillable = ['department', 'division', 'branch', 'station_place'];

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class, 'office_id');
    }
}

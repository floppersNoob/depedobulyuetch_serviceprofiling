<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRecord extends Model
{
    protected $primaryKey = 'leave_id';

    protected $fillable = ['service_id', 'leave_type', 'date_from', 'date_to'];

    public function serviceRecord()
    {
        return $this->belongsTo(ServiceRecord::class, 'service_id');
    }
}

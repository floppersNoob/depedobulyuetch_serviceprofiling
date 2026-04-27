<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeparationRecord extends Model
{
    protected $primaryKey = 'separation_id';

    protected $fillable = ['service_id', 'separation_date', 'cause'];

    public function serviceRecord()
    {
        return $this->belongsTo(ServiceRecord::class, 'service_id');
    }
}

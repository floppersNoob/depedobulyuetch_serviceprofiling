<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploymentStatus extends Model
{
    protected $table = 'employment_status';

    protected $primaryKey = 'status_id';

    protected $fillable = ['status_name'];

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class, 'status_id');
    }
}

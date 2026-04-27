<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryHistory extends Model
{
    protected $table = 'salary_history';

    protected $primaryKey = 'salary_id';

    protected $fillable = ['service_id', 'amount', 'rate_unit', 'effective_date'];

    public function serviceRecord()
    {
        return $this->belongsTo(ServiceRecord::class, 'service_id');
    }
}

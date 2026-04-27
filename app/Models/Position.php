<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $primaryKey = 'position_id';

    protected $fillable = ['position_name'];

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class, 'position_id');
    }
}

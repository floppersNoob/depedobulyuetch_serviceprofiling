<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('separation_records')
            ->where('separation_date', '1970-01-01')
            ->update(['separation_date' => null]);
    }

    public function down(): void
    {
        // No rollback needed - these were invalid dates
    }
};

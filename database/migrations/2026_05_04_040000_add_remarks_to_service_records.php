<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_records', function (Blueprint $table) {
            $table->string('remarks')->nullable()->after('branch');
        });

        // Migrate existing remarks from separation_records (where separation_date is null) to the new column
        $remarkRecords = DB::table('separation_records')
            ->whereNull('separation_date')
            ->whereNotNull('cause')
            ->where('cause', '!=', '')
            ->get();

        foreach ($remarkRecords as $record) {
            DB::table('service_records')
                ->where('service_id', $record->service_id)
                ->update(['remarks' => $record->cause]);

            // Delete the separation record since it was just a remark
            DB::table('separation_records')
                ->where('separation_id', $record->separation_id)
                ->delete();
        }
    }

    public function down(): void
    {
        Schema::table('service_records', function (Blueprint $table) {
            $table->dropColumn('remarks');
        });
    }
};

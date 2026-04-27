<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index('created_at');
        });

        Schema::table('service_records', function (Blueprint $table) {
            $table->index('employee_id');
            $table->index(['employee_id', 'date_from']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('service_records', function (Blueprint $table) {
            $table->dropIndex(['employee_id']);
            $table->dropIndex(['employee_id', 'date_from']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};

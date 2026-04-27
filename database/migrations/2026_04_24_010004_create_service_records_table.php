<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_records', function (Blueprint $table) {
            $table->id('service_id');
            $table->foreignId('employee_id')->constrained('employees', 'employee_id')->onDelete('cascade');
            $table->foreignId('position_id')->constrained('positions', 'position_id')->onDelete('restrict');
            $table->foreignId('status_id')->constrained('employment_status', 'status_id')->onDelete('restrict');
            $table->foreignId('office_id')->constrained('offices', 'office_id')->onDelete('restrict');
            $table->date('date_from');
            $table->date('date_to')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_records');
    }
};

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
        Schema::create('salary_history', function (Blueprint $table) {
            $table->id('salary_id');
            $table->foreignId('service_id')->constrained('service_records', 'service_id')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('rate_unit'); // e.g., 'annual'
            $table->date('effective_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_history');
    }
};

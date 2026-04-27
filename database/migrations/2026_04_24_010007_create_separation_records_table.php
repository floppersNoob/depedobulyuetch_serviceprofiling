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
        Schema::create('separation_records', function (Blueprint $table) {
            $table->id('separation_id');
            $table->foreignId('service_id')->constrained('service_records', 'service_id')->onDelete('cascade');
            $table->date('separation_date');
            $table->string('cause');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('separation_records');
    }
};

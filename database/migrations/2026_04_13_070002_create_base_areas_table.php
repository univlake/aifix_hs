<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('base_areas');

        Schema::create('base_areas', function (Blueprint $table) {
            $table->unsignedBigInteger('area_id')->primary();
            $table->unsignedBigInteger('statistical_area_id')->nullable();
            $table->string('area_name', 100);
            $table->unsignedBigInteger('area_parent_id')->nullable();
            $table->unsignedTinyInteger('area_sort')->nullable();
            $table->text('allname')->nullable();
            $table->text('all_childrens_id')->nullable();
            $table->text('parent_ids')->nullable();
            $table->text('parent_ids_withself')->nullable();

            // Indexes
            $table->index('statistical_area_id');
            $table->index('area_parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('base_areas');
    }
};

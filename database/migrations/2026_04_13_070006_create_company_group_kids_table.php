<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('company_group_kids');

        Schema::create('company_group_kids', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('company_group_id');
            $table->unsignedInteger('company_id');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('company_group_id');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_group_kids');
    }
};

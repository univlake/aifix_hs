<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('personnels');

        Schema::create('personnels', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('total_people')->default(0);
            $table->unsignedInteger('staff')->default(0);
            $table->unsignedInteger('service')->default(0);
            $table->unsignedInteger('manager')->default(0);
            $table->unsignedInteger('high_school_diploma')->default(0);
            $table->unsignedInteger('security_officer')->default(0);
            $table->unsignedInteger('safety_engineer')->default(0);
            $table->unsignedInteger('safety_engineering_major')->default(0);
            $table->unsignedInteger('fire_engineer')->default(0);
            $table->unsignedInteger('other')->default(0);
            $table->unsignedInteger('company_id');
            $table->unsignedInteger('user_id')->default(0);
            $table->unsignedInteger('last_user_id')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('company_id');
            $table->index('user_id');
            $table->index('last_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnels');
    }
};

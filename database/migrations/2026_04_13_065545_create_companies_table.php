<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('companies');

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->unsignedInteger('enterprise_type_id')->nullable();
            $table->unsignedInteger('operational_type_id')->default(1);
            $table->unsignedInteger('area_id')->nullable();
            $table->text('address')->nullable();
            $table->date('established')->nullable();
            $table->string('credit_code')->nullable();
            $table->text('business_scope')->nullable();
            $table->text('company_introduction')->nullable();
            $table->decimal('longitude', 10, 6)->nullable();
            $table->decimal('dimension', 10, 6)->nullable();
            $table->text('geographic_range')->nullable();
            $table->decimal('acreage', 10, 3)->nullable();
            $table->string('supervise_name')->nullable();
            $table->string('supervise_tel')->nullable();
            $table->string('supervise_fix')->nullable();
            $table->string('supervise_email')->nullable();
            $table->string('supervise_position')->nullable();
            $table->unsignedInteger('status')->default(0);
            $table->unsignedInteger('pid')->default(0);
            $table->unsignedInteger('is_produce')->default(0);
            $table->unsignedInteger('is_bloc')->default(0);
            $table->double('inherent_risk', 8, 2)->nullable();
            $table->string('inherent_risk_grade')->nullable();
            $table->double('float_risk', 8, 2)->nullable();
            $table->string('float_risk_grade')->nullable();
            $table->unsignedInteger('user_id')->default(0);
            $table->unsignedInteger('last_user_id')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
            $table->index('enterprise_type_id');
            $table->index('operational_type_id');
            $table->index('area_id');
            $table->index('credit_code');
            $table->index('pid');
            $table->index('is_produce');
            $table->index('is_bloc');
            $table->index('user_id');
            $table->index('last_user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};

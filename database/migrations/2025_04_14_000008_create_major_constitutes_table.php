<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('major_constitutes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('构成物质名称')->nullable();
            $table->integer('hazardous_chemical_id')->comment('化学品id')->nullable()->index();
            $table->integer('number')->comment('数量(kg)');
            $table->integer('major_hazard_id')->comment('重大危险源id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('major_constitutes');
    }
};

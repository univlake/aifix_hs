<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accident_bulletin_kids', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('姓名')->nullable();
            $table->string('degree_injury')->comment('受伤程度')->nullable();
            $table->string('department')->comment('部门')->nullable();
            $table->integer('age')->comment('年龄')->nullable();
            $table->string('sex')->comment('性别')->nullable();
            $table->string('work_type')->comment('工种')->nullable();
            $table->integer('work_age')->comment('工龄')->nullable();
            $table->string('education_level')->comment('教育程度')->nullable();
            $table->integer('days_off')->comment('歇工天数')->nullable();
            $table->integer('accident_bulletin_id')->comment('事故快报id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accident_bulletin_kids');
    }
};

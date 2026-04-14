<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_team_kids', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('姓名')->nullable();
            $table->string('department')->comment('部门')->nullable();
            $table->string('content')->comment('职责')->nullable();
            $table->string('tel')->comment('联系电话')->nullable();
            $table->integer('emergency_team_id')->comment('应急队伍id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_team_kids');
    }
};

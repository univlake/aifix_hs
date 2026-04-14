<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_teams', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称')->nullable();
            $table->string('team_number')->comment('队伍编号')->nullable();
            $table->string('save_user')->comment('保管人')->nullable();
            $table->string('tel')->comment('联系电话')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_teams');
    }
};

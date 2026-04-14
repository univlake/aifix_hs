<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_checks', function (Blueprint $table) {
            $table->id();
            $table->float('number_v1')->comment('月报提交打分')->default(0);
            $table->float('number_v2')->comment('年报提交打分')->default(0);
            $table->float('number_v3')->comment('通知型反馈打分')->default(0);
            $table->float('number_v4')->comment('任务型反馈打分')->default(0);
            $table->float('number_v5')->comment('会议打分')->default(0);
            $table->integer('number')->comment('最终得分')->default(0);
            $table->integer('year')->comment('年')->default(2022);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_checks');
    }
};

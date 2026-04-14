<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_checks', function (Blueprint $table) {
            $table->id();
            $table->integer('daily_check_template_id')->comment('所属指标id');
            $table->text('path')->comment('上传附件路径集合')->nullable();
            $table->integer('number')->comment('得分')->default(0);
            $table->text('comment')->comment('评分意见')->nullable();
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
        Schema::dropIfExists('daily_checks');
    }
};

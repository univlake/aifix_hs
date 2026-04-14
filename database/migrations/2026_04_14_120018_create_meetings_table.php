<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('标题')->nullable();
            $table->timestamp('meeting_date')->comment('会议时间')->nullable();
            $table->timestamp('sign_up_date')->comment('报名时间')->nullable();
            $table->timestamp('sign_end_date')->comment('报名截止时间')->nullable();
            $table->string('alert_others')->comment('通知人')->nullable();
            $table->string('theme')->comment('会议主题')->nullable();
            $table->string('place')->comment('会议地点')->nullable();
            $table->text('summary')->comment('会议内容')->nullable();
            $table->text('annex_url')->comment('附件路径')->nullable();
            $table->text('summary_annex_url')->comment('会议纪要附件路径')->nullable();
            $table->text('sign_annex_url')->comment('会议签到附件路径')->nullable();
            $table->text('material_annex_url')->comment('会议资料附件路径')->nullable();
            $table->text('photo_annex_url')->comment('会议照片附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};

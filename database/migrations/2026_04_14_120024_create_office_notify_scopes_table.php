<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_notify_scopes', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('企业名称')->nullable();
            $table->date('feedback_time')->comment('反馈时间')->nullable();
            $table->string('feedback_status')->comment('反馈状态')->default('未反馈');
            $table->text('feedback_annex_url')->comment('反馈附件路径')->nullable();
            $table->integer('office_notify_id')->comment('通知公告id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->string('company_group_name')->comment('集团名称')->nullable();
            $table->integer('company_group_id')->comment('集团id')->nullable()->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_notify_scopes');
    }
};

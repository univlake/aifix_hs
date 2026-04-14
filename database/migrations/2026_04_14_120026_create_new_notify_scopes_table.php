<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('new_notify_scopes', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('企业名称')->nullable();
            $table->date('read_time')->comment('阅读时间')->nullable();
            $table->string('read_status')->comment('阅读状态')->default('未读');
            $table->integer('new_notify_id')->comment('新通知id')->index();
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
        Schema::dropIfExists('new_notify_scopes');
    }
};

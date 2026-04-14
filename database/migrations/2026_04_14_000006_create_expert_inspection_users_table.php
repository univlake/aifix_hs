<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_inspection_users', function (Blueprint $table) {
            $table->id();
            $table->integer('expert_user_id')->comment('专家id')->index();
            $table->integer('expert_company_id')->comment('检查企业id')->index();
            $table->integer('status')->comment('状态')->default(1);
            $table->text('comment')->comment('备注')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_inspection_users');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('three_togethers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称')->nullable();
            $table->string('three_together_type')->comment('三同时类型')->nullable();
            $table->date('establish_time')->comment('设立时间')->nullable();
            $table->string('establish_section')->comment('设立阶段')->nullable();
            $table->string('status')->comment('状态')->nullable();
            $table->integer('design_unit_id')->comment('设计单位id')->nullable()->index();
            $table->text('design_annex_url')->comment('设计附件路径')->nullable();
            $table->integer('evaluation_unit_id')->comment('评价单位id')->nullable()->index();
            $table->date('write_time')->comment('编写时间')->nullable();
            $table->text('construction_comment')->comment('施工情况')->nullable();
            $table->text('safety_requirements')->comment('安全要求')->nullable();
            $table->text('complete_comment')->comment('竣工验收情况')->nullable();
            $table->text('acceptance')->comment('验收意见')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('three_togethers');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_reports', function (Blueprint $table) {
            $table->id();
            $table->date('find_date')->comment('发现时间')->nullable();
            $table->string('name')->comment('姓名');
            $table->string('post')->comment('岗位')->nullable();
            $table->string('type')->comment('职业病类型')->nullable();
            $table->integer('is_true')->comment('鉴定确诊')->nullable();
            $table->string('mechanism')->comment('鉴定机构')->nullable();
            $table->date('identify_date')->comment('鉴定时间')->nullable();
            $table->text('annex_url')->comment('职业病鉴定报告附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_reports');
    }
};

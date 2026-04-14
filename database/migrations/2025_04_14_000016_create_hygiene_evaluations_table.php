<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hygiene_evaluations', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称');
            $table->string('type')->comment('评价或检测类型')->nullable();
            $table->integer('skill_unit_id')->comment('服务机构id')->nullable()->index();
            $table->integer('skill_unit_kid_id')->comment('资质id')->nullable()->index();
            $table->date('valid_period')->comment('报告有效期')->nullable();
            $table->text('annex_url')->comment('附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hygiene_evaluations');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assess_detects', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称');
            $table->string('assess_detect_type')->comment('评价或检测类型');
            $table->integer('skill_unit_id')->index()->comment('服务单位id');
            $table->integer('skill_unit_kid_id')->index()->comment('资质id');
            $table->date('valid_period')->nullable()->comment('有效期');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->index()->comment('企业id');
            $table->integer('user_id')->default(0)->index()->comment('创建人id');
            $table->integer('last_user_id')->default(0)->index()->comment('最后修改人id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assess_detects');
    }
};
